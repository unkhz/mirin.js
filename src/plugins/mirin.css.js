/* CSS injection without waiting for load
 * Respond.js supported for ie8 media queries
 * see: https://github.com/scottjehl/Respond
 */
(function(){
    MirinItem.extend({
        pluginId : "css",
        matchExp : /\.css$/i,
        inject: function() {
            var item = this,
                el = this.el = extend(createElement("link"), {
                    rel:"stylesheet",
                    href:item.url
                });
            document.head.appendChild(el);

            // allow Respond.js to do it's work as soon as possible
            if ( window.respond && respond.update ) respond.update();


            this.dispatchInjectEvent();

            // load event is dispatched immediately, since there is no
            // reliable cross-browser method for listening to the load event.
            // The user agent specific tests and use of cache described in
            // http://www.phpied.com/when-is-a-stylesheet-really-loaded/ are
            // not generic enough for a utility project like Mirin

            // I suggest implementing a project specific plugin, which checks
            // for specific element styles, if the correct sending of the load
            // event is a deal breaker.
            
            this.dispatchLoadEvent();
        }
        
        /*

        onSetLoad: function() {

        },

        onModuleLoad: function() {

        }

        */
    });
}());
