/* MirinModule */
(function(){
    var defaultOptions = {
            onProgress:null,    // fires when single item of any set is loaded
            onSetLoaded:null,    // fires when a set is loaded
            onModuleLoaded:null, // fires when the whole module is loaded
            sets:[]           // sets to inject
        },
        EVENTS = {
            "progress":"progress",
            "setLoaded":"setLoaded",
            "moduleLoaded":"moduleLoaded"
        };

    MirinModule = function(moduleId, aOptions){
        var opts = this.options = extend({},defaultOptions,{sets:rootOptions.sets},aOptions);
        extend(this,{
            id:moduleId,
            isInjected:false,
            resources:null,   // resource list
            setCounts:{},     // counts of loaded and injected resources on each set {injected:<int>,loaded:<int>}
            creationTime:new Date().getTime()
        });
        var sets = opts.sets;
    };
    var proto = MirinModule.prototype;

    proto.setIsLoaded = function(type) {
        var setCountObj = this.setCounts[type];
        return setCountObj ? setCountObj.injected === setCountObj.loaded : false;
    };

    proto.moduleIsLoaded = function() {
        for ( var type in this.resources ) {
            var setCountObj = this.setCounts[type];
            if ( setCountObj && setCountObj.injected !== setCountObj.loaded ) {
                return false;
            }
        }
        return true;
    };

    proto.inject = function() {
        log("Mirin","injecting module",this.id);
        var instance = this,
            injectToDom = document.body.appendChild,
            sets=this.options.sets;
        for ( var i in sets ) {
            var type = sets[i],
                set = this.resources[type],
                setCountObj=this.setCounts[type]={injected:0,loaded:0};
            for ( var j in set ) {
                var item = new MirinItem(set[j], type, this);
                item.inject({
                    onInject:onItemInject,
                    onLoad:onItemLoad
                });
                setCountObj.injected++;
            }
        }
        this.isInjected=true;
    };

    function onItemInject(item) {
        // this = MirinItem
        log("Mirin", "injected", item.module.id, item.resourcePlugin.id, item.url);
    }

    function onItemLoad(item) {
        // this = MirinItem
        var url = item.url, 
            type = item.resourcePlugin.id,
            module = item.module,
            setCountObj = module.setCounts[type];
        dispatch(EVENTS.progress, module.options, module, item);
        setCountObj.loaded++;

        if ( module.setIsLoaded(type) ) {
            log("Mirin completed loading of", type, "set in module", module.id);
        }

        if ( module.moduleIsLoaded() ) {
            log("Mirin completed loading of module", module.id, "in", new Date().getTime() - module.creationTime, "ms");
            dispatch(EVENTS.moduleLoaded, module.options, module, module);
        }
    }
}());