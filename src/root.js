
/* Mirin.js */

var root=this,

    // Classes
    Mirin,
    MirinModule,
    MirinItem,

    // Collections
    resources = null,
    modules = {},
    plugins = {},

    // top level options object, with defaults
    rootOptions = {
        "resources":null,        // if this is defined, use this as the initial resource collection
        "url":null,               // if this is defined, extend resource collection with json from this url
        //BEGIN_DEBUG
        "debug":false,            // log debug information
        //END_DEBUG
        "plugins":["js","css","html"] // enabled plugins
    },

    // every item goes through these steps
    ITEM_EVENTS = {
        "init":"init",
        "inject":"inject",
        "load":"load"
    },

    // minification optimizations
    arraySlice = Array.prototype.slice,
    // fix IE8 Array.protytype.indexOf
    arrayIndexOf = Array.prototype.indexOf || function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    },
    createElement = function(el){
        return document.createElement(el);
    },

    // IE detection, https://gist.github.com/527683
    ie = (function(){
        var undef, v = 3, div = document.createElement('div');
        while (
            div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
            div.getElementsByTagName('i')[0]
        ){};
        return v > 4 ? v : undef;
    }());

// fix IE8 document.head
if ( !document.head ) document.head = document.getElementsByTagName("head")[0];

// Log function
function log() {
    var c = window.console;
    if (rootOptions.debug && c && c.log) {
        if ( c.log.apply ) {
            c.log.apply(c,arguments);
        } else {
            // IE
            var str="";
            for ( var i = 0; i < arguments.length; i++ ) str += arguments[i] + " ";
            c.log(str);
        }
    }
}

function extend() {
    var dest = arguments[0],
        rest = arraySlice.call(arguments,1),
        i,j;
    for ( i=0,len=rest.length;i<len;i++ ) {
        var src = rest[i];
        if ( src ) {
            for ( j in src ) {
                dest[j] = src[j];
            }
        }
    }
    return dest;
}

function dispatch(eventName, listenerObject, contextObject){
    var callbackName = "on"+ eventName[0].toUpperCase() + eventName.slice(1),
        callback = listenerObject[callbackName];
    if ( callback ) {
        if ( contextObject ) {
            callback.apply(contextObject, arraySlice.call(arguments,3));
        } else {
            callback.apply(listenerObject, arraySlice.call(arguments,3));
        }
    }
}

// fetch with ajax
function fetch(url, success, error) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
        finished=false;

    xhr.open("GET", url, true);
    xhr.onload = xhr.onreadystatechange = function(e){
        var response, status;
        try {
            // need to catch error, when xhr is aborted on IE
            response=xhr.responseText;
            status=xhr.status;
        } catch(ee) {
        }
 
        if ( response && !finished ) {
            finished = true;
            if ( status === 200 ) {
                if ( success ) success.call(this, response);
            } else {
                if ( error ) {
                    error.call(this, response);
                }
            }
            try {
                xhr.onreadystatechange=null;
                xhr.onload=null;
            } catch (ee) {

            }
        }
    };
    xhr.send(null);
}