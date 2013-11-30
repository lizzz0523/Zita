/*
    by liz
*/

;(function(exports, undefined){

var zita = exports.zita = {
    version : 0.0.1
};


// array or object

var slice = function(arr, start, end){
    return Array.prototype.slice.call(arr, start, end);
}

var IS_DONTENUM_BUG = (function(){
    for(var prop in {toString : 1}){
        if(prop == 'toString') return false;
    }
    return true;
})();

zita.keys = function(obj){
    var res = [],
        prop;
    
    for(prop in obj){
        if(!obj.hasOwnProperty(prop)) continue;
        res.push(prop);
    }

    // fix don't enum bug
    if(IS_DONTENUM_BUG){
        if(obj.toString !== Object.prototype.toString){
            res.push('toString');
        }

        if(obj.valueOf !== Object.prototype.valueOf){
            res.push('valueOf');
        }
    }

    return res;
}

zita.values = function(obj){
    var res = [];
        prop;

    for(prop in obj){
        if(!obj.hasOwnProperty(prop)) continue;
        res.push(obj[prop]);
    }

    // fix don't enum bug
    if(IS_DONTENUM_BUG){
        if(obj.toString !== Object.prototype.toString){
            res.push(obj.toString);
        }

        if(obj.valueOf !== Object.prototype.valueOf){
            res.push(obj.valueOf);
        }
    }

    return res;
}

var each = zita.each = function(obj, callback){
    var keys,
        i = 0;

    if(obj == null) return;

    if(obj.forEach){
        obj.forEach(function(){
            return callback.apply(zita, arguments);
        })

        return;
    }

    if(obj.length){
        // if obj is array
        for(; i < obj.length; i++){
            if(callback.call(zita, i, obj[i], obj) === false) break;
        }
    }else{
        // if obj is object
        keys = zita.keys(obj);
        for(; i < keys.length; i++){
            if(callback.call(zita, keys[i], obj[keys[i]], obj) === false) break;
        }
    }

    return;
}

zita.merge = function(dest, orig){
    var res = slice(dest, 1),
        offset = res.length,
        i = 0;

    for(; i < res.length; i++){
        res[offset + i] = orig[i];
    }

    return res;
}

zita.extend = function(dest, orig){
    var keys = zita.keys(orig),
        i = 0;

    for(; i < keys.length; i++){
        dest[keys[i]] = orig[keys[i]];
    });

    return dest;
}

zita.clone = function(orig){
    return zita.extend({}, orig);
}

zita.max = function(arr, iterator){
    var proxy, max,
        i = 0;

    max = {proxy : -Infinity, value : -Infinity};
    for(; i < arr.length; i++){
        proxy = iterator ? iterator.call(zita, arr[i], i) : arr[i];
        if(proxy > max.proxy){
            max.proxy = proxy;
            max.value = arr[i];
        }
    }

    return max.value;
}

zita.min = function(arr, iterator){
    var proxy, min,
        i = 0;

    min = {proxy : -Infinity, value : -Infinity};
    for(; i < arr.length; i++){
        proxy = iterator ? iterator.call(zita, arr[i], i) : arr[i];
        if(proxy < min.proxy){
            min.proxy = proxy;
            min.value = arr[i];
        }
    }

    return min.value;
}


// function

var now = Date.now || function(){
    return (new Date).getTime();
}

zita.debounce = function(callback, delay){
    var timer = null;

    function clear(){
        clearTimeout(timer);
        timer = null;
    }

    delay = delay || 200;

    return function(){
        var orig = callback,
            context = this,
            args = arguments;

        callback = function(){
            clear();
            orig.apply(context, args);
        }

        timer && clear();
        timer = setTimeout(callback, delay);
    }
}

zita.pulse = function(callback, period, delay){
    var timer = null,
        endtime, active;

    function clear(){
        clearInterval(timer);
        timer = null;
        active = false;
    }

    delay = delay || 200;
    period = period || 1000;

    return function(){
        var orig = callback,
            context = this,
            args = arguments;

        callback = function(){
            orig.apply(context, args);
            if(now() > endtime){
                clear();
            }
        }

        endtime = now() + period;
        if(!active){
            active = true;
            timer = setInterval(callback, delay);
        }
    }
}


// dom and cssom

zita.Node = (function(){

    var win = exports,
        doc = win.document,
        docRoot = doc.documentElement,
        body = doc.body;

    function getElementNode(node){
        if(node && node.nodeType){
            if(node.nodeType == 3){
                node = node.parentNode;
            }

            return node;
        }

        if(node && node.zita){
            return node.self;
        }

        return false
    }

    function Node(node){
        if(node.length){
            node = node[0];
        }

        if(!(node = getElementNode(node))){
            throw Error('not element node');
        }

        this.self = node;
    }

    Node.fn = Node.prototype = {
        zita : zita.version
    }

    Node.fn.contains = function(node){
        var self = this.self,
            cur;

        if(!(node = getElementNode(node))) return false;

        if(self.contains){
            return self.contains(node);
        }

        if(self.compareDocumentPosition){
            // DOCUMENT_POSITION_DISCONNECTED            1
            // DOCUMENT_POSITION_PRECEDING               2
            // DOCUMENT_POSITION_FOLLOWING               4
            // DOCUMENT_POSITION_CONTAINS                8
            // DOCUMENT_POSITION_CONTAINED_BY            16
            // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC 32
            return !!(self.compareDocumentPosition(node) & 16);
        }

        cur = node;
        while(cur){
            if(cur == self) return true;
            cur = node.parentNode;
        }

        return false;
    }

    Node.fn.offset = function(){
        var self = this.self,
            cur, offsetParent,
            crect,
            rect = null;

        if(self.getBoundingClientRect){
            crect = self.getBoundingClientRect();
            rect = {};

            zita.each('left top'.split(' '), function(dir){
                // firefox not round the top and bottom
                if(crect[dir] === undefined){
                    rect = null;
                    return false;
                }
                rect[dir] = crect[dir];
            });
        }

        if(!rect){
            offsetParent = self.offsetParent;
            rect = {
                left : self.offsetLeft,
                top : self.offsetTop
            };

            cur = self;
            while((cur = cur.parentNode) && cur != body){
                rect.left -= cur.scrollLeft;
                rect.top += cur.scrollTop;

                if(cur == offsetParent){
                    // use clientLeft/Top to replace calculating elem border width
                    rect.left += cur.offsetLeft + cur.clientLeft;
                    rect.top += cur.offsetTop + cur.clientTop;

                    offsetParent = cur.offsetParent;
                }
            }
        }else{
            // subtract clientLeft/Top to correct double counting
            rect.left += (win.pageXOffset || docRoot.scrollLeft) - docRoot.clientLeft;
            rect.top += (win.pageYOffset || docRoot.scrollTop) - docRoot.clientTop;
        }

        return rect;
    }

    return function(node){
        return new Node(node);
    };

})();


// tools

zita.Ticker = (function(){

    var win = exports,

        // internal identity is used to mark a registered function
        tickId = 0,
        tickers = [],

        timerId = null,

        requestAnimFrame,
        cancelAnimFrame,

        settings = {
            useRAF : true,
            interval : 1000 / 60
        };
    
    (function(){
        var vendors = ' ms moz webkit o'.split(' '),
            i = 0,
            len = vendors.length;

        if(settings.useRAF){
            for(; i < len && !requestAnimFrame; i++){
                requestAnimFrame = win[vendors[i] + 'RequestAnimationFrame'];
                cancelAnimFrame = win[vendors[i] + 'CancelAnimationFrame'] || win[vendors[i] + 'CancelRequestAnimationFrame'];
            }
        }

        requestAnimFrame || (requestAnimFrame = function(callback){
            return win.setTimeout(callback, settings.interval);
        });

        cancelAnimFrame || (cancelAnimFrame = function(timerId){
            return win.clearTimeout(timerId);
        });
    })();
    
    function tick(){
        var ticker,
            i = 0,
            len = tickers.length;
            
        for(; i < len; i++){
            ticker = tickers[i];
            ticker.callback.call(ticker.context);
        }
    }

    function run(){
        timerId = requestAnimFrame(arguments.callee);
        tick();
    }
    
    function stop(){
        cancelAnimFrame(timerId);
        timerId = null;
    }

    return {
        add : function(callback, context){
            // if the callback function has registered, skip it
            if(callback.tickId) return;

            callback.tickId = 'tick-' + tickId++;
            tickers.push({
                callback : callback,
                context : context || win
            });

            if(tickers.length == 1) run();

            return callback;
        },
        remove : function(callback){
            var ticker,
                i = 0,
                len = tickers.length;

            if(!callback){
                tickers = [];
            }else{
                if(!callback.tickId) return;

                for(; i < len; i++){
                    ticker = tickers[i];
                    if(callback.tickId == ticker.callback.tickId){
                        callback = tickers.splice(i, 1);
                        delete callback.tickId;
                        break;
                    }
                }
            }
            
            if(!tickers.length){
                stop();
            }

            return callback;
        }
    }

})();


})(window);
