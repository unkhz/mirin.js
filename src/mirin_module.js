/* MirinModule */
(function(){
    var defaultOptions = {
            "onItemLoad":null,    // fires when single item of any set is loaded
            "onSetLoad":null,    // fires when a set is loaded
            "onModuleLoad":null, // fires when the whole module is loaded
            "plugins":[]           // enabled plugins
        },
        EVENTS = {
            itemLoad:"itemLoad",
            setLoad:"setLoad",
            moduleLoad:"moduleLoad"
        };


    MirinModule = function(moduleId, aOptions){
        var opts = this.options = extend({},defaultOptions,{"plugins":rootOptions['plugins']},aOptions);
        extend(this,{
            id:moduleId,
            isInitialized:false,
            resources:null,   // resource list
            setCounts:{},     // counts of loaded and injected resources on each set {injected:<int>,loaded:<int>}
            items:[],
            types:[],
            creationTime:new Date().getTime()
        });
    };
    var proto = MirinModule.prototype;

    proto.setIsLoaded = function(type) {
        return this.getEventCount(type,ITEM_EVENTS.init) === this.getEventCount(type,ITEM_EVENTS.load);
    };

    proto.moduleIsLoaded = function() {
        var i, len, type;
        for ( i=0,len=this.types.length; i<len; i++ ) {
            type = this.types[i];
            if ( this.getEventCount(type,ITEM_EVENTS.init) !== this.getEventCount(type,ITEM_EVENTS.load) ) {
                return false;
            }
        }
        return true;
    };

    proto.countEvent = function(item,eventId) {
        var counterObj = this.setCounts[item.pluginId];
        if ( !counterObj ) {
            counterObj = this.setCounts[item.pluginId] = {
                init:0,
                inject:0,
                load:0
            };
        }
        counterObj[eventId]++;
    };

    proto.getEventCount = function(pluginId,eventId){
        var counterObj = this.setCounts[pluginId];
        if ( counterObj && counterObj[eventId]) {
            return counterObj[eventId];
        } else {
            return 0;
        }
    };

    proto.createItem = function(resourceItem, aOptions){
        var i,plugin;
        for ( i in plugins ) {
            plugin = plugins[i];
            if ( plugin.matchItem(resourceItem) && this.options.plugins.indexOf(plugin.pluginId) >= 0 ) {
                return new plugin(this, resourceItem, aOptions);
            }
        }
    };

    proto.inject = function() {
        log("Mirin","injecting module",this.id);
        var i, len,
            module = this,
            set = this.resources,
            injectQueue = [];

        // init phase
        for ( i=0,len=set.length; i<len; i++ ) {
            var item = this.createItem(set[i], {
                onInit:onItemInit,
                onInject:onItemInject,
                onLoad:onItemLoad
            });
            if ( item ) {
                // only initialize items that have an assigned resourcePlugin
                this.items.push(item);
                if ( this.types.indexOf(item.pluginId) === -1 ) this.types.push(item.pluginId);
                injectQueue.push(item);
            } else {
                log("Mirin", "skipped item, no applicable resourcePlugin", set[i]);
            }
        }

        // inject phase
        for ( i=0,len=injectQueue.length; i<len; i++ ) {
            injectQueue[i].inject();
        }


        this.isInitialized=true;
    };

    proto.remove = function() {
        var i,len;
        for ( i=0,len=this.items.length; i<len; i++ ) {
            log("Mirin", "removing", this.id, this.items[i].pluginId, this.items[i].url);
            this.items[i].remove();
            delete this.items[i];
        }
        delete this.items;
        delete Mirin.modules[this.id];
    };

    function onItemInit(item) {
        var module = item.module;
        log("Mirin", "initialized", module.id, item.pluginId, item.url);
        module.countEvent(item, ITEM_EVENTS.init);
    }

    function onItemInject(item) {
        var module = item.module;
        log("Mirin", "injected", module.id, item.pluginId, item.url);
        module.countEvent(item, ITEM_EVENTS.inject);
    }

    function onItemLoad(item) {
        var i,len,
            module = item.module,
            type = item.pluginId;
        log("Mirin", "loaded", module.id, item.pluginId, item.url);
        module.countEvent(item, ITEM_EVENTS.load);

        dispatch(EVENTS.itemLoad, module.options, null, module, item);

        // inform items that the whole set has been loaded
        if ( module.setIsLoaded(type) ) {
            log("Mirin completed loading of", item.pluginId, "set in module", module.id);
            for ( i=0,len=module.items.length; i<len; i++ ) {
                var jtem = module.items[i];
                if ( jtem.pluginId == type ) {
                    jtem.onSetLoad(module);
                }
            }
            dispatch(EVENTS.setLoad, module.options, null, module, type);
        }

        // inform items that the whole module has been loaded
        if ( module.moduleIsLoaded() ) {
            log("Mirin completed loading of module", module.id, "in", new Date().getTime() - module.creationTime, "ms");
            for ( i=0,len=module.items.length; i<len; i++ ) {
                module.items[i].onModuleLoad(module);
            }
            dispatch(EVENTS.moduleLoad, module.options, null, module);
        }
    }
}());