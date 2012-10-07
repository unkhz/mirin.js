/* MirinItem */

(function(){

    var defaultOptions = {
        onInject:null,
        onLoad:null
    };

    MirinItem = function(url,type,module) {
        extend(this,{
            module:module,
            resourcePlugin:Mirin.resourcePlugins[type],
            url:url
        });
    }, proto = MirinItem.prototype;

    // inject into DOM
    // not all items are injected
    proto.inject = function(injectOptions) {
        var item = this;

        // perform injection with a type specific method
        this.resourcePlugin.inject(this, {
            onInject:function(closure){
                item.el = closure.el;
                injectOptions.onInject.call(item,item);
            },
            onLoad:function(closure){
                injectOptions.onLoad.call(item,item);
            }
        });
    };

    // fetch with ajax
    // not all items are fetched
    proto.fetch = function(callbackFunction) {
        var item=this;
        fetch(this.url, function(){
            callbackFunction.call(item,response);
        });
    };
}());