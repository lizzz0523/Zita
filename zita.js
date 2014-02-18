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

    // native loop
    nativeForEach = zita.arr.forEach,
    nativeSome = zita.arr.some,
    nativeEvery = zita.arr.every,

    // native map/reduce
    nativeMap = zita.arr.map,
    nativeReduce = zita.arr.reduce,

    // native search
    nativeFind = zita.arr.find,
    nativeFilter = zita.arr.filter,
    nativeIndexOf = zita.arr.indexOf,
    nativeLastIndexOf = zita.arr.lastIndexOf,

    // native obj method
    nativeKeys = zita.obj.keys,
    nativeHasProperty = zita.obj.hasOwnProperty,
    nativeToString = zita.obj.toString,

    // native func method
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


// list: array or object

var _each = zita.each = function(list, iterator){
    var keys, i = 0;

    if(list == null) return;

    // use the native ecmascript 5 each;
    if(list.forEach && list.forEach === nativeForEach){
        // don't support break the loop 
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

zita.reduce = function(list, iterator, memo){
    var res = memo;

    if(list.reduce && list.reduce === nativeReduce){
        iterator = zita.bind(iterator, zita);
        return res != undefined ? list.reduce(iterator, res) : list.reduce(iterator);
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

zita.some = function(list, iterator){
    var res = false;

    if(list.some && list.som === nativeSome){
        return list.some(iterator, zita);
    }

    _each(list, function(){
        // because the nativeForEach function couldn't break by return false
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
        // because the nativeForEach function couldn't break by return false
        // and I use this && condition to make it stop
        if(res && !(res = !!iterator.apply(zita, arguments))) return false;
    });

    return res;
};

zita.find = function(list, iterator){
    var res;

    if(list.find && list.find === nativeFind){
        return list.find(iterator, zita);
    }

    // instead of using function _each
    // here I use function _some to break the loop when we find the target
    zita.some(list, function(value){
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

zita.reject = function(list, iterator){
    return zita.filter(list, function(){
        return !iterator.apply(zita, arguments);
    });
};

zita.where = function(list, props, first){
    return zita[first ? 'find' : 'filter'](list, function(value){
        return zita.matches(value, props);
    });
};

zita.invoke = function(list, method){
    var args = _slice(arguments, 2),
        isFunc = zita.isFunction(method);

    return zita.map(list, function(value){
        return (isFunc ? method : value[method]).apply(value, args);
    });
};

zita.pluck = function(list, key){
    return zita.map(list, function(value){
        return value[key];
    });
};

zita.max = function(list, iterator){
    var max = {proxy : -Infinity, value : -Infinity};

    _each(list, function(value){
        var proxy = iterator ? iterator.apply(zita, arguments) : value;

        if(proxy > max.proxy){
            max.proxy = proxy;
            max.value = value;
        }
    });

    return max.value;
};

zita.min = function(list, iterator){
    var min = {proxy : Infinity, value : Infinity};

    _each(list, function(value){
        var proxy = iterator ? iterator.apply(zita, arguments) : value;

        if(proxy < min.proxy){
            min.proxy = proxy;
            min.value = value;
        }
    });

    return min.value;
};

zita.shuffle = function(list){
    var res = zita.toArray(list),
        len = res.length;

    _each(res, function(value, index){
        var rand = zita.random(index, len);

        res[index] = res[rand];
        res[rand] = value;
    });

    return res;
};

zita.merge = function(dest){
    var args = _slice(arguments, 1),
        i = 0,
        len = args.length;

    if(dest == null) return null;

    if(zita.isArray(dest)){
        nativePush.apply(dest, _flat(args, true));
    }else{
        for(; i < len; i++){
            _each(args[i], function(value, key){
                dest[key] = value;
            });
        }
    }

    return dest;
};

zita.toArray = function(list){
    if(zita.isArray(list)){
        return _slice(list);
    }else{
        return zita.values(list);
    }
};

zita.toQuery = function(list){
    // todo: convert a list to a query string
};

zita.toJSON = (function(){

    // reference: http://www.ecma-international.org/ecma-262/5.1/#sec-15.12.3

    function quote(str) {
        return  '"' + zita.escape(str) + '"';
    }

    function format(num){
        return (num < 10 ? '0' : '') + num;
    }

    function toJSON(value, key){
        if(value && _type(value.toJSON) == 'function'){
            return value.toJSON(key);
        }

        switch(_type(value)){
            case 'date' :
                if(value.toJSON)
                return isFinite(value.valueOf())
                ? value.getUTCFullYear()      + '-' +
                format(value.getUTCMonth() + 1) + '-' +
                format(value.getUTCDate())      + 'T' +
                format(value.getUTCHours())     + ':' +
                format(value.getUTCMinutes())   + ':' +
                format(value.getUTCSeconds())   + 'Z'
                : null;

            case 'boolean' :
            case 'number' :
            case 'string' :
                return value.valueOf();
        }

        return value;
    }

    function walk(key, list, stack){
        var value = list[key],
            partial = [];

        // if the value has function toJSON,
        // invoke it
        value = toJSON(value, key);

        switch (_type(value)){
            case 'array' :
                if(zita.contains(stack, value)) return '[]';
                
                stack.push(value);
                partial = zita.map(value, function(v, k, value){
                    return (v = walk(k, value, stack)) || 'null';
                });
                stack.pop();

                return partial.length === 0
                ? '[]'
                : '[' + partial.join(',') + ']';

            case 'object' :
                if(zita.contains(stack, value)) return '{}';

                stack.push(value);
                partial = zita.map(value, function(v, k, value){
                    return (v = walk(k, value, stack)) ? quote(k) + ':' + v : '';
                });
                stack.pop();

                return partial.length === 0
                ? '{}'
                : '{' + partial.join(',') + '}';

            case 'string' :
                return quote(value);

            case 'number' :
                return isFinite(value) ? String(value) : 'null';

            case 'boolean' :
            case 'null' :
                return String(value);

            case 'regexp' :
            case 'error' :
                return '{}';

            default :
                // function / xml / undefined
                return undefined;
        }
    }
    
    return function(list){
        // add the native support
        if(JSON && _type(JSON.stringify) == 'function'){
            return JSON.stringify(list);
        }

        return walk('', {'': list}, []);
    };

})();

zita.clone = function(orig){
    return zita.isArray(orig) ? zita.toArray(orig) : zita.merge({}, orig);
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


// array

zita.range = function(start, stop, step){
    var res = [],
        len;

    if(arguments.length <= 1){
        stop = start;
        start = 0;
    }
    step = step || 1;

    len = Math.max(Math.ceil((stop - start) / step, 0));
    while(len--){
        res.push(start);
        start += step;
    };

    return res;
};

zita.first = function(arr, length){
    if(arr == null) return void 0;
    return _slice(arr, 0, Math.max(length || 1, 0));
};

zita.head = function(arr, length){
    if(arr == null) return void 0;
    return _slice(arr, 0, arr.length - Math.min(length || 1, arr.length));
}

zita.last = function(arr, length){
    if(arr == null) return void 0;
    return _slice(arr, arr.length - Math.min(length || 1, arr.length));
};

zita.rest = function(arr, length){
    if(arr == null) return void 0;
    return _slice(arr, Math.max(length || 1, 0));
};

zita.contains = function(arr, target){
    return zita.some(arr, function(value){
        return value === target;
    });
};

zita.difference = function(arr){
    // at first, we should flatten (merge) all array which need to be detected 
    var args = _flat(_slice(arguments, 1), true);
    return zita.filter(arr, function(value){
        return !zita.contains(args, value);
    });
};

zita.without = function(arr){
    return zita.difference(arr, _slice(arguments, 1));
};

zita.uniq = function(arr, sorted){
    return zita.reduce(arr, function(seen, value, index){
        if(index == 0 || (sorted ? seen[seen.length - 1] != value : !zita.contains(seen, value))){
            seen.push(value);
        }
        return seen;
    }, []);
};

zita.union = function(){
    return zita.uniq(_flat(_slice(arguments), true));
};

// function flatten can make structure like [[], [], [], [], ...]
// become a flatten (a single level) one ([])
var _flat = zita.flatten = function(arr, shallow, memo){
    var res = memo || [],
        value,
        i = 0,
        len = arr.length;
    
    if(shallow && zita.every(arr, zita.isArray)){
        return nativeConcat.apply(res, arr);
    }

    for(; i < len; i++){
        value = arr[i];
        if(!zita.isArray(value)){
            // if the value isn't an array
            // push it into the result directly
            res.push(value);
        }else{
            // if the value is an array
            // we should either merging it into the result
            // or using recursive flatten
            if(shallow){
                nativePush.apply(res, value);
            }else{
                _flat(value, shallow, res);
            }
        }
    }

    return res;
};

zita.indexOf = (function(){

    function binarySearch(arr, target){
        var mid,
            low = 0,
            high = arr.length;

        while(low < high){
            mid = (low + high) >>> 1; // equal to Math.floor((low + high) / 2);
            arr[mid] < target ? low = mid + 1 : high = mid;
        }

        return low;
    }

    return function(arr, target, sorted){
        var res = 0,
            len = arr.length;

        if(arr == null) return -1;

        if(sorted){
            if(sorted === true && arr[i] < arr[len - 1]){
                // if array is sorted (asc), use fast binary search instead
                res = binarySearch(arr, target);
                return arr[res] == target ? res : -1;
            }else{
                sorted = sorted >>> 0; // force the variable covert to a number
                res = sorted < 0 ? Math.max(0, len + sorted) : sorted;
            }
        }

        if(arr.indexOf && arr.indexOf === nativeIndexOf){
            return arr.indexOf(target, res);
        }

        for(; res < len; res++){
            if(arr[res] === target) return res;
        }

        return -1;
    };

})();

zita.lastIndexOf = function(arr, target, from){
    var res = arr.length;

    if(arr == null) return -1;

    if(arguments.length > 2) {
        from = from >>> 0; // force the variable covert to a number
        res = from < 0 ? res + from : from;
    }

    if(arr.lastIndexOf && arr.lastIndexOf === nativeLastIndexOf){
        return from != undefined ? arr.lastIndexOf(target, from) : arr.lastIndexOf(target);
    }

    while(res--){
        if(arr[res] === target) return res;
    }

    return -1;
};


// object

var IS_DONTENUM_BUG = (function(){

        for(var prop in {toString : 1}){
            if(prop == 'toString') return false;
        }
        return true;

    })();

var _has = zita.has = function(obj, key){
    return nativeHasProperty.call(obj, key);
};

zita.keys = function(obj){
    var res = [],
        prop;
    
    for(prop in obj){
        if(!_has(obj, prop)) continue;
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
    var res = [],
        prop;

    for(prop in obj){
        if(!_has(obj, prop)) continue;
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

zita.invert = function(obj){
    var res = {},
        keys = zita.keys(obj),
        i = 0,
        len = keys.length;

    for(; i < len; i++){
        res[obj[keys[i]]] = keys[i];
    }

    return res;
};

zita.matches = function(obj, props){
    if(obj === props) return true;
    return zita.every(props, function(value, key){
        return key in obj && obj[key] === value;
    });
};

zita.pick = function(obj){
    var res = {},
        keys = _slice(arguments, 1),
        i = 0,
        len = keys.length;

    for(; i < len; i++){
        res[keys[i]] = obj[keys[i]];
    }

    return res;
};

zita.omit = function(obj){
    var res = {},
        keys = zita.difference(zita.keys(obj), _slice(arguments, 1)),
        i = 0,
        len = keys.length;

    for(; i < len; i++){
        res[keys[i]] = obj[keys[i]];
    };

    return res;
};

zita.equal = (function(){

    function walk(a, b, aStack, bStack){
        var type;

        // for non-object condition: string/boolean/number/undefined/null
        if(a === b) return a !== 0 || 1 / a === 1 / b;
        // for null, fast track
        if(a == null || b == null) return a === b;

        if((type = _type(a)) != _type(b)) return false;
        switch(type){
            case 'string' :
            case 'function' :
            case 'error' :
                return String(a) == String(b);

            case 'boolean' :
            case 'number' :
            case 'date' :
                // +a/+b will focus object invoke function valueOf
                // so we can compare them in primitive form
                return +a == +b || (a !== a && b !== b) || (a == 0 && 1 / a == 1 / b);

            case 'regexp' :
                return a.source == b.source
                && a.global == b.global
                && a.multiline == b.multiline
                && a.ignoreCase == b.ignoreCase;

            default :
                if(type != 'object' || type != 'array') return false;
        }

        /*
            todo: do a deep comparison of object
        */
    };

    return function(a, b){
        return walk(a, b, [], []);
    };

})();

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
        endtime,
        active;

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
    return zita.delay.apply(zita, _concat([callback, 0.01], _slice(arguments, 1)));
};


// string

var _fChar = (function(){

        var encode = {
            '<' : '&lt;',
            '>' : '&gt;',
            '&' : '&amp;'
        };

        return {
            encode : encode,
            decode : zita.invert(encode),
            escape : {
                '\b' : '\\b',
                '\t' : '\\t',
                '\n' : '\\n',
                '\f' : '\\f',
                '\r' : '\\r',
                '"'  : '\\"',
                '\\' : '\\\\'
            }
        }

    })(),

    _rChar = {
        encode : new RegExp('[' + zita.keys(_fChar.encode).join('') + ']', 'g'),
        decode : new RegExp('(' + zita.keys(_fChar.decode).join('|') + ')', 'g'),
        escape : /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

        trim : /^\s+|\s+$/g,
        camelCase : /-([\da-z])/gi,

        query : /^[^?]*\?(.+)$/,

        jsonclear : /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        jsonchars : /^[\],:{}\s]*$/,
        jsonescape : /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        jsontokens : /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        jsonbraces : /(?:^|:|,)(?:\s*\[)+/g
    };

_each('encode decode'.split(' '), function(method){
    zita[method] = function(str){
        if(str == null) return '';

        return String(str).replace(_rChar[method], function(match){
            return _fChar[method][match];
        });
    };
});

zita.escape = function(str){
    if(str == null) return '';

    return String(str).replace(_rChar.escape, function(match){
        return _fChar.escape[match] || '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
    });
};

zita.trim = function(str){
    return String(str).replace(_rChar.trim, '');
};

zita.camelCase = function(str){
    return String(str).replace(_rChar.camelCase, function(all, first){
        return first.toUpperCase();
    });
};

zita.truncate = function(str, length, truncate){
    var len = Math.max(length || 30, 0);

    if(str.length < len) return str;
    return String(str).slice(0, len) + (truncate == undefined ? '...' : truncate);
};

zita.parseQuery = function(str, separator){
    var query = String(str).match(_rChar.query),
        key, value;

    if(query == null) return {};

    query = query.pop();
    separator = separator || '&';

    return zita.reduce(query.split(separator), function(hash, pair){
        if(pair.indexOf('=') != -1){
            pair = decodeURIComponent(pair).split('=');

            key = pair.shift();
            // in case, the value of this part include a equal sign
            // we should join them again
            value = pair.join('=');

            if(value != undefined){
                value = value.replace('+', ' ');
            }

            // if more than one part match the key
            // we should push them in an array
            if(key in hash){
                zita.isArray(hash[key]) || (hash[key] = [hash[key]]);
                hash[key].push(value);
            }else{
                hash[key] = value;
            }
        }

        return hash;
    }, {});
};

zita.parseJSON = (function(){

    // reference: http://json.org/json2.js

    function walk(key, list, reviver){
        var value = list[key];

        if(value && _type(value) == 'object'){
            _each(value, function(k, v, value){
                v = walk(k, value);
                if(v != undefined){
                    value[k] = v;
                }else{
                    delete value[k];
                }
            })
        }

        return reviver.call(list, key, value);
    }

    return function(str, reviver){
        var res;

        // add the native support
        if(JSON && _type(JSON.parse) == 'function'){
            return JSON.parse(str);
        }

        // clear string
        str = zita.trim(String(str).replace(_rChar.jsonclear, function(a){
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }));

        if(_rChar.jsonchars.test(str
            .replace(_rChar.jsonescape, '@')
            .replace(_rChar.jsontokens, ']')
            .replace(_rChar.jsonbraces, '')
        )){
            res = (new Function('return ' + str))();

            return _type(reviver) === 'function'
            ? walk('', {'': res}, reviver)
            : res;
        }

        return [];
    }

})();


// tools

zita.guid = function(){
    var d = new Date().getTime(), r;

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);

        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};

zita.random = function(min, max){
    if(arguments.length == 1){
        max = min;
        min = 0;
    }

    return min + Math.floor(Math.random() * (max - min));
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
            remove = false,
            i = 1,
            args;

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

    function Fsm(initial, context){
        this.cache = {length : 0};
        this.map = {};

        this.event = zita.event(context);
        this.queue = zita.queue(this);
        this.sync = true;

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
            var cache = this.cache,
                index;

            if(cache[name] != undefined){
                index = cache[name];
            }else{
                index = cache.length++;

                // bi-directional references
                cache[name] = index;
                cache[index] = name;
            }

            return cache[name];
        },

        getState : function(index){
            return this.cache[index != undefined ? index : this.index];
        },

        bindEvent : function(name, callback){
            return this.event.on(name, callback);
        },

        unbindEvent : function(name, callback){
            return this.event.off(name, callback);
        },

        doAction : function(name, asyn){
            var action = this.map[name],
                state, next = {};

            if(!this.sync) return;

            state = this.getState(this.index);

            next.index = action[this.index];
            next.state = this.getState(next.index);

            if(next.index == undefined){
                this.event.emit('error', 'State Transition Error!');
                return;
            }

            this.queue.push('transit', function(){
                this.sync = false;

                this.event.emit('leave:' + state, name);

                if(!asyn){
                    this.queue.next('transit');
                }
            });

            this.queue.push('transit', function(){
                this.sync = true;

                this.event.emit('enter:' + next.state, name);
                this.index = next.index;
            });

            this.queue.next('transit');
        },

        syncState : function(){
            if(this.sync) return;
            this.queue.next('transit');
        }
    }

    Fsm.create = function(options, context){
        var machine = new Fsm(options.initial, context);

        _each(options.transits, function(transit){
            machine.mapState(transit.action, transit);
        });

        _each(options.events, function(event){
            machine.bindEvent(event.name, event.callback);
        });

        return {
            add : function(action, transit){
                machine.mapState(action, transit);
            },

            fire : function(action, asyn){
                machine.doAction(action, asyn);
            },

            sync : function(){
                machine.syncState();
            },

            on : function(event, callback){
                machine.bindEvent(event, callback);
            },

            off : function(event, callback){
                machines.unbindEvent(event, callback);
            }
        };
    };

    return Fsm.create;

})();


// class

zita.view = function(){
    // todo: view creator, the base class for the ZOE jQuery Effects Kit
};

})(window);
