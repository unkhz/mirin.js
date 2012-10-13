/* html-include */
(function(){
    MirinItem.extend({
        pluginId : "html",
        matchExp : /\.html$/i,
        inject: function() {
            var item = this;
            // html-include does not create an element, instead it injects a string
            // which may contain any number of elements or text nodes
            fetch(item.url, function(data) {
                var i, wrap = document.createElement("div");
                wrap.innerHTML += data;
                for ( i = 0; i < wrap.children.length; i++ ) {
                    var el = wrap.children[i];
                    // append elements one by one to avoid full page repaint
                    document.body.appendChild(el);
                }
                dispatch(ITEM_EVENTS.inject,item.options,item,item);
                dispatch(ITEM_EVENTS.load,item.options,item,item);
            });
        }

        /*

        onSetLoad: function() {

        },

        onModuleLoad: function() {

        }

        */
    });
}());
