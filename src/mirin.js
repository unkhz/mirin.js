/* Mirin (Static Manager) */
(function(){

    function injectAll() {
        // wait until resources exist
        if (!resources) return;

        for ( var i in modules ) {
            var module = modules[i];
            if ( module.isInitialized === false ) {
                module.resources = resources[module.id];
                module.inject();
            }
        }
    }

    /* public api */
    Mirin = window['Mirin'] = {
        "init":function(aOptions){
            extend(rootOptions,aOptions);

            // initial resource collection
            if ( rootOptions.resources ) {
                resources = rootOptions['resources'];
                injectAll();
            }

            // possibly fetch resource collection from url
            if ( rootOptions.url ) {
                fetch(rootOptions.url, function(data){
                    log("Mirin", "loaded resource collection from", rootOptions.url);
                    resources = JSON.parse(data);
                    injectAll();
                });
            }
        },
        "inject":function(module, aOptions) {
            var moduleId;
            if ( typeof module === "object" ) {
                // custom module, not from resource collection
                moduleId = "custom_" + new Date().getTime();
                modules[moduleId] = new MirinModule(moduleId, aOptions);
                modules[moduleId].resources = module;
                modules[moduleId].inject();
            } else {
                // predefined module from resource collection
                moduleId = module;
                if ( modules[moduleId] ) {
                    throw(new Error("Module already injected"));
                }
                modules[moduleId] = new MirinModule(moduleId, aOptions);
                injectAll();

            }
            return moduleId;
        },
        "remove":function(moduleId) {
            return modules[moduleId].remove();
        },

        "registerPlugin":function(plugin) {
            if ( plugin && plugin.pluginId ) this.plugins[plugin.pluginId] = plugin;
        },

        // Collections
        "modules":modules,
        "resources":resources,
        "plugins":plugins,

        // Classes
        "Utils": {
            ie:ie,
            extend:extend,
            fetch:fetch,
            log:log
        },
        "Item":MirinItem
    };
}());
