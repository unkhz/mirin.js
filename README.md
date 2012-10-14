Mirin.js
========

**M**odular **I**ndependent **R**esource **IN**jection

Why?
----

Many HTML5 applications require precise control of static resource loading. Traditionally static resource links have been all included in the initial html payload, but this approach has numerous disadvantages. Mirin.js is a JavaScript tool for making controlled loading (injection) of static resources simple. It can independently load many types of resources with a single function call, at any point in time. And unload them all at once with another single function call.

What does it do?
----------------

- Allows making responsive client-side decisions about static resources _before_ they are loaded
- Simplifies splitting an application into separately loaded modules
- Simplifies removing of unused resources from memory after they are no longer needed
- Allows using a single JSON resource collection for development runtime and build system
- Simplifies organization of CSS, JavaScript and HTML-templates into single files

Modules
-------

Mirin divides static resources into modules. A module is a set of static resource files, like CSS, JavaScript, HTML templates, JSON data, images etc. Depending on your need, a module can include all or only one type of resources. The whole module is injected at once and events are dispatched when loading is complete.

Mirin.js assumes that HTML5 application modules are entities consisting of multiple resource types that are needed to be available at the same time. Lazy loading is achieved by splitting the application into appropriate modules. 


Plugins
-------

Different resource types require different procedures to make them available for the application. Mirin exposes resource type handling as extensible plugins. Generic plugins are included in the mirin package, but new plugins can be created and existing plugins can also be extended to support project specific needs.

| Plugin ID     | Purpose                                                                            |
|---------------|------------------------------------------------------------------------------------|
| js            | Asynchronous injection of JavaScript script tags into document head                |
| css           | Asynchronous injection of CSS link tags into document head                         |
| img           | Preloading of images when content reflows need to be avoided                       |
| html          | Injection of generic HTML content into document body                               |
| html-template | Loading and injection of HTML script templates into document head                  |
| less          | Injection of LESS link tags into DOM, to be handled by less.js on-the-fly compiler |


Building
--------

Mirin build system depends on ANT and Java. Make sure you have them properly installed. After that, you need the following steps to get going.

    git clone https://github.com/unkhz/mirin.js
    cd mirin.js
    ant

After build, minified and debug versions of the utility will be available in dist folder.

By default, all stock plugins are included in the main mirin.js file. If you want to build a version containing only a specific set of plugins to suit your projects needs, you can define the set with the plugins property. Use a comma delimited list of plugin ids.

    ant -Dplugins=js,css,html-template

Usage
-----

...