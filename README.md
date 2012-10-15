Mirin.js
========

**M**odular **I**ndependent **R**esource **IN**jection

Many HTML5 applications require precise control of static resource loading. Traditionally all static resource links have been included in the initial html payload, but this approach has numerous disadvantages. Mirin.js is a JavaScript tool for making controlled loading (injection) of static resources simple. It can independently load multiple types of resources with a single function call and unload them all at once with another.

What does it do?
----------------

- Allows making responsive client-side decisions about static resources _before_ they are loaded
- Simplifies splitting of application into independently loaded modules
- Simplifies removing of static resources from memory after they are no longer needed
- Allows using a single JSON resource collection for both development environment and production build system
- Simplifies loading of resources from single files in development environment
- Simplifies minification of resource modules for production environment by enfrocing the use of a single JSON resource collection
- Enables handling of project specific resource types via a simple plugin architecture

Download
--------

TBD

Usage
-----

Mirin is essentially a static resource loader. At startup, you need to initialize Mirin and tell it how to obtain the collection of static resources. You can define all resources at once, but load them on demand one module at a time. While Mirin modules and individual resource items are instances of dynamic classes, Mirin itself is static. You initialize it by calling its init method, with an options object as an argument.

    Mirin.init({
        resources: { 
          bootstrap: [
            'js/bootstrap.js',
            'html/tmpl-header.html',
            'img/header-logo.png',
            'css/header.css'
          ],
          application: [
            'js/application.js',
            'css/application.css',
            'html/tmpl-dashboard.html',
            'html/tmpl-post.html',
            'html/tmpl-footer.html'
          ]
        },
        plugins: ["js","css","img","html"]
    });

If you want to keep resource module definitions in a specific file, or serve them dynamically, you can use the url option parameter. Mirin will fetch the resource collection and make sure it's available before any injections take place.

    Mirin.init({
        url: '/api/resources',
        plugins: ["js","css","img","html"]
    });


As you can see from the two examples above, you can also explicitly specify the set of plugins to be used by default when injecting modules. Plugins are Mirin components that take care of the resource type specific loading and injection procedure. Injection performs slightly faster if only the necessary plugins need to be scanned, so it's good practice to specify them if you know the resource types in advance.

After initialization, you are immediately ready to inject any of the modules specified in the resource collection.

    Mirin.inject("bootstrap");

This will begin the resource loading and injection process. You can add a callback function, which will be called when the module has been completely loaded.

    Mirin.inject("bootstrap", {
        onModuleLoad: function(module) {
            console.log("Bootstrap module injection complete, showing header");
            Bootstrap.buildHeader();
            Mirin.inject("application");
        }
    });

As in initialization options, you can also specify the plugins used for injection of this module.

    Mirin.inject("bootstrap", {
        onModuleLoad: function(module) {
            console.log("All resources belonging to this module have been loaded");
            Bootstrap.buildHeader();
            Mirin.inject("application");
        },
        plugins: ["js"]
    });

During application runtime, it is often necessary to load static resources that are not known at startup time. In these situations, you can inject custom modules on the fly, by giving the resources list in place of the module id. Custom modules behave exactly like predefined modules, except for the fact that they are not defined in the initial resource collection JSON.

    var postSpecificModuleId = Mirin.inject({
        "postdata/image1.jpg",
        "postdata/image2.jpg",
    }, {
        onModuleLoad: function(module) {
            console.log("Postdata images have been preloaded");
            Application.showPost();
        },
        plugins:['img']
    });

The use cases where custom modules are needed often relate to data instead of application UI, so memory handling is probably necessary. All Mirin modules, custom or predefined, can be completely removed from memory at any time.

    Mirin.remove(postSpecificModuleId);
    Mirin.remove("bootstrap");
    Mirin.remove("application");


Building
--------

Mirin uses ANT build system, which depends on Java. If you don't have them already, use your favorite search engine and install both with standard options for your environment. After that, you can build your own version of Mirin with the following commands.

    git clone https://github.com/unkhz/mirin.js
    cd mirin.js
    ant

After build, there will be minified and debug versions of the utility available in the dist folder. Debug version contains optional logging capability, which is completely removed from the minified version to save valuable kilobytes.

By default, all stock plugins are included in the main mirin.js file. If you want to build a version containing only a specific set of plugins to suit your projects needs, you can define the set with the build time plugins property. Use a comma delimited list of plugin ids.

    ant -Dplugins=js,css,html-template


Plugins
-------

Different resource types require different procedures, or gimmicks, to make them asynchronously available for the application. Mirin exposes resource type handling (initialization, loading and injection) as extensible plugins. Generic plugins listed below are included in the default Mirin package. Feel free to create new plugins or extend existing plugins to support your project specific needs.

**Mirin stock plugins**

| Plugin ID     | Purpose                                                                                      |
|---------------|----------------------------------------------------------------------------------------------|
| js            | Asynchronous injection of JavaScript script tags into document head                          |
| css           | Asynchronous injection of CSS link tags into document head                                   |
| img           | Preloading of images when content reflows need to be avoided                                 |
| html          | Loading and injection of generic HTML content into document body                             |
| html-template | Loading and injection of HTML script templates into document head                            |
| less          | Injection of LESS link tags into document head, to be handled by less.js on-the-fly compiler |

Creating custom plugins is pretty straightforward. Basically, you just need to specify how to make your resource available for the application and how to destroy it. Mirin provides a minimal set of functions for object handling and ajax. Generic plugins should avoid all external library dependencies to be as generic as possible, but with project specific plugins you can of course do what's best for the project. Below, a greeter plugin example.

    (function(Mirin){
        window.greeters = {};
        Mirin.Item.extend({
            
            // unique id for the plugin, duplicates get overwritten
            pluginId : "greeter",
     
            // regular expression to determine if a resource belongs to this plugin
            matchExp : /^.*hello[_-]?world.*$/i,
            
            // injection procedure
            inject: function() {
                var item = this;
                fetch(item.url, function(data) {
                    // success
                    window.greeters[item.url] = data;
     
                    // tell Mirin that this resource has been injected to DOM
                    this.dispatchInjectEvent();
     
                    // tell Mirin that this resource has been loaded
                    this.dispatchLoadEvent();
     
                }, function() {
                    // error
                    throw(new Error("Invalid greeter"));
                });
            },
      
            // removal procedure
            remove: function() {
                delete window.greeters[this.url];
            }
        });
    }(Mirin));