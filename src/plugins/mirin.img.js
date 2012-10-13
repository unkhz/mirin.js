/* img plugin
 * preloads images, without injection
 */
(function(){
    MirinItem.extend({
        pluginId : "img",
        matchExp : /\.(jpg|png|gif|svg)$/i,
        inject: function() {
            var item = this,
                el = this.el = createElement("img"),
                elProperties = {
                    src:item.url,
                    onload:function(){
                        dispatch(ITEM_EVENTS.load,item.options,item,item);
                    }
                };
            extend(el, elProperties);
            el.style.visibility = "hidden";
            //document.head.appendChild(el);
            dispatch(ITEM_EVENTS.inject,this.options,this,this);
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
