/* js-inject, with async load and sync parsing 
 * FIXME: Android fails in sync parsing
 */
(function(){
    
    function AppendQueueItem(el,options){
        extend(this, {
            el:el,
            options:options
        });
    }
    var appendQueue = {};

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
                elProperties.async=rootOptions.async;
                extend(el, elProperties);
                document.head.appendChild(el);
                item.dispatchInjectEvent();
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
            // check ie version if is ie
            if ( jsonItem.ie && jsonItem.ie.match(/^[<>!=0-9\s]+$/) && ie && !eval("ie" + jsonItem.ie) ) {
                return false;
            }
            // check default matchItem
            return MirinItem.matchItem.call(this,jsonItem);
        }

        /*

        onModuleLoad: function(module) {

        }

        */
    });

}());
