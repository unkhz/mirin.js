;(function(){
    'use strict';

    var root=this,
        MirinModule,
        MirinItem,

        // top level options object, with defaults
        rootOptions = {
            collection:null,        // if this is defined, use this as the initial resource collection
            url:null,               // if this is defined, extend resource collection with json from this url
            debug:false,            // log debug information
            sets:["js","css","html"] // resource sets to load
        },

        // minification optimizations
        arraySlice = Array.prototype.slice,
        createElement = document.createElement,

        // IE detection, https://gist.github.com/527683
        ie = (function(){
            var undef, v = 3, div = document.createElement('div');
            while (
                div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
                div.getElementsByTagName('i')[0]
            );
            return v > 4 ? v : undef;
        }());

    // FIXME: remove this on minified version
    function log() {
        var c = window.console;
        if (rootOptions.debug && c && c.log) {
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

    function extend() {
        var dest = arguments[0],
            rest = arraySlice.call(arguments,1);
        for ( var i in rest ) {
            var src = rest[i];
            if ( src ) for ( var j in src ) dest[j] = src[j];
        }
        return dest;
    }

    /* Mirin (Singleton) */
    (function(){

        var resourceCollection = {},
            modules = [];


        function injectAll() {
            // wait until resources exist
            if (!resourceCollection) return;

            for ( var i in modules ) {
                var module = modules[i];
                if ( module.isInjected === false ) {
                    module.resources = resourceCollection[module.id];
                    module.inject();
                }
            }
        }

        /* public api */
        var self = window.Mirin = {
            init:function(aOptions){
                extend(rootOptions,aOptions);

                // initial resource collection
                if ( rootOptions.collection ) {
                    resourceCollection = rootOptions.collection;
                    injectAll();
                }

                // possibly fetch collection from url
                if ( rootOptions.url ) {
                    var item = new MirinItem(rootOptions.url,'json');
                    item.fetch(function(data){
                        log("Mirin", "loaded resource collection from", rootOptions.url);
                        resourceCollection = JSON.parse(data);
                        injectAll();
                    });
                }
            },
            inject:function(moduleId, aOptions){
                modules.push(new MirinModule(moduleId, aOptions));
                injectAll();
            },
            modules:modules,
            collection:resourceCollection
        };
    }());


    /* MirinModule */
    (function(){
        var defaultOptions = {
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

        MirinModule = function(moduleId, aOptions){
            var opts = this.options = extend({},defaultOptions,{sets:rootOptions.sets},aOptions);
            extend(this,{
                id:moduleId,
                isInjected:false,
                resources:null,
                loadedResources:{},
                appendQueue:{},
                creationTime:new Date().getTime()
            });
            var sets = opts.sets;
            for ( var i in sets ) {
                var type=sets[i];
                this.loadedResources[type] = [];
                this.appendQueue[type] = [];
            }
        };
        var self = MirinModule,
            proto = self.prototype;

        proto.setIsLoaded = function(type) {
            return this.loadedResources[type] ? this.loadedResources[type].length == this.resources[type].length : false;
        };

        proto.moduleIsLoaded = function() {
            for ( var type in this.resources ) {
                if ( this.loadedResources[type] && this.loadedResources[type].length !== this.resources[type].length ) {
                    return false;
                }
            }
            return true;
        };

        proto.dispatch = function(eventName){
            var callbackName = "on"+ eventName[0].toUpperCase() + eventName.slice(1),
                callback = this.options[callbackName];
            if ( callback ) {
                callback.apply(this, arraySlice.call(arguments,1));
            }
        };

        proto.inject = function() {
            log("Mirin","injecting module",this.id);
            var instance = this,
                injectToDom = document.body.appendChild;
            for ( var type in this.resources ) {
                var set = this.resources[type];
                for ( var i in set ) {
                    var item = new MirinItem(set[i], type, this),
                        el;
                    switch ( type ) {
                        case "js":
                            el = createElement("script");
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
                                injectToDom(el);
                            }
                            break;
                        case "css":
                            el = createElement("link");
                            el.mirinItem = item;
                            el.rel="stylesheet";
                            el.href=item.url;
                            injectToDom(el);
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
            this.dispatch(EVENTS.progress,item);
            if ( this.options.sets[type] ) {
                this.loadedResources[type].push(url);

                if ( this.setIsLoaded(type) ) {
                    log("Mirin completed loading of", type, "set in module", this.id);
                    var setAppendQueue = this.appendQueue[type];
                    while ( setAppendQueue.length > 0 ) {
                        injectToDom(setAppendQueue.shift());
                    }
                    this.dispatch(EVENTS.setLoaded,item.type);
                }
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
            var state = this.readyState;
            if ( state == 'loaded') {
                this.mirinItem.module.onLoad(this.mirinItem);
            } else if ( state == "complete") {
                this.onreadystatechange=null;
            }
        }

    }());


    /* MirinItem */

    (function(){
        var self = MirinItem = function(url,type,module) {
            extend(this,{
                module:module,
                type:type,
                url:url
            });
        }, proto = self.prototype;

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
    }());
}());
