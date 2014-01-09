/*
    by liz
*/

;(function(exports, undefined){

var zita = exports.zita = {
    version : '0.0.1',
    arr : [],
    obj : {},
    noop : function(){}
};

var nativePush = zita.arr.push,
    nativeSlice = zita.arr.slice,
    nativeConcat = zita.arr.concat,
    nativeForEach = zita.arr.forEach,
    nativeSome = zita.arr.some,
    nativeEvery = zita.arr.every,
    nativeMap = zita.arr.map,
    nativeReduce = zita.arr.reduce,
    nativeFind = zita.arr.find,
    nativeFilter = zita.arr.filter,
    nativeKeys = zita.obj.keys,
    nativeToString = zita.obj.toString,
    nativeBind = zita.noop.bind;

var _slice = function(arr, start, end){
        return nativeSlice.call(arr, start, end);
    },

    _concat = function(arr, src){
        return nativeConcat.call(arr, src);
    },

    _string = function(obj){
        return nativeToString.call(obj);
    },

    _now = Date.now || function(){
        return (new Date).getTime();
    };


// array or object

var IS_DONTENUM_BUG = (function(){
    for(var prop in {toString : 1}){
        if(prop == 'toString') return false;
    }
    return true;
})();

var _each = zita.each = function(list, iterator){
    var keys,
        i = 0;

    if(list == null) return;

    // use the native ecmascript 5 each;
    if(list.forEach && list.forEach === nativeForEach){
        return list.forEach(iterator, zita);
    }

    if(zita.isArray(list)){
        // if list is array
        for(; i < list.length; i++){
            if(iterator.call(zita, list[i], i, list) === false) break;
        }
    }else{
        // if list is object
        keys = zita.keys(list);
        for(; i < keys.length; i++){
            if(iterator.call(zita, list[keys[i]], keys[i], list) === false) break;
        }
    }

    return;
};

var _some = zita.some = function(list, iterator){
    var res = false;

    if(list.some && list.som === nativeSome){
        return list.some(iterator, zita);
    }

    _each(list, function(){
        // because the nativeForEach function couldn't stop by return false
        // and I use this || condition to make it stop
        if(res || (res = !!iterator.apply(zita, arguments))) return false;
    });

    return res;
};

zita.every = function(list, iterator){
    var res = true;

    if(list.every && list.every === nativeEvery){
        return list.every(iterator, zita);
    }

    _each(list, function(){
        // because the nativeForEach function couldn't stop by return false
        // and I use this && condition to make it stop
        if(res && !(res = !!iterator.apply(zita, arguments))) return false;
    });

    return res;
};

zita.reduce = function(list, iterator, memo){
    var res = memo;

    if(list.reduce && list.reduce === nativeReduce){
        iterator = zita.bind(iterator, zita);
        return res != undefined ? list.reduce(iterator, memo) : list.reduce(iterator);
    }

    _each(list, function(value){
        if(res == undefined){
            res = value;
        }else{
            res = iterator.apply(zita, _concat([res], _slice(arguments)));
        }
    });

    return res;
};

zita.map = function(list, iterator){
    var res = [];

    if(list.map && list.map === nativeMap){
        return list.map(iterator, zita);
    }

    _each(list, function(){
        res.push(iterator.apply(zita, arguments));
    });

    return res;
};

zita.find = function(list, iterator){
    var res;

    if(list,find && list.find == nativeFind){
        return list.find(iterator, zita);
    }

    // instead of using function _each
    // here I use function _some to break the loop when we find the target
    _some(list, function(value){
        if(iterator.apply(zita, arguments)){
            res = value;
            return true;
        }
    });

    return res;
};

zita.filter = function(list, iterator){
    var res = [];

    if(list.filter && list.filter === nativeFilter){
        return list.filter(iterator, zita);
    }

    _each(list, function(value){
        if(iterator.apply(zita, arguments)){
            res.push(value);
        }
    });

    return res;
};

zita.contains = function(list, target){
    return _some(list, function(value){
        return value === target;
    });
};

zita.without = function(list){
    var args = _slice(arguments, 1);

    return zita.filter(list, function(value){
        return !zita.contains(args, value);
    });
};

zita.max = function(list, iterator){
    var proxy, max;

    max = {proxy : -Infinity, value : -Infinity};
    _each(list, function(value){
        proxy = iterator ? iterator.apply(zita, arguments) : value;
        if(proxy > max.proxy){
            max.proxy = proxy;
            max.value = value;
        }
    });

    return max.value;
};

zita.min = function(list, iterator){
    var proxy, min;

    min = {proxy : Infinity, value : Infinity};
    _each(list, function(value){
        proxy = iterator ? iterator.apply(zita, arguments) : value;
        if(proxy < min.proxy){
            min.proxy = proxy;
            min.value = value;
        }
    });

    return min.value;
};

zita.merge = function(dest){
    var args = _slice(arguments, 1),
        src, keys,
        i = 0,
        j = 0;

    if(zita.isArray(dest)){
        nativePush.apply(dest, args);
    }else{
        for(; i < args.length; i++){
            src = args[i];
            keys = zita.keys(src);
            for(; j < keys.length; j++){
                dest[keys[j]] = src[keys[j]];
            }
        }
    }

    return dest;
};

zita.clone = function(orig){
    return zita.merge(zita.isArray(orig) ? [] : {}, orig);
};

zita.size = function(list){
    var keys;

    if(list == null) return 0;

    if(zita.isArray(list)){
        return list.length;
    }else{
        keys = zita.keys(list);
        return keys.length;
    }
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

zita.first = function(arr, index){
    var len = Math.min(index || 1, arr.length);
    if(len < 0) return [];
    return _slice(arr, 0, len);
};

zita.last = function(arr, index){
    var len = Math.min(index || 1, arr.length);
    if(len < 0) return _slice(arr);
    return _slice(arr, arr.length - len);
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

zita.equal = function(a, b){
    var type;

    // for non-object condition: string/boolean/number
    if(a === b) return a !== 0 || 1 / a === 1 / b;

    if((type = _type(a)) != _type(b)) return false;
    switch(type){
        case 'string' :
        case 'function' :
            return String(a) == String(b);

        case 'boolean' :
        case 'number' :
        case 'date' :
            return +a == +b || (a !== a && b !== b) || (a == 0 && 1 / a == 1 / b);

        case 'regexp' :
            return a.source == b.source
            && a.global == b.global
            && a.multiline == b.multiline
            && a.ignoreCase == b.ignoreCase;
    }

    /*
        todo: do a deep comparison of object
    */
};

var _type = zita.type = (function(){

    var class2type = {};

    _each('Number Boolean String Array Object Function Date RegExp Error'.split(' '), function(type){
        class2type['[object ' + type + ']'] = type.toLowerCase();
    });

    return function(obj){
        if(obj == null){
            return String(obj);
        }

        return typeof obj == 'object' || typeof obj == 'function'
            ? class2type[_string(obj)] || 'object'
            : typeof obj;
    }

})();

_each('Number Boolean String Date RegExp'.split(' '), function(type){
    zita['is' + type] = function(obj){ return _type(obj) == type.toLowerCase(); };
});

zita.isUndefined = function(obj){
    return obj == undefined;
};

zita.isNull = function(obj){
    return obj == null;
};

zita.isArray = Array.isArray || function(obj){
    return _type(obj) == 'array';
};

// fix chrome(1-12) bug and use a faster solution
zita.isFunction = typeof /./ != 'function'
? function(obj){
    return typeof obj == 'function';
}
: function(obj){
    return _type(obj) == 'function';
};

zita.isElement = function(obj){
    return obj != null && obj.nodeType && obj.nodeType == 1;
};

zita.isNaN = Number.isNaN || function(obj){
    return _type(obj) == 'number' && obj !== obj ;
};

zita.isFinite = function(obj){
    // !isNaN(parseFloat(obj)) for numeric check
    // isFinite(obj) for finite check
    return !isNaN(parseFloat(obj)) && isFinite(obj);
};


// class

zita.extend = function(dest){
    /*
        todo: class extend
    */
};


// function

zita.bind = (function(){

    var proxy = function(){};

    return function(callback, context){
        var args, bound, self;

        // make sure browser support the functing binding
        // and not be overrided
        if(callback.bind && callback.bind === nativeBind){
            return nativeBind.apply(callback,  _slice(arguments, 1));
        }

        args = _slice(arguments, 2);
        return bound = function(){
            if(!(this instanceof bound)) return callback.apply(context, _concat(args, _slice(arguments)));

            proxy.prototype = callback.prototype;
            self = new proxy();
            proxy.prototype = null;

            callback.apply(self, _concat(args, _slice(arguments)));
            
            return self;
        };
    };

})();

zita.debounce = function(callback, delay){
    var timerId = null;

    function clear(){
        clearTimeout(timerId);
        timerId = null;
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

        timerId && clear();
        timerId = setTimeout(callback, delay);
    }
};

zita.pulse = function(callback, period, delay){
    var timerId = null,
        endtime, active;

    function clear(){
        clearInterval(timerId);
        timerId = null;
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
            timerId = setInterval(callback, delay);
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

// delay 0.01ms
// to force the callback function push into of event loop
zita.defer = function(callback){
    var args = _concat([callback, 0.01], _slice(arguments, 1));
    return zita.delay.apply(zita, args);
};


// tools

zita.guid = function(){
    var d = new Date().getTime(), r;

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);

        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};

// global cache data system
zita.data = (function(){

    var hook = 'data-' + zita.guid(),

        cache = {};
        cacheId = 1;
        
    function cacheData(name, data){
        var id = this[hook],
            cacheData,
            res;

        if(!id){
            this[hook] = id = cacheId++;
        }

        if(!cache[id]){
            cache[id] = {};
        }

        cacheData = cache[id];

        if(data != undefined){
            cacheData[name] = data;
        }

        if(name){
            res = cacheData[name];
        }else{
            res = cacheData;
        }

        return res;
    }

    function removeData(name){
        var id = this[hook],
            cacheData,
            res;

        if(!id || !cache[id]){
            return;
        }

        if(name){
            cacheData = cache[id];

            if(cacheData && name in cacheData){
                delete cacheData[name];
            }

            if(!zita.size(cacheData)){
                delete cache[id];
            }
        }else{
            delete cache[id];
        }
    }

    return function(){
        var context = arguments[0],
            i = 1, args,
            remove = false;

        if(zita.isBoolean(context)){
            remove = !context;
            context = arguments[1];
            i = 2;
        }

        args = _slice(arguments, i);

        if(!remove){
            return cacheData.apply(context, args);
        }else{
            return removeData.apply(context, args);
        }
    }

})();

zita.ticker = (function(settings){

    var win = exports,

        tickers = [],

        requestAnimFrame,
        cancelAnimFrame,

        requestId;
    
    (function(){

        var vendors = ' ms moz webkit o'.split(' '),
            i = 0,
            len = vendors.length;

        if(settings.USE_RAF){
            for(; i < len && !requestAnimFrame; i++){
                requestAnimFrame = win[vendors[i] + 'RequestAnimationFrame'];
                cancelAnimFrame = win[vendors[i] + 'CancelAnimationFrame'] || win[vendors[i] + 'CancelRequestAnimationFrame'];
            }
        }

        requestAnimFrame || (requestAnimFrame = function(callback){
            return win.setTimeout(callback, settings.INTERVAL);
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

    function start(){
        requestId = requestAnimFrame(arguments.callee);
        tick();
    }
    
    function stop(){
        cancelAnimFrame(requestId);
        requestId = undefined;
    }

    return {
        enter : function(callback, context){
            // if the callback function has registered, skip it
            if(callback.tickId) return;

            callback.tickId = 'tick-' + zita.guid();
            tickers.push({
                context : context || this,
                callback : callback
            });

            if(tickers.length == 1){
                start();
            }

            return callback;
        },

        leave : function(callback){
            var ticker,
                i = 0,
                len = tickers.length;

            if(!callback){
                tickers.length = 0;
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

})({
    USE_RAF : true,
    INTERVAL : 1000 / 60
});

zita.event = (function(){

    function Event(context){
        zita.data(this, 'events', {});
        this.context = context;
    }

    Event.prototype = {
        on : function(name, callback){
            var events = zita.data(this, 'events'),
                handlers = events[name] || (events[name] = []);

            if(callback.eventId) return;

            callback.eventId = 'event-' + zita.guid();
            handlers.push({
                context : this.context || this,
                callback : callback
            });

            return callback;
        },

        off : function(name, callback){
            var events = zita.data(this, 'events'),
                handlers = events[name],
                handler, 
                i = 0, len;

            if(!handlers) return;
            len = handlers.length;

            if(!callback){
                handlers.length = 0;
                delete events[name];
            }else{
                if(!callback.eventId) return;

                for(; i < len; i++){
                    handler = handlers[i];
                    if(callback.eventId === handler.callback.eventId){
                        callback = handler.callback;
                        delete callback.tickId;

                        handlers.splice(i, 1);
                        
                        break;
                    }
                }
            }

            return callback;
        },

        emit : function(name){
            var events = zita.data(this, 'events'),
                handlers = events[name],
                handler,
                i = 0, len,
                args = _slice(arguments, 1);

            if(!handlers) return;
            len = handlers.length;

            for(; i < len; i++){
                handler = handlers[i];
                handler.callback.apply(handler.context, args);
            }
        }
    };

    Event.global = new Event(zita);

    Event.create = function(context){
        return new Event(context);
    };

    _each('on off emit'.split(' '), function(value){
        Event.create[value] = function(){
            Event.global[value].apply(Event.global, arguments);
        };
    });

    return Event.create;

})();

zita.queue = (function(){

    function Queue(context){
        zita.data(this, 'queues', {});
        this.context = context;
    }

    Queue.prototype = {
        push : function(name, callback){
            var queues = zita.data(this, 'queues'),
                players = queues[name] || (queues[name] = []);

            if(zita.isArray(callback)){
                queues[name] = zita.clone(callback);
            }else{
                players.push({
                    context : this.context || this,
                    callback : callback
                });
            }
        },

        next : function(name){
            var queues = zita.data(this, 'queues'),
                players = queues[name],
                player;

            if(!players) return;
            
            player = players.shift();
            if(player){
                player.callback.call(player.context);
            }

            if(!players.length){
                delete queues[name];
            }
        },

        clear : function(name){
            var queues = zita.data(this, 'queues'),
                players = queues[name];

            players && (delete queues[name]);
        }
    };

    Queue.global = new Queue(zita);

    Queue.create = function(context){
        return new Queue(context);
    };

    _each('push next clear'.split(' '), function(value){
        Queue.create[value] = function(){
            Queue.global[value].apply(Queue.global, arguments);
        };
    });

    return Queue.create;

})();

zita.fsm = (function(){

    var machines = {};

    function Fsm(initial){
        this.cache = {length : 0};
        this.map = {};

        this.id = 'fsm-' + zita.guid();
        this.asyn = false;

        this.index = this.cacheState(initial || 'none');
    }

    Fsm.prototype = {
        mapState : function(action, transit){
            var prev = this.cacheState(transit.from || 'none'),
                next = this.cacheState(transit.to);

            action = this.map[action] || (this.map[action] = []);
            action[prev] = next;
        },

        cacheState : function(name){
            var index;

            if(this.cache[name] != undefined){
                index = this.cache[name];
            }else{
                index = this.cache.length++;

                // bi-directional references
                this.cache[name] = index;
                this.cache[index] = name;
            }

            return index;
        },

        getState : function(index){
            return this.cache[index || this.index];
        },

        bindEvent : function(name, callback){
            return zita.event.on(this.id + '-' + name, callback, this);
        },

        unbindEvent : function(name, callback){
            return zita.event.off(this.id + '-' + name, callback);
        },

        doAction : function(name, asyn){
            var action = this.map[name],
                state, next = {};

            if(this.asyn) return;

            state = this.getState(this.index);

            next.index = action[this.index];
            next.state = this.getState(next.index);

            zita.queue.add(this.id + '-asyn', function(){
                this.asyn = true;

                zita.event.emit(this.id + '-leave:' + state, name);

                if(!asyn){
                    zita.queue.next(this.id + '-asyn');
                }
            }, this);

            zita.queue.add(this.id + '-asyn', function(){
                this.asyn = false;

                this.index = next.index;
                zita.event.emit(this.id + '-enter:' + next.state, name);
            }, this);

            zita.queue.next(this.id + '-asyn');
        },

        syncState : function(){
            if(!this.asyn) return;
            zita.queue.next(this.id + '-asyn');
        }
    }

    return {
        create : function(name, options){
            var machine = machines[name] || (machines[name] = new Fsm(options.initial));

            _each(options.transits, function(transit){
                machine.mapState(transit.action, transit);
            });

            _each(options.events, function(event){
                machine.bindEvent(event.name, event.callback);
            });

            return machine;
        },

        add : function(name, transit){
            var machine = machines[name];

            if(!machine) return;
            machine.mapState(transit.action, transit);
        },

        fire : function(name, action, asyn){
            var machine = machines[name];

            if(!machine) return;
            machine.doAction(action, asyn);
        },

        sync
         : function(name){
            var machine = machines[name];

            if(!machine) return;
            machine.syncState();
        },

        on : function(name, event, callback){
            var machine = machines[name];

            if(!machine) return;
            machine.bindEvent(event, callback);
        },

        off : function(name, event, callback){
            var machine = machines[name];

            if(!machine) return;
            machines.unbindEvent(event, callback);
        }
    }

})();

})(window);
