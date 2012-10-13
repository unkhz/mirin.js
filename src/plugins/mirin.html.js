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
                document.body.innerHTML += data;
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
