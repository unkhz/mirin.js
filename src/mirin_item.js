/* MirinItem */

(function(){

    var defaultOptions = {
        onInit:null,
        onInject:null,
        onLoad:null
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

            // Automatically register plugin for use
            plugins[child.pluginId] = child;

            return child;
        }
    });

    /* MirinItem prototype methods */
    extend(MirinItem.prototype, {

        // inject resource into DOM, mandatory extend
        inject:function(){},
        
        // rmove resource from DOM, mandatory extend
        remove:function(){}
    });

}());
