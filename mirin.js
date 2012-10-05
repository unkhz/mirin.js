;
var Mirin;

/* Mirin (Singleton) */

(function(){
    'use strict';

    var options = {
        url:"resources.json",   // if this is defined, load resource collection from this url
        collection:null,        // if this is defined, use this as the resource collection
        debug:false,            // log debug information
        sets:["js","css","html"] // resource sets to load
    };

    var resourceCollection = null,
        modules = [];

    function log() {
        if (options.debug && window.console && window.console.log) {
            if ( console.log.apply ) {
                console.log.apply(console,arguments);
            } else {
                var str="";
                for ( var i in arguments ) str += arguments[i] + " ";
                console.log(str);
            }
        }
    }

    function injectAll() {
        
        // wait until resources exist
        if (!resourceCollection) return;

        for ( var i in modules ) {
            var module = modules[i];
            if ( !resourceCollection[module.id] ||   !resourceCollection[module.id] ) {
                log(module.id, resourceCollection[module.id]);
                throw("Mirin was instructed to inject an invalid module");
            }
            module.resources = resourceCollection[module.id];
            module.inject();

        }
    }

    var ElementFactory = {
        "js" : function(url, module) {
            var el = document.createElement("script");
            el.type="text/javascript";
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
            var response;
            try {
                var response=e.target.responseText;
            } catch(e) {}

            if ( response && !finished ) {
                //log("Mirin", "onResourceFetchComplete", url);
                finished = true;
                callbackFunction.call(self, response, url);
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
            if ( !aOptions.sets ) aOptions.sets = options.sets;
            modules.push(new self.Module(moduleId, aOptions));
            injectAll();
        },
        modules:modules,
        log:log,
        ElementFactory:ElementFactory,
        fetchResource:fetchResource
    };
}());


/* Mirin.Module */

(function(root){

    // https://gist.github.com/527683
    var ie = (function(){
        var undef, v = 3, div = document.createElement('div');
        while (
            div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
            div.getElementsByTagName('i')[0]
        );
        return v > 4 ? v : undef;
    }());

    defaultOptions = {
        onProgress:null,    // fires when single item of any set is loaded
        onSetLoaded:null,    // fires when a set is loaded
        onModuleLoaded:null, // fires when the whole module is loaded
        sets:[]           // sets to inject
    };

    var EVENTS = {
        "progress":"progress",
        "setLoaded":"setLoaded",
        "moduleLoaded":"moduleLoaded"
    };

    var MirinModule = function(moduleId, aOptions){
        this.options = {};
        for ( var i in defaultOptions ) this.options[i] = defaultOptions[i];
        if ( aOptions ) for ( var j in aOptions ) this.options[j] = aOptions[j];
        this.id = moduleId;
        this.isInjected = false;
        this.resources = null;
        this.loadedResources = {
            "js":[],
            "css":[],
            "html":[]
        };
        this.appendQueue = {
            "js":[],
            "css":[],
            "html":[]
        }
        this.creationTime = new Date().getTime();
    };

    root.Module = MirinModule;

    var self = MirinModule,
        proto = self.prototype,
        log = root.log;

    proto.setIsLoaded = function(type) {
        return this.loadedResources[type].length == this.resources[type].length;
    };

    proto.moduleIsLoaded = function() {
        for ( var type in this.resources ) {
            if ( this.loadedResources[type].length !== this.resources[type].length ) {
                return false;
            }
        }
        return true;
    };

    proto.dispatch = function(type){
        var callbackName = "on"+ type[0].toUpperCase() + type.slice(1);
        if ( this.options[callbackName] ) {
            this.options[callbackName].apply(this,
                Array.prototype.splice.call(arguments,1)
            );
        }
    };

    proto.onLoad = function(e,type,url) {
        log("Mirin loaded", this.id, type, url);
        this.loadedResources[type].push(url);

        this.dispatch(EVENTS.progress,e,type,url);

        if ( this.setIsLoaded(type) ) {
            log("Mirin completed loading of", type, "set in module", this.id);
            var setAppendQueue = this.appendQueue[type];
            while ( setAppendQueue.length > 0 ) {
                document.body.appendChild(setAppendQueue.shift());
            }
            this.dispatch(EVENTS.setLoaded,e,type);
        }

        if ( this.moduleIsLoaded() ) {
            log("Mirin completed loading of module", this.id, "in", new Date().getTime() - this.creationTime, "ms");
            this.dispatch(EVENTS.moduleLoaded,e);
        }
    };

    proto.inject = function() {
        for ( var type in this.resources ) {
            var set = this.resources[type],
                factoryMethod = root.ElementFactory[type];
            for ( var i in set ) {
                var url = set[i];
                log("Mirin", "injected", this.id, type, url);
                switch ( type ) {
                    case "js":
                        var el = factoryMethod(url, this);
                        el.originalSrc=url;
                        var instance = this;
                        if ( ie ) {
                            log("Mirin","IE style inject", url);    
                            // ie method, see: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                            this.appendQueue.js.push(el);
                            el.onreadystatechange=function(e){
                                if ( this.readyState=='loaded') {
                                    log("Mirin",url,"onload");
                                    instance.onLoad(e,"js",this.originalSrc);
                                } else if ( this.readyState == "complete") {
                                    this.onreadystatechange=null;
                                }
                            };
                            el.async=true;
                            // fetching starts on ie when src property is set
                            el.src=url; 
                        } else {
                            log("Mirin","Webkit style inject", url);    
                            el.onload=function(e){
                                log("Mirin",url,"onload");
                                instance.onLoad(e,"js",this.originalSrc);
                            };
                            el.async=false;
                            el.src=url;  
                            // others need the element to be appended to start fetch
                            document.head.appendChild(el);
                        }
                        break;
                    case "css":
                        document.head.appendChild(factoryMethod(url, this));
                        // FIXME: css is marked loaded instanty, since we don't know when it loads
                        this.onLoad(undefined,type,url);
                        break;
                    case "html":
                        var instance = this;   
                        root.fetchResource(url, function(data, url) {
                            document.body.innerHTML += data;
                            instance.onLoad(undefined,"html",url);
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    };

}(Mirin));