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
            }, function(){
                // don't get stuck if 404 is returned,
                // it might be part of caching strategy
                item.dispatchLoadEvent();
            });
        },

        remove: function() {
            var i, len;
            for ( i=0,len=this.elements.length; i<len; i++ ) {
                var el = this.elements[i];
                el.parentNode.removeChild(el);
                delete this.elements[i];
            }
        },

        onModuleLoad: function() {
            // inject html includes last, so that possible time without css
            // styles (flash of ugliness) is minimized
            var i, len, els = this.elements;
            for ( i=0,len=els.length; i<len; i++ ) {
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
