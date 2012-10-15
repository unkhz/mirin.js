/* css */
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
            this.dispatchInjectEvent();
            // FIXME: CSS files are faked to be loaded immediately, since we cant use onload method
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
