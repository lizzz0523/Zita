/*
    by liz
*/

;(function(exports, undefined){

var zita = exports.zita = {
    version : '0.0.1'
};

var _slice = function(arr, start, end){
        return Array.prototype.slice.call(arr, start, end);
    },

    _string = function(obj){
        return Object.prototype.toString.call(obj);
    },

    _now = Date.now || function(){
        return (new Date).getTime();
    };


// class

zita.extend = function(dest){
    /*
        todo: class extend
    */
};


// array or object

var IS_DONTENUM_BUG = (function(){
    for(var prop in {toString : 1}){
        if(prop === 'toString') return false;
    }
    return true;
})();

var _each = zita.each = function(obj, callback){
    var keys,
        i = 0;

    if(obj === null) return;

    // use the native ecmascript 5 each;
    if(obj.forEach){
        obj.forEach(function(){
            return callback.apply(zita, arguments);
        });

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
};

zita.reduce = function(obj, iterator, memo){
    var res = memo;

    // if(obj.reduce && obj.reduce === Array.prototype.reduce){
    //     return res ? obj.reduce(iterator, res) : obj.reduce(iterator);
    // }

    _each(obj, function(){
        if(res === undefined){
            res = arguments[0];
        }else{
            res = iterator.apply(zita, zita.merge([res], _slice(arguments)));
        }
    });

    return res;
};

zita.merge = function(dest){
    var args = _slice(arguments, 1),
        src, keys,
        i = 0,
        j = 0;

    for(; i < args.length; i++){
        src = args[i];

        if(dest.length){
            dest = dest.concat(src);
        }else{
            keys = zita.keys(src);
            for(; j < keys.length; j++){
                dest[keys[j]] = obj[keys[j]];
            }
        }
    }

    return dest;
};

zita.clone = function(orig){
    return zita.merge(orig.length ? [] : {}, orig);
};

zita.range = function(start, stop, step){
    var res = [],
        i, len;

    if(arguments.length <= 1){
        stop = start;
        start = 0;
    }
    step = step || 1;

    i = start;
    len = Math.max(Math.ceil((stop - start) / step, 0));
    while(len--){
        res.push(start);
        start += step;
    };

    return res;
};

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
};

zita.min = function(arr, iterator){
    var proxy, min,
        i = 0;

    min = {proxy : Infinity, value : Infinity};
    for(; i < arr.length; i++){
        proxy = iterator ? iterator.call(zita, arr[i], i) : arr[i];
        if(proxy < min.proxy){
            min.proxy = proxy;
            min.value = arr[i];
        }
    }

    return min.value;
};

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
};

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
};

var _type = zita.type = (function(){

    var class2type = {};

    _each('Number Boolean String Array Object Function Date RegExp Error'.split(' '), function(type){
        class2type['[object ' + type + ']'] = type.toLowerCase();
    });

    return function(obj){
        if(obj === null){
            return String(obj);
        }

        return typeof obj === 'object' || typeof obj === 'function'
            ? class2type[_string(obj)] || "object"
            : typeof obj;
    }

})();

_each('Number Boolean String Date RegExp'.split(' '), function(type){
    zita['is' + type] = function(obj){ return _type(obj) === type.toLowerCase(); };
});

zita.isUndefined = function(obj){
    return obj === undefined;
};

zita.isNull = function(obj){
    return obj === null;
};

zita.isArray = Array.isArray || function(obj){
    return _type(obj) === 'array';
};

// fix chrome(1-12) bug and use a faster solution
zita.isFunction = typeof /./ !== 'function'
? function(obj){
    return typeof obj === 'function';
}
: function(obj){
    return _type(obj) === 'function';
};

zita.isElement = function(obj){
    return obj !== null && obj.nodeType && obj.nodeType === 1;
};

zita.isNaN = Number.isNaN || function(obj){
    return _type(obj) === 'number' && obj !== obj ;
};

zita.isFinite = function(obj){
    // !isNaN(parseFloat(obj)) for numeric check
    // isFinite(obj) for finite check
    return !isNaN(parseFloat(obj)) && isFinite(obj);
};


// function

zita.bind = (function(){

    var proxy = function(){};

    return function(callback, context){
        var args, bound, self;

        // make sure browser support the functing binding
        // and not be overrided
        if(callback.bind && callback.bind === Function.prototype.bind){
            return Function.prototype.bind.apply(callback,  _slice(arguments, 1));
        }

        args = _slice(arguments, 2);
        return bound = function(){
            if(!(this instanceof bound)) return callback.apply(context, zita.merge(args, _slice(arguments)));

            proxy.prototype = callback.prototype;
            self = new proxy();
            proxy.prototype = null;

            callback.apply(self, zita.merge(args, _slice(arguments)));
            
            return self;
        };
    };

})();

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
};

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
            if(_now() > endtime){
                clear();
            }
        }

        endtime = _now() + period;
        if(!active){
            active = true;
            timer = setInterval(callback, delay);
        }
    }
};

zita.delay = function(callback, delay){
    var args = _slice(arguments, 2);

    delay = delay || 10;

    return setTimeout(function(){
        callback.apply(zita, args);
    }, delay);
};

zita.defer = function(callback){
    var args = zita.merge([callback, 0.01], _slice(arguments, 1));
    return zita.delay.apply(zita, args);
};


// tools

zita.guid = function(){
    var d = new Date().getTime(), r;

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);

        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};

zita.event = (function(){

    var events = {};

    return {
        on : function(name, callback){
            var event = events[name] || (events[name] = []);

            if(callback.eventId) return;

            callback.eventId = 'event-' + zita.guid();
            event.push(callback);

            return callback;
        },

        off : function(name, callback){
            var event = events[name],
                i = 0, len;

            if(!event) return;
            len = event.length;

            if(!callback){
                delete events[name];
            }else{
                if(!callback.eventId) return;

                for(; i < len; i++){
                    if(callback.eventId === event[i].eventId){
                        callback = event[i];
                        delete callback.tickId;

                        event.splice(i, 1);
                        
                        break;
                    }
                }
            }

            return callback;
        },

        trigger : function(name){
            var args = _slice(arguments, 1),
                event = events[name],
                i = 0, len;

            if(!event) return;
            len = event.length;

            for(; i < len; i++){
                event[i].apply(zita, args);
            }
        }
    }

})();

zita.queue = (function(){

    var queues = {};

    return {
        add : function(name, callback){
            var queue = queues[name] || (queues[name] = []);

            if(zita.isArray(callback)){
                queues[name] = zita.clone(callback);
            }else{
                queue.push(callback);
            }

            return callback;
        },

        next : function(name){
            var queue = queues[name],
                callback;

            if(!queue) return;
            
            callback = queue.shift();
            if(callback){
                callback.call(zita)
            }

            if(!queue.length){
                delete queues[name]
            }
        },

        clear : function(name){
            var queue = queues[name];
            queue && (delete queues[name]);
        }
    };

})();

zita.ticker = (function(){

    var win = exports,

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

            callback.tickId = 'tick-' + zita.guid();
            tickers.push({
                callback : callback,
                context : context || win
            });

            if(tickers.length === 1) run();

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
                    if(callback.tickId === ticker.callback.tickId){
                        callback = ticker.callback;
                        delete callback.tickId;

                        tickers.splice(i, 1);
                        
                        break;
                    }
                }
            }
            
            if(!tickers.length){
                stop();
            }

            return callback;
        }
    };

})();


})(window);
