/* html-template */
(function(){
    MirinItem.extend({
        pluginId : "html-template",
        matchExp : /(templates\/.*\.html|tpl\.html|\.hbs)$/i,
        inject: function() {
            var item = this,
                el = this.el = extend(createElement("script"),{type:"text/html"});
            // hsb/dashboard_page.html -> #hsb-dashboard-page
            el.id = this.url.replace(/[_\/]/g, "-").replace(/\.h(tml|bs)$/i,'');
            fetch(item.url, function(data) {
                el.text = data;
                document.body.appendChild(el);
                item.dispatchInjectEvent();
                item.dispatchLoadEvent();
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
