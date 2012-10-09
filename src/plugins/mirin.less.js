/* less for on-the-fly compiler */
(function(){
    MirinResourcePlugin.extend({
        pluginId : "less",
        matchExp : /\.less$/i,
        inject: function() {
            var item = this,
                el = extend(createElement("link"), {
                    rel:"stylesheet/less",
                    type:"text/css",
                    href:item.url
                });
            document.head.appendChild(el);
            dispatch(ITEM_EVENTS.inject,item.options,item,item);
            dispatch(ITEM_EVENTS.load,item.options,item,item);
        },

        onSetLoaded: function() {

        },

        onModuleLoaded: function() {

        }
    });
}());
