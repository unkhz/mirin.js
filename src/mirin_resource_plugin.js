/* MirinResourcePlugin (Factory) */

(function(){

    var defaultOptions = {
        onInit:null,
        onInject:null,
        onLoad:null
    };

    // MirinResourcePlugin constructor
    // may be extended
    var stat = MirinResourcePlugin = function(module, resourceCollectionItem, aOptions) {
        // ResourceItem inherits ALL properties from the resouce collection item
        extend(this, stat.mapItem(resourceCollectionItem), {
            options:extend({},defaultOptions,aOptions),
            module:module
        });
        dispatch(ITEM_EVENTS.init,this.options,this,this);
    };


    /* MirinResourcePlugin static properties and methods */
    extend(MirinResourcePlugin, {

        // unique id for the plugin, mandatory extend
        pluginId:null,

        // match resourceCollectionItem, mandatory extend
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

        // how resourceCollection JSON is mapped to  a resourceItem
        mapItem:function(collectionItem){
            if ( typeof collectionItem === 'string' ) {
                // plain text items are assumed to be urls
                return {url:collectionItem};
            } else {
                return collectionItem;
            }

        },

        // static extend function, inspired by Backbone.js inheritance
        // this cannot be overridden
        extend:function(prototype, staticProperties) {
            var parent=this,
                child;

            if (prototype && prototype.hasOwnProperty('constructor')) {
                child = prototype.constructor;
            } else {
                child = function(){ parent.apply(this, arguments); };
            }

            // take out known static properties from prototype properties
            staticProperties = staticProperties || {};
            for ( var i in this ) {
                if ( prototype.hasOwnProperty(i) ) staticProperties[i] = prototype[i];
            }

            extend(child, parent, staticProperties);
            extend(child.prototype, parent.prototype, prototype);

            child.extend = this.extend;

            //Automatically register plugin for use
            Mirin.resourcePlugins[child.pluginId] = child;

            return child;
        }
    });

    /* MirinResourcePlugin prototype methods */
    extend(MirinResourcePlugin.prototype, {

        // inject resource into DOM, mandatory extend
        inject:function(){},
        
        // rmove resource from DOM, mandatory extend
        remove:function(){}
    });

}());
