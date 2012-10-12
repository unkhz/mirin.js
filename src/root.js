
/* Mirin.js */

var root=this,

    // Classes
    Mirin,
    MirinModule,
    MirinItem,

    // Collections
    resources = null,
    modules = {},
    plugins = [],

    // top level options object, with defaults
    rootOptions = {
        "resources":null,        // if this is defined, use this as the initial resource collection
        "url":null,               // if this is defined, extend resource collection with json from this url
        "debug":false,            // log debug information
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
    createElement = function(el){
        return document.createElement(el);
    },

    // IE detection, https://gist.github.com/527683
    ie = (function(){
        var undef, v = 3, div = document.createElement('div');
        while (
            div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
            div.getElementsByTagName('i')[0]
        );
        return v > 4 ? v : undef;
    }());

// FIXME: remove this on minified version
function log() {
    var c = window.console;
    if (rootOptions.debug && c && c.log) {
        if ( c.log.apply ) {
            c.log.apply(c,arguments);
        } else {
            // IE
            var str="";
            for ( var i in arguments ) str += arguments[i] + " ";
            c.log(str);
        }
    }
}

function extend() {
    var dest = arguments[0],
        rest = arraySlice.call(arguments,1);
    for ( var i in rest ) {
        var src = rest[i];
        if ( src ) {
            for ( var j in src ) {
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
        callback.apply(contextObject, arraySlice.call(arguments,3));
    }
}

// fetch with ajax
function fetch(url, success, error) {
    var xhr = new XMLHttpRequest(),
        finished=false;
    xhr.open("GET", url, true);
    xhr.onload = xhr.onreadystatechange = function(e){
        var response, status;
        try {
            // need to catch error, when xhr is aborted on IE
            response=e.target.responseText;
            status=e.target.status;
        } catch(ee) {
        }

        if ( response && !finished ) {
            finished = true;
            if ( status === 200 ) {
                if ( success ) success.call(this, response);
            } else {
                if ( error ) error.call(this, response);
                else throw(new Error("Ajax returned " + status + " fetching " + url));
            }
        }
    };
    xhr.send(null);
}