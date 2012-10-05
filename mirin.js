/* Mirin (Singleton) */

;(function(){
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
        var c = window.console;
        if (options.debug && c && c.log) {
            if ( c.log.apply ) {
                c.log.apply(c,arguments);
            } else {
                // IE
                var str="";
                for ( var i in arguments ) str += arguments[i] + " ";
                c.log(str);
            }
        }
    }

    function injectAll() {       
        // wait until resources exist
        if (!resourceCollection) return;

        for ( var i in modules ) {
            var module = modules[i];
            if ( module.isInjected == false ) {
                if ( !resourceCollection[module.id] ||   !resourceCollection[module.id] ) {
                    log(module.id, resourceCollection[module.id]);
                    throw("Mirin was instructed to inject an invalid module");
                }
                module.resources = resourceCollection[module.id];
                module.inject();
            }
        }
    }

    /* public api */
    var self = window.Mirin = {
        init:function(aOptions){
            if ( aOptions ) for ( var i in aOptions ) options[i] = aOptions[i];
            log("Mirin", "init");

            // initial resource collection
            if ( options.collection ) {
                resourceCollection = options.collection;
            }

            // possibly fetch collection from url
            if ( options.url ) {
                self.collectionItem = new self.Item(options.url,'json');
                self.collectionItem.fetch(function(data){
                    log("Mirin", "loaded resource collection from", options.url);
                    resourceCollection = JSON.parse(data);
                    injectAll();
                });
            }
        },
        inject:function(moduleId, aOptions){
            if ( !aOptions.sets ) aOptions.sets = options.sets;
            modules.push(new self.Module(moduleId, aOptions));
            injectAll();
        },
        modules:modules,
        log:log
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
        };
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

    proto.inject = function() {
        log("Mirin","injecting module",this.id);
        var instance = this;
        for ( var type in this.resources ) {
            var set = this.resources[type];
            for ( var i in set ) {
                var item = new root.Item(set[i], type, this),
                    el;
                switch ( type ) {
                    case "js":
                        el = document.createElement("script");
                        el.type="text/javascript";
                        el.mirinItem = item;
                        if ( ie ) {
                            // ie method, see: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                            this.appendQueue.js.push(el);
                            el.onreadystatechange=onJsReadyStateChange;
                            el.async=true;
                            // on IE, fetching starts on ie when src property is set
                            el.src=item.url;
                        } else {
                            el.onload=onJsLoad;
                            el.async=false;
                            el.src=item.url;
                            // others need the element to be appended to start fetch
                            document.head.appendChild(el);
                        }
                        break;
                    case "css":
                        el = document.createElement("link");
                        el.mirinItem = item;
                        el.rel="stylesheet";
                        el.href=item.url;
                        document.head.appendChild(el);
                        // FIXME: css is marked loaded instanty, since we don't know when it loads
                        this.onLoad(item);
                        break;
                    case "html":
                        item.fetch(onHtmlLoad);
                        break;
                    default:
                        break;
                }
                log("Mirin", "injected", this.id, item.type, item.url);
            }
        }
        this.isInjected=true;
    };



    proto.onLoad = function(item) {
        var url = item.url, type = item.type;
        log("Mirin loaded", this.id, item.type, url);
        this.loadedResources[type].push(url);

        this.dispatch(EVENTS.progress,item);

        if ( this.setIsLoaded(type) ) {
            log("Mirin completed loading of", type, "set in module", this.id);
            var setAppendQueue = this.appendQueue[type];
            while ( setAppendQueue.length > 0 ) {
                document.body.appendChild(setAppendQueue.shift());
            }
            this.dispatch(EVENTS.setLoaded,item.type);
        }

        if ( this.moduleIsLoaded() ) {
            log("Mirin completed loading of module", this.id, "in", new Date().getTime() - this.creationTime, "ms");
            this.dispatch(EVENTS.moduleLoaded);
        }
    };

    // HTML load event listener
    // ensure that instance points to module
    function onHtmlLoad(data, url) {
        document.body.innerHTML += data;
        this.module.onLoad(this);
    }

    // non-IE JS load event listener
    // ensure that instance points to module
    function onJsLoad(e) {
        this.mirinItem.module.onLoad(this.mirinItem);
    }

    // IE JS load event listener
    // ensure that instance points to module
    function onJsReadyStateChange(e) {
        if ( this.readyState=='loaded') {
            this.mirinItem.module.onLoad(this.mirinItem);
        } else if ( this.readyState == "complete") {
            this.onreadystatechange=null;
        }
    }

}(Mirin));


/* Mirin.Item */

(function(root){
    var MirinItem = function(url,type,module) {
        this.module = module;
        this.type = type;
        this.url = url;
    };
    root.Item=MirinItem;
    var self = MirinItem,
        proto = self.prototype,
        log = root.log;

    proto.fetch = function(callbackFunction) {
        var xhr = new XMLHttpRequest(),
            finished=false,
            item=this;
        xhr.open("GET", this.url, true);
        xhr.onload = xhr.onreadystatechange = function(e){
            var response;
            try {
                // need to catch error, when xhr is aborted on IE
                response=e.target.responseText;
            } catch(ee) {
            }

            if ( response && !finished ) {
                finished = true;
                callbackFunction.call(item, response, this.url);
            }
        };
        xhr.send(null);
    };
}(Mirin));