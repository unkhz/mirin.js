/* js-inject, with async load and sync parsing
 */
(function(){
    
    // Determine if browser can handle synchronous loading of injected scripts
    // FIXME: more tests should be in this list, currently detects only old Androids
    noSyncParse = (function(){
        return navigator.userAgent.match(/Android [12]\./);
    }());

    // The fallback injection method for browsers that do not support
    // synchronous loading of injected scripts is to keep a static queue of
    // items, and inject them one by one in the correct order
    var injectQueue = [];
    function injectRecursiveFromQueue() {
        if ( injectQueue.length === 0 || injectQueue[0].isLoading ) return;

        var item = injectQueue[0];
        
        item.el.onload = function() {
            item.isLoading = false;
            item.dispatchLoadEvent();
            injectQueue.shift();
            injectRecursiveFromQueue();
        };
        
        item.isLoading = true;
        document.head.appendChild(item.el);
        item.dispatchInjectEvent();
    }

    MirinItem.extend({
        pluginId : "js",
        matchExp : /\.js$/i,
        inject: function() {
            var item = this,
                el = this.el = createElement("script"),
                elProperties = {
                    type:"text/javascript",
                    src:item.url,
                    onerror:function(){
                        // don't get stuck if 404 is returned,
                        // it might be part of caching strategy
                        item.dispatchLoadEvent();
                    }
                };

            if ( ie ) {
                // on IE, fetching starts when src property is set, so injection can be delayed
                // see: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                elProperties.onreadystatechange=function(e){
                    var state = this.readyState;
                    if ( state == 'loaded') {
                        item.dispatchLoadEvent();
                    } else if ( state == "complete") {
                        this.onreadystatechange=null;
                    }
                };
                extend(el, elProperties);
            } else {
                // Others need the element to be appended to start fetch
                elProperties.onload = function(){
                    item.dispatchLoadEvent();
                };
                if ( rootOptions.async ) elProperties.async = true;
                extend(el, elProperties);
                if ( noSyncParse ) {
                    // fallback synchronous injection method
                    injectQueue.push(this);
                    injectRecursiveFromQueue();
                } else {
                    // browser synchronous injection method
                    document.head.appendChild(el);
                    item.dispatchInjectEvent();
                }
            }
        },

        onSetLoad: function(module) {
            // on IE, we inject all scripts when everything is loaded
            // to preserve parsing order
            if ( ie ) {
                document.head.appendChild(this.el);
                this.dispatchInjectEvent();
            }
        },

        matchItem: function(jsonItem) {
            // check default matchItem
            if ( MirinItem.matchItem.call(this,jsonItem) ) {
                // check ie version if is ie
                if ( jsonItem.ie && jsonItem.ie.match(/^[<>!=\s]+[0-9\s]+$/) && !eval("ie" + jsonItem.ie) ) {
                    return false;
                } else {
                    return true;
                }
            }
        }

        /*

        onModuleLoad: function(module) {

        }

        */
    });

}());
