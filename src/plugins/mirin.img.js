/* img plugin
 * preloads images, without injection
 */
(function(){
    MirinItem.extend({
        pluginId : "img",
        matchExp : /\.(jpg|jpeg|png|gif|svg)$/i,
        inject: function() {
            var item = this,
                el = this.el = createElement("img"),
                elProperties = {
                    onload:function(){
                        item.dispatchLoadEvent();
                    },
                    onerror:function(){
                        // don't get stuck if 404 is returned,
                        // it might be part of caching strategy
                        item.dispatchLoadEvent();
                    },
                    src:item.url
                };
            extend(el, elProperties);
            el.style.visibility = "hidden";
            //document.head.appendChild(el);
            this.dispatchInjectEvent();
        }

        /*

        remove: function() {
            this.el.parentNode.removeChild(this.el);
        },

        onSetLoad: function(module) {
        },

        onModuleLoad: function(module) {

        }

        */
    });

}());
