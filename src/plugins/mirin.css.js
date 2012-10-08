/* css */
(function(){
    MirinResourcePlugin.extend({
        pluginId : "css",
        matchExp : /\.css$/i,
        inject: function() {
            var item = this,
                el = extend(createElement("link"), {
                    rel:"stylesheet",
                    href:item.url
                });
            document.head.appendChild(el);
            dispatch(ITEM_EVENTS.inject,item.options,item,item);
            // FIXME: CSS files are faked to be loaded immediately, since we cant use onload method
            dispatch(ITEM_EVENTS.load,item.options,item,item);
        },

        onSetLoaded: function() {

        },

        onModuleLoaded: function() {

        }
    });
}());
