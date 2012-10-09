/* js-inject, with async load and sync parsing 
 * FIXME: Android fails in sync parsing
 */
(function(){
    
    function AppendQueueItem(el,options){
        extend(this, {
            el:el,
            options:options
        });
    }
    var appendQueue = {};

    MirinResourcePlugin.extend({
        pluginId : "js",
        matchExp : /\.js$/i,
        inject: function() {
            var item = this,
                el = this.el = createElement("script"),
                elProperties = {
                    type:"text/javascript",
                    src:item.url
                };
            if ( ie ) {
                // on IE, fetching starts when src property is set, so injection can be delayed
                // see: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
                elProperties.onreadystatechange=function(e){
                    var state = this.readyState;
                    if ( state == 'loaded') {
                        dispatch(ITEM_EVENTS.load,item.options,this,item);
                    } else if ( state == "complete") {
                        this.onreadystatechange=null;
                    }
                };
                extend(el, elProperties);
            } else {
                // Others need the element to be appended to start fetch
                elProperties.onload=function(){
                    dispatch(ITEM_EVENTS.load,item.options,item,item);
                };
                elProperties.async=rootOptions.async;
                extend(el, elProperties);
                document.head.appendChild(el);
                dispatch(ITEM_EVENTS.inject,this.options,this,this);
            }
        },

        onSetLoaded: function(module) {
            // on IE, we inject all scripts when everything is loaded
            // to preserve parsing order
            document.head.appendChild(this.el);
            dispatch(ITEM_EVENTS.inject,this.options,this,this);
        },

        onModuleLoaded: function(module) {

        }
    });

}());
