/* MirinType (abstract) */
(function(){

    // plugins indexed by their pluginId
    var MirinResourcePlugins = Mirin['resourcePlugins'] = {};

    /* js-inejct */
    (function(){
        
        function AppendQueueItem(el,options){
            extend(this, {
                el:el,
                options:options
            });
        }
        var appendQueue = {};

        MirinResourcePlugins['js'] = MirinResourcePlugin.extend({
            pluginId : "js",
            matchExp : /\.js$/i,
            inject: function() {
                var item = this,
                    el = createElement("script"),
                    elProperties = {
                        type:"text/javascript",
                        src:item.url
                    };
                if ( ie ) {
                    // on IE, fetching starts when src property is set, so injection can be delayed
                    // see: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                    elProperties.onreadystatechange=function(e){
                        var state = this.readyState;
                        if ( state == 'loaded') {
                            dispatch(ITEM_EVENTS.load,this.options,this,item);
                        } else if ( state == "complete") {
                            this.onreadystatechange=null;
                        }
                    };
                    extend(el, elProperties);
                    dispatch(ITEM_EVENTS.init,this.options,this,this);
                } else {
                    // Others need the element to be appended to start fetch
                    elProperties.onload=function(){
                        dispatch(ITEM_EVENTS.load,item.options,item,item);
                    };
                    elProperties.async=rootOptions.async;
                    extend(el, elProperties);
                    document.head.appendChild(el);
                    dispatch(ITEM_EVENTS.inject,this.options,this,this);
                }
            },

            onSetLoaded: function(module) {
                // on IE, we inject all scripts when everything is loaded
                // to preserve parsing order
                document.head.appendChild(this.el);
                dispatch(ITEM_EVENTS.inject,this.options,this,this);
            },

            onModuleLoaded: function(module) {

            }
        });

    }());

    /* css */
    (function(){
        MirinResourcePlugins['css'] = MirinResourcePlugin.extend({
            pluginId : "css",
            matchExp : /\.css$/i,
            inject: function() {
                var item = this,
                    el = extend(createElement("link"), {
                        rel:"stylesheet",
                        href:item.url
                    });
                document.head.appendChild(el);
                dispatch(ITEM_EVENTS.inject,item.options,item,item);
                // FIXME: CSS files are faked to be loaded immediately, since we cant use onload method
                dispatch(ITEM_EVENTS.load,item.options,item,item);
            },

            onSetLoaded: function() {

            },

            onModuleLoaded: function() {

            }
        });

    }());


    /* html-include */
    (function(){
        MirinResourcePlugins['html'] = MirinResourcePlugin.extend({
            pluginId : "html",
            matchExp : /\.html$/i,
            inject: function() {
                var item = this;
                // html-include does not create an element, instead it injects a string
                // which may contain any number of elements or text nodes
                fetch(item.url, function(data) {
                    document.body.innerHTML += data;
                    dispatch(ITEM_EVENTS.inject,item.options,item,item);
                    dispatch(ITEM_EVENTS.load,item.options,item,item);
                });
            },

            onSetLoaded: function() {

            },

            onModuleLoaded: function() {

            }
        });
    }());


    /* html-template */
    (function(){
        MirinResourcePlugins['html-template'] = MirinResourcePlugin.extend({
            pluginId : "html-template",
            matchExp : /templates\/.*\.html$/i,
            inject: function() {
                var item = this,
                    el = extend(createElement("script"),{
                        type:"text/html"
                    });
                document.head.appendChild(el);
                dispatch(ITEM_EVENTS.inject,item.options,item,item);
                fetch(item.url, function(data) {
                    el.innerHTML = data;
                    dispatch(ITEM_EVENTS.load,item.options,item,item);
                });
            },

            onSetLoaded: function() {

            },

            onModuleLoaded: function() {

            }
        });
    }());

}());