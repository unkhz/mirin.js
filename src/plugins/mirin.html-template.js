/* html-template */
(function(){
    MirinResourcePlugin.extend({
        pluginId : "html-template",
        matchExp : /templates\/.*\.html$/i,
        inject: function() {
            var item = this,
                el = extend(createElement("script"),{
                    type:"text/html"
                });
            document.head.appendChild(el);
            dispatch(ITEM_EVENTS.inject,item.options,item,item);
            fetch(item.url, function(data) {
                el.innerHTML = data;
                dispatch(ITEM_EVENTS.load,item.options,item,item);
            });
        },

        onSetLoaded: function() {

        },

        onModuleLoaded: function() {

        }
    });
}());
