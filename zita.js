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

    _push = function(obj, value, key){
        if(obj.push && obj.push === Array.prototype.push){
            obj.push(value);
            key = obj.length - 1;
        }else{
            key = key || zita.guid();
            obj[key] = value;
        }

        return key;
    },

    _string = function(obj){
        return Object.prototype.toString.call(obj);
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
    if(list.forEach){
        list.forEach(function(){
            return iterator.apply(zita, arguments);
        });

        return;
    }

    if(list.length){
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

zita.reduce = function(list, iterator, memo){
    var res = memo;

    if(list.reduce && list.reduce === Array.prototype.reduce){
        iterator = zita.bind(iterator, zita);
        return res != undefined ? list.reduce(iterator, res) : list.reduce(iterator);
    }

    _each(list, function(value){
        if(res == undefined){
            res = value;
        }else{
            res = iterator.apply(zita, zita.merge([res], _slice(arguments)));
        }
    });

    return res;
};

zita.map = function(list, iterator){
    var res = [];

    if(list.map && list.map === Array.prototype.map){
        return list.map(iterator, zita);
    }

    _each(list, function(){
        res.push(iterator.apply(zita, arguments));
    });

    return res;
};

zita.find = function(list, iterator){
    var res;

    if(list,find && list.find == Array.prototype.find){
        return list.find(iterator, zita);
    }

    _each(list, function(value){
        if(iterator.apply(zita, arguments)){
            res = value;
            return false;
        }
    });

    return res;
};

zita.filter = function(list, iterator){
    var res = [];

    if(list.filter && list.filter === Array.prototype.filter){
        return list.filter(iterator, zita);
    }

    _each(list, function(value){
        if(iterator.apply(zita, arguments)){
            res.push(value);
        }
    });

    return res;
};

zita.every = function(list, iterator){
    var res = true;

    if(list.every && list.every === Array.prototype.every){
        return list.every(iterator, zita);
    }

    _each(list, function(){
        if(!iterator.apply(zita, arguments)){
            res = false;
            return false;
        }
    });

    return res;
};

zita.some = function(list, iterator){
    var res = false;

    if(list.some && list.som === Array.prototype.some){
        return list.some(iterator, zita);
    }

    _each(list, function(){
        if(iterator.apply(zita, arguments)){
            res = true;
            return false;
        }
    });

    return res;
};

zita.contains = function(list, target){
    return zita.some(list, function(value){
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

    /*
        todo: when dest is a array, release it form for loop;
    */
    for(; i < args.length; i++){
        src = args[i];

        if(dest.length){
            dest = dest.concat(src);
        }else{
            keys = zita.keys(src);
            for(; j < keys.length; j++){
                dest[keys[j]] = src[keys[j]];
            }
        }
    }

    return dest;
};

zita.clone = function(orig){
    return zita.merge(orig.length ? [] : {}, orig);
};

zita.size = function(list){
    var keys;

    if(list == null) return 0;

    if(list.length){
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
            ? class2type[_string(obj)] || "object"
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

        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};

zita.ticker = (function(settings){

    var win = exports,

        tickers = [],

        requestAnimFrame,
        cancelAnimFrame,

        timerId;
    
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
        timerId = undefined;
    }

    return {
        add : function(callback, context){
            // if the callback function has registered, skip it
            if(callback.tickId) return;

            callback.tickId = 'tick-' + zita.guid();
            tickers.push({
                callback : callback,
                context : context || zita
            });

            if(tickers.length == 1){
                run();
            }

            return callback;
        },

        remove : function(callback){
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
    useRAF : true,
    interval : 1000 / 60
});

zita.event = (function(){

    var events = {};

    return {
        on : function(name, callback, context){
            var list = events[name] || (events[name] = []);

            if(callback.eventId) return;

            callback.eventId = 'event-' + zita.guid();
            list.push({
                callback : callback,
                context : context || zita
            });

            return callback;
        },

        off : function(name, callback){
            var list = events[name],
                event,
                i = 0, len;

            if(!list) return;
            len = list.length;

            if(!callback){
                list.length = 0;
                delete events[name];
            }else{
                if(!callback.eventId) return;

                for(; i < len; i++){
                    event = list[i];
                    if(callback.eventId === event.callback.eventId){
                        callback = event.callback;
                        delete callback.tickId;

                        list.splice(i, 1);
                        
                        break;
                    }
                }
            }

            return callback;
        },

        emit : function(name){
            var args = _slice(arguments, 1),
                list = events[name],
                event,
                i = 0, len;

            if(!list) return;
            len = list.length;

            for(; i < len; i++){
                event = list[i];
                event.callback.apply(event.context, args);
            }
        }
    }

})();

zita.queue = (function(){

    var queues = {};

    return {
        add : function(name, callback, context){
            var list = queues[name] || (queues[name] = []);

            if(zita.isArray(callback)){
                queues[name] = zita.clone(callback);
            }else{
                list.push({
                    callback : callback,
                    context : context || zita
                });
            }
        },

        next : function(name){
            var list = queues[name],
                queue;

            if(!list) return;
            
            queue = list.shift();
            if(queue){
                queue.callback.call(queue.context);
            }

            if(!list.length){
                delete queues[name];
            }
        },

        clear : function(name){
            var list = queues[name];
            list && (delete queues[name]);
        }
    };

})();

zita.fsm = (function(){

    var machines = {};

    function Fsm(initial){
        this.state = {length : 0};
        this.map = {};

        this.id = 'fsm-' + zita.guid();
        this.asyn = false;

        this.index = this.pushState(initial || 'none');
    }

    Fsm.prototype = {
        mapState : function(action, transit){
            var prev = this.pushState(transit.from || 'none'),
                next = this.pushState(transit.to);

            action = this.map[action] || (this.map[action] = []);
            action[prev] = next;
        },

        pushState : function(name){
            var index;

            if(this.state[name] != undefined){
                index = this.state[name];
            }else{
                index = this.state.length++;

                // bi-directional references
                this.state[name] = index;
                this.state[index] = name;
            }

            return index;
        },

        getState : function(index){
            return this.state[index || this.index];
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
                zita.event.emit(this.id + '-:enter' + next.state, name);
            }, this);

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
            machine.mapState(transit);
        },

        fire : function(name, action, asyn){
            var machine = machines[name];

            if(!machine) return;
            machine.doAction(action, asyn);
        },

        next : function(name){
            var machine = machines[name];

            if(!machine || !machine.asyn) return;
            zita.queue.next(machine.id + '-asyn');
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
