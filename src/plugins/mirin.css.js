/* CSS injection with ff-, opera-, chrome- and ie-compatible method 
 * to determine when loading is finished. This method was described in
 * http://www.phpied.com/when-is-a-stylesheet-really-loaded/
 */
(function(){
    MirinItem.extend({
        pluginId : "css",
        matchExp : /\.css$/i,
        inject: function() {
            var dummy,
                item = this,
                el = this.el = extend(createElement("style"), {
                    textContent:'@import "' + item.url + '"'
                }),
                loadCheckIntervalId = setInterval(function() {
                  try {
                    // error is thrown if resource is not loaded
                    dummy = el.sheet.cssRules;
                    item.dispatchLoadEvent();
                    clearInterval(loadCheckIntervalId);
                  } catch (ee){}
                }, 10);

            document.head.appendChild(el);
            this.dispatchInjectEvent();
        }
        
        /*

        onSetLoad: function() {

        },

        onModuleLoad: function() {

        }

        */
    });
}());
