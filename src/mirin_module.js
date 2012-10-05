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