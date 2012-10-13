/* html-template */
(function(){
    MirinItem.extend({
        pluginId : "html-template",
        matchExp : /(templates\/.*\.html|tpl\.html|\.hbs)$/i,
        inject: function() {
            var item = this,
                el = this.el = extend(createElement("script"),{
                    type:"text/html",
                    // hsb/dashboard_page.html -> #hsb-dashboard-page
                    id:this.url.replace(/[_\/]/g, "-").replace(/\.h(tml|bs)$/i,'')
                });
            document.head.appendChild(el);
            dispatch(ITEM_EVENTS.inject,item.options,item,item);
            fetch(item.url, function(data) {
                el.innerHTML = data;
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
