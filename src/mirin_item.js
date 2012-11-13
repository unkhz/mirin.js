/* MirinItem */

(function(){

    var noop = function(){},
        defaultOptions = {
            onInit:noop,
            onInject:noop,
            onLoad:noop
        };

    // MirinItem constructor
    // may be extended
    var stat = MirinItem = function(module, resourceItem, aOptions) {
        // MirinItem inherits ALL properties from the resouce collection item
        extend(this, stat.mapItem(resourceItem), {
            options:extend({},defaultOptions,aOptions),
            module:module
        });
        dispatch(ITEM_EVENTS.init,this.options,this,this);
    };

    // Shared empty constructor function to aid in prototype-chain creation.
    var baseConstructor = function(){};

    /* MirinItem static properties and methods */
    extend(MirinItem, {

        // unique id for the plugin, mandatory extend
        pluginId:null,

        // match resourceItem, mandatory extend
        matchExp:null,
        

        // how resource collection item is confirmed to belong to this plugin,
        // may be extended if matchExp is not enough
        matchItem:function(item){
            if ( typeof item === 'string' ){
                return item.match(this.matchExp) ? true : false;
            } else if ( item.plugin && item.plugin === this.pluginId ) {
                return true;
            } else if ( item.url ) {
                return item.url.match(this.matchExp) ? true : false;
            }
        },

        // how resource collection items are mapped into MirinItems
        mapItem:function(resourceItem){
            if ( typeof resourceItem === 'string' ) {
                // plain text items are assumed to be urls
                return {url:resourceItem};
            } else {
                return resourceItem;
            }

        },

        // static extend function, mostly copied from Backbone.js inheritance
        // this cannot be overridden
        extend:function(prototype, staticProperties) {
            var parent=stat,
                child;

            if (prototype && prototype.hasOwnProperty('constructor')) {
                child = prototype.constructor;
            } else {
                child = function(){ parent.apply(this, arguments); };
            }

            // take out known static properties from prototype properties
            staticProperties = staticProperties || {};
            for ( var i in this ) {
                if ( i !== "prototype" && prototype.hasOwnProperty(i) ) {
                    staticProperties[i] = prototype[i];
                }
            }

            // Following procedure, copied from Backbone, ensures that the
            // class receives an unique prototype in all browsers

            extend(child, parent);
            baseConstructor.prototype = parent.prototype;
            child.prototype = new baseConstructor();
            extend(child, staticProperties);
            extend(child.prototype, prototype);
            child.extend = this.extend;
            child.prototype.constructor = child;

            // Automatically register plugin for use
            Mirin.registerPlugin(child);

            return child;
        }
    });

    /* MirinItem prototype methods */
    extend(MirinItem.prototype, {

        // inject resource into DOM, mandatory extend
        inject:noop,
        
        // remove resource from DOM and memory
        remove:function(){
            if ( this.el && this.el.parentNode ) {
                this.el.parentNode.removeChild(this.el);
            }
            delete this.el;
        },

        // called when whole set of plugins items have been loaded
        onSetLoad:noop,

        // called when the whole module has been loaded
        onModuleLoad:noop,

        dispatchInjectEvent:function(){
            dispatch(ITEM_EVENTS.inject, this.options, this, this);
        },

        dispatchLoadEvent:function(){
            dispatch(ITEM_EVENTS.load, this.options, this, this);
        }
    });
    Mirin.Item = MirinItem;

}());

