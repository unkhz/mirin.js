/* Mirin (Singleton) */
(function(){

    var resourceCollection = {},
        modules = {};


    function injectAll() {
        // wait until resources exist
        if (!resourceCollection) return;

        for ( var i in modules ) {
            var module = modules[i];
            if ( module.isInjected === false ) {
                module.resources = resourceCollection[module.id];
                module.inject();
            }
        }
    }

    /* public api */
    var self = window.Mirin = {
        init:function(aOptions){
            extend(rootOptions,aOptions);

            // initial resource collection
            if ( rootOptions.collection ) {
                resourceCollection = rootOptions.collection;
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
        inject:function(moduleId, aOptions){
            if ( modules[moduleId] ) throw(new Error("Module already injected"));
            modules[moduleId] = new MirinModule(moduleId, aOptions);
            injectAll();
        },
        modules:modules,
        collection:resourceCollection
    };
}());
