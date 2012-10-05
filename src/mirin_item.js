/* MirinItem */

(function(){
    var self = MirinItem = function(url,type,module) {
        extend(this,{
            module:module,
            type:type,
            url:url
        });
    }, proto = self.prototype;

    proto.fetch = function(callbackFunction) {
        var xhr = new XMLHttpRequest(),
            finished=false,
            item=this;
        xhr.open("GET", this.url, true);
        xhr.onload = xhr.onreadystatechange = function(e){
            var response;
            try {
                // need to catch error, when xhr is aborted on IE
                response=e.target.responseText;
            } catch(ee) {
            }

            if ( response && !finished ) {
                finished = true;
                callbackFunction.call(item, response, this.url);
            }
        };
        xhr.send(null);
    };
}());