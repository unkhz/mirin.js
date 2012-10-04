;
var Mirin;
(function(){
    'use strict';

    var options = {
        url:"resources.json",   // if this is defined, load resource collection from this url
        collection:null,        // if this is defined, use this as the resource collection
        async:false,            // load javascripts asynchronously
        debug:false,            // log debug information
    };


    var resourceCollection = null,
        modules = [];

    function log() {
        if (options.debug && window.console && window.console.log) {
            console.log.apply(console,arguments);
        }
    }

    var MirinModule;
    (function(){
        var MirinModuleOptions = {
            onJsLoad:null,    // fires when single script is loaded
            onJsComplete:null // fires when all module scripts are loaded
        };

        MirinModule = function(moduleId, aOptions){
            this.options = {};
            for ( var i in MirinModuleOptions ) this.options[i] = MirinModuleOptions[i];
            if ( aOptions ) for ( var j in aOptions ) this.options[j] = aOptions[j];
            this.id = moduleId;
            this.isInjected = false;
            this.resources = null;
            this.loadedResources = {
                "js":[],
                "css":[],
                "html":[]
            };
        };

        MirinModule.prototype.onJsLoaded = function(url,e) {
            this.loadedResources.js.push(url);
            if ( this.onJsLoad ) this.onJsComplete.call(this);
            if ( this.loadedResources.js.length == this.resources.js.length ) {
                log("Mirin completed loading of", this.id, "js");
                if ( this.onJsComplete ) this.onJsComplete.call(this);
            }
        };
    }());

    function injectAll() {
        
        // wait until resources exist
        if (!resourceCollection) return;

        for ( var i in modules ) {
            var module = modules[i];
            if ( !resourceCollection[module.id] ||   !resourceCollection[module.id] ) {
                log(module.id, resourceCollection[module.id]);
                throw("Mirin was instructed to inject an invalid module");
            }
            var collection = module.resources = resourceCollection[module.id];
            for ( var type in collection ) {
                var set = collection[type],
                    factoryMethod = ElementFactory[type];
                for ( var i in set ) {
                    var url = set[i];
                    log("Mirin", "Injecting", module.id, type, url);
                    switch ( type ) {
                        case "js":
                        case "css":
                            document.head.appendChild(factoryMethod(url, module));
                            break;
                        case "html":
                            fetchResource(url, function(data) {
                                document.body.innerHTML += data;
                            });
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    var ElementFactory = {
        "js" : function(url, module) {
            var el = document.createElement("script");
            el.type="text/javascript";
            el.src=url;
            el.async=options.async;
            el.onload=function(e){
                module.onJsLoaded.call(module,url,e);
            };
            return el;            
        },
        "css" : function(url, module) {
            var el = document.createElement("link");
            el.rel="stylesheet";
            el.href=url;
            return el;
        }
    };

    function fetchResource(url,callbackFunction) {
        var xhr = new XMLHttpRequest(),
            finished=false;
        xhr.open("GET", url, true);
        xhr.onload = xhr.onreadystatechange = function(e){
            if ( e.target && e.target.responseText && !finished ) {
                log("Mirin", "onResourceFetchComplete", url);
                finished = true;
                callbackFunction.call(self, e.target.responseText);
            }
        };
        xhr.send(null);
    }

    function onResourcesLoaded(data) {
        log("Mirin", "onResourcesLoaded");
        resourceCollection = JSON.parse(data);
        injectAll();
    }

    /* public api */
    var self = Mirin = {
        init:function(aOptions){
            if ( aOptions ) for ( var i in aOptions ) options[i] = aOptions[i];
            log("Mirin", "init");

            // initial resource collection
            if ( options.collection ) {
                resourceCollection = options.collection;
            }

            // possibly fetch collection from url
            if ( options.url ) {
                fetchResource(options.url,onResourcesLoaded);
            }
        },
        inject:function(moduleId, aOptions){
            modules.push(new MirinModule(moduleId, aOptions));
            injectAll();
        },
        modules:modules
    };
}());