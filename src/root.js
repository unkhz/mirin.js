
/* Mirin.js */

var root=this,
    MirinModule,
    MirinItem,

    // top level options object, with defaults
    rootOptions = {
        collection:null,        // if this is defined, use this as the initial resource collection
        url:null,               // if this is defined, extend resource collection with json from this url
        debug:false,            // log debug information
        sets:["js","css","html"] // resource sets to load
    },

    // minification optimizations
    arraySlice = Array.prototype.slice,
    createElement = document.createElement,

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
        if ( src ) for ( var j in src ) dest[j] = src[j];
    }
    return dest;
}