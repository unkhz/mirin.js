/* MirinType (abstract) */
(function(){

    var defaultOptions = {
        onInject:null,
        onLoad:null
    };

    var EVENTS = {
        "inject":"inject",
        "load":"load"
    };

    // types indexed by their id
    var MirinResourcePlugins = Mirin.resourcePlugins = {};


    MirinResourcePlugin = {
        id:null,
        inject:function(){},
        onSetLoaded:function(){},
        onModuleLoaded:function(){}
    };


    /* js-inejct */
    (function(){
        var appendQueue = [];
        MirinResourcePlugins.js = {
            id : "js",
            inject: function(item, aOptions) {
                // here, we operate on the function call spefific closure
                var closure = this,
                    closureOptions = extend({},defaultOptions,aOptions),
                    el = createElement("script"),
                    elProperties = {
                        type:"text/javascript",
                        src:item.url
                    };
                if ( ie ) {
                    // on IE, fetching starts when src property is set, so injection can be delayed
                    // see: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                    if (!appendQueue[item.module.id]) appendQueue[item.module.id] = [];
                    appendQueue.push(this);
                    elProperties.onreadystatechange=function(e){
                        var state = this.readyState;
                        if ( state == 'loaded') {
                            dispatch(EVENTS.load,closureOptions,this,closure);
                        } else if ( state == "complete") {
                            this.onreadystatechange=null;
                        }
                    };
                    extend(el, elProperties);
                } else {
                    // Others need the element to be appended to start fetch
                    elProperties.onload=function(){
                        dispatch(EVENTS.load,closureOptions,this,closure);
                    };
                    elProperties.async=rootOptions.async;
                    extend(el, elProperties);
                    document.head.appendChild(el);
                    dispatch(EVENTS.inject,closureOptions,this,closure);
                }
            },

            onSetLoaded: function(module) {
                // on IE, we inject all scripts when everything is loaded
                // to preserve parsing order
                var moduleAppendQueue = appendQueue[module.id];
                while ( moduleAppendQueue.length > 0 ) {
                    var closure = moduleAppendQueue.shift();
                    document.head.appendChild(closure.el);
                    dispatch(EVENTS.inject,closure.closrureOptions,closure,closure);
                }
            },

            onModuleLoaded: function(module) {

            }
        };

    }());

    /* css */
    (function(){
        MirinResourcePlugins.css = {
            id : "css",
            inject: function(item, aOptions) {
                var closure = this,
                    closureOptions = extend({},defaultOptions,aOptions),
                    el = extend(createElement("link"), {
                        rel:"stylesheet",
                        href:item.url
                    });
                document.head.appendChild(el);
                dispatch(EVENTS.inject,closureOptions,this,closure);
                // FIXME: CSS files are faked to be loaded immediately, since we cant use onload method
                dispatch(EVENTS.load,closureOptions,this,closure);
            },

            onSetLoaded: function() {

            },

            onModuleLoaded: function() {

            }
        };

    }());


    /* html-include */
    (function(){
        MirinResourcePlugins['html'] = {
            id : "html",
            inject: function(item, aOptions) {
                var closure = this,
                    closureOptions = extend({},defaultOptions,aOptions);
                fetch(item.url, function(data) {
                    document.body.innerHTML += data;
                    // html-include does not create an element, instead it injects a string
                    // which may contain any number of elements or text nodes
                    dispatch(EVENTS.inject,closureOptions,this,closure);
                    dispatch(EVENTS.load,closureOptions,this,closure);
                });
            },

            onSetLoaded: function() {

            },

            onModuleLoaded: function() {

            }
        };
    }());


    /* html-template */
    (function(){
        MirinResourcePlugins['html-template'] = {
            id : "html-template",
            inject: function(item, aOptions) {
                var closure = this,
                    closureOptions = extend({},defaultOptions,aOptions),
                    el = extend(createElement("script"),{
                        type:"text/html"
                    });
                document.head.appendChild(el);
                dispatch(EVENTS.inject,closureOptions,closure,closure);
                fetch(item.url, function(data) {
                    el.innerHTML = data;
                    dispatch(EVENTS.load,closureOptions,closure,closure);
                });
            },

            onSetLoaded: function() {

            },

            onModuleLoaded: function() {

            }
        };
    }());

}());