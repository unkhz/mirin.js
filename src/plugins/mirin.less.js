/* less for less.js on-the-fly compiler 
 *
 * USE FOR DEVELOPMENT VERSIONS ONLY
 *
 */

(function(){
    MirinItem.extend({
        pluginId : "less",
        matchExp : /\.less$/i,
        inject: function() {
            var item = this,
                el = this.el = extend(createElement("link"), {
                    rel:"stylesheet/less",
                    type:"text/css",
                    href:item.url
                });
                
            if ( window.localStorage ) {
                // less.js caches parsed files into localStorage, which
                // provides no use for development, so we turn it off here
                var loc = window.location,
                    keyPrefix = loc.href.replace(/(\?.*)?(#.*)?$/, '') + item.url;

                for (var key in window.localStorage) {
                    if (key.indexOf(keyPrefix) === 0) {
                      delete window.localStorage[key];
                    }
                }
            }

            document.head.appendChild(el);
            dispatch(ITEM_EVENTS.inject,item.options,item,item);
            dispatch(ITEM_EVENTS.load,item.options,item,item);
        }

        /*

        onSetLoaded: function() {

        },

        onModuleLoaded: function() {

        }

        */
    });
}());
