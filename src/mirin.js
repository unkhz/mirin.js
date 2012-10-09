/* Mirin (Singleton) */
(function(){

    var resourceCollection = null,
        resourcePlugins = {},
        modules = {};

    // plugins indexed by their pluginId
    MirinResourcePlugins = resourcePlugins;

    function injectAll() {
        // wait until resources exist
        if (!resourceCollection) return;

        for ( var i in modules ) {
            var module = modules[i];
            if ( module.isInitialized === false ) {
                module.resources = resourceCollection[module.id];
                module.inject();
            }
        }
    }

    /* public api */
    Mirin = window['Mirin'] = {
        "init":function(aOptions){
            extend(rootOptions,aOptions);

            // initial resource collection
            if ( rootOptions.collection ) {
                resourceCollection = rootOptions['collection'];
                injectAll();
            }

            // possibly fetch collection from url
            if ( rootOptions.url ) {
                fetch(rootOptions.url, function(data){
                    log("Mirin", "loaded resource collection from", rootOptions.url);
                    resourceCollection = JSON.parse(data);
                    injectAll();
                });
            }
        },
        "inject":function(moduleId, aOptions){
            if ( modules[moduleId] ) throw(new Error("Module already injected"));
            modules[moduleId] = new MirinModule(moduleId, aOptions);
            injectAll();
        },
        "modules":modules,
        "collection":resourceCollection,
        "resourcePlugins":resourcePlugins,
        "getResourcePlugin":function(module, resourceCollectionItem, aOptions){
            // factory method
            var i,rp;
            for ( i in this.resourcePlugins ) {
                rp = this.resourcePlugins[i];
                if ( rp.matchItem(resourceCollectionItem) ) {
                    return new rp(module, resourceCollectionItem, aOptions);
                }
            }
        }
    };
}());
