;
var Mirin;
(function(){
    'use strict';

    var options = {
        url:"resources.json",   // if this is defined, load resource collection from this url
        collection:null,        // if this is defined, use this as the resource collection
        modules:[],             // modules to inject at startup
        async:false,            // load javascripts asynchronously
        debug:false              // log debug information
    };

    var MirinModule = function(moduleId){
        this.id = moduleId;
        this.isInjected = false;
        this.resources = null;
    };

    var resourceCollection = null,
        modules = [];

    function log() {
        if (options.debug && window.console && window.console.log) {
            console.log.apply(console,arguments);
        }
    }

    function injectAll() {
        
        // wait until resources exist
        if (!resourceCollection) return;

        for ( var i in modules ) {
            var moduleId = modules[i].id;
            if ( !resourceCollection[moduleId] || !resourceCollection[moduleId] ) {
                log(moduleId, resourceCollection[moduleId]);
                throw("Mirin was instructed to inject an invalid module");
            }
            var collection = modules[i].resources = resourceCollection[moduleId];
            for ( var type in collection ) {
                var set = collection[type],
                    factoryMethod = ElementFactory[type];
                for ( var i in set ) {
                    var url = set[i];
                    log("Mirin", "Injecting", moduleId, type, url);
                    switch ( type ) {
                        case "js":
                        case "css":
                            document.head.appendChild(factoryMethod(url));
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
        "js" : function(url) {
            var el = document.createElement("script");
            el.type="text/javascript";
            el.src=url;
            el.async=options.async;
            return el;            
        },
        "css" : function(url) {
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

            // add initial modules to injection queue
            for ( var i in options.modules ) {
                self.inject(options.modules[i]);
            }
        },
        inject:function(moduleId){
            modules.push(new MirinModule(moduleId));
            injectAll();
        },
        modules:modules
    };
}());