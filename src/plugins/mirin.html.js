/* html-include */
(function(){
    MirinItem.extend({
        pluginId : "html",
        matchExp : /\.html$/i,
        inject: function() {
            var item = this;
            this.elements = [];
            // html-include does not create an element, instead it injects a string
            // which may contain any number of elements or text nodes
            fetch(item.url, function(data) {
                var i, wrap = document.createElement("div");
                wrap.innerHTML += data;
                // append elements one by one to avoid full page repaint
                for ( i = 0; i < wrap.children.length; i++ ) {
                    var el = wrap.children[i];
                    item.elements.push(el);
                }
                item.dispatchLoadEvent();
            });
        },

        remove: function() {
            for ( var i in this.elements ) {
                var el = this.elements[i];
                el.parentNode.removeChild(el);
                delete this.elements[i];
            }
        },

        onModuleLoad: function() {
            // inject html includes last, so that possible time without css
            // styles (flash of ugliness) is minimized
            var i, els = this.elements;
            for ( i in els ) {
                document.body.appendChild(els[i]);
            }
            this.dispatchInjectEvent();
        }

        /*

        onSetLoad: function() {

        },


        */
    });
}());
