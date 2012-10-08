/* MirinModule */
(function(){
    var defaultOptions = {
            "onProgress":null,    // fires when single item of any set is loaded
            "onSetLoaded":null,    // fires when a set is loaded
            "onModuleLoaded":null, // fires when the whole module is loaded
            "sets":[]           // sets to inject
        },
        EVENTS = {
            progress:"progress",
            setLoaded:"setLoaded",
            moduleLoaded:"moduleLoaded"
        };


    MirinModule = function(moduleId, aOptions){
        var opts = this.options = extend({},defaultOptions,{"sets":rootOptions['sets']},aOptions);
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
        return this.getEventCount(type,ITEM_EVENTS.init) === this.getEventCount(type,ITEM_EVENTS.inject) === this.getEventCount(type,ITEM_EVENTS.load);
    };

    proto.moduleIsLoaded = function() {
        var i, type;
        for ( i in this.types ) {
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
        if ( this.setCounts && this.setCounts[pluginId] && this.setCounts[pluginId][eventId]) {
            return this.setCounts[pluginId][eventId];
        } else {
            return 0;
        }
    };

    proto.inject = function() {
        log("Mirin","injecting module",this.id,this.resources);
        var i,
            module = this,
            set = this.resources,
            injectQueue = [];

        // init phase
        for ( i in set ) {
            var item = Mirin.getResourcePlugin(module, set[i], {
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
        for ( i in injectQueue ) {
            injectQueue[i].inject();
        }


        this.isInitialized=true;
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
        var i,
            module = item.module,
            type = item.pluginId;
        log("Mirin", "loaded", module.id, item.pluginId, item.url);
        module.countEvent(item, ITEM_EVENTS.load);

        dispatch(EVENTS.progress, module.options, module, item);

        // inform items that the whole set has been loaded
        if ( module.setIsLoaded(type) ) {
            log("Mirin completed loading of", item.pluginId, "set in module", module.id);
            for ( i in module.items ) {
                if ( module.items.pluginId == type ) {
                    module.items[i].onSetLoaded(module);
                }
            }
            dispatch(EVENTS.setLoaded, module.options, module, module, type);
        }

        // inform items that the whole module has been loaded
        if ( module.moduleIsLoaded() ) {
            log("Mirin completed loading of module", module.id, "in", new Date().getTime() - module.creationTime, "ms");
            for ( i in module.items ) {
                module.items[i].onModuleLoaded(module);
            }
            dispatch(EVENTS.moduleLoaded, module.options, module, module);
        }
    }
}());