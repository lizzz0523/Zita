/*
    by liz
*/

;(function(exports
    ){

var zita = exports.zita = {
        version : '0.0.1',
        arr : [],
        obj : {},
        noop : function(){},
        identity : function(x){return x}
    };


var IS_DONTENUM_BUG = !({toString : 1}).propertyIsEnumerable('toString'),

    aEnum = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ],

    mType = {
        '[object Number]'   : 'number',
        '[object Boolean]'  : 'boolean',
        '[object String]'   : 'string',
        '[object Array]'    : 'array',
        '[object Object]'   : 'object',
        '[object Function]' : 'function',
        '[object Date]'     : 'date',
        '[object RegExp]'   : 'regexp',
        '[object Error]'    : 'error'
    },

    mChar = {
        encode : {
            '<'  : '&lt;',
            '>'  : '&gt;',
            '&'  : '&amp;',
            '"'  : '&quot;',
            '\'' : '&#39;'
        },

        decode : {
            '&lt;'   : '<',
            '&gt;'   : '>',
            '&amp;'  : '&',
            '&quot;' : '"',
            '&#39;'  : '\''
        },

        escape : {
            '\b' : '\\b',
            '\t' : '\\t',
            '\n' : '\\n',
            '\f' : '\\f',
            '\r' : '\\r',
            '"'  : '\\"',
            '\\' : '\\\\'
        }
    },

    rChar = {
        encode : /[&<>"']/g,

        decode : /&(?:amp|lt|gt|quot|#39);/g,

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


// native method

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
    nativeHasProperty = zita.obj.hasOwnProperty,
    nativeToString = zita.obj.toString,

    // native func method
    nativeBind = zita.noop.bind;


// native method shortcur

var _slice = function(arr, start, end){
        return nativeSlice.call(arr, start, end);
    },

    _string = function(obj){
        return nativeToString.call(obj);
    },

    _now = Date.now || function(){
        return (new Date).getTime();
    };


// core method

var _type = function(obj){
    var type = typeof obj;

    if(obj == null) return String(obj);

    return type == 'object' || type == 'function' 
    ? mType[_string(obj)] || 'object' 
    : type;
};

var _isArray = Array.isArray || function(obj){
    return _type(obj) == 'array';
};

// fix chrome(1-12) bug and use a faster solution
var _isFunction = typeof /./ != 'function'
? function(obj){
    return typeof obj == 'function';
}
: function(obj){
    return _type(obj) == 'function';
};

var _has = function(obj, key){
    return nativeHasProperty.call(obj, key);
};

var _keys = Object.keys || function(obj){
    var res = [],
        prop, len;
    
    for(prop in obj){
        if(_has(obj, prop)) res.push(prop);
    }

    // fix don't enum bug
    if(IS_DONTENUM_BUG){
        len = aEnum.length;
        while(len--){
            if(_has(obj, aEnum[len])) res.push(aEnum[len]);
        }
    }

    return res;
};
    
var _values = function(obj){
    var res = [],
        prop, len;

    for(prop in obj){
        if(_has(obj, prop)) res.push(obj[prop]);
    }

    // fix don't enum bug
    if(IS_DONTENUM_BUG){
        len = aEnum.length;
        while(len--){
            if(_has(obj, aEnum[len])) res.push(aEnum[len]);
        }
    }

    return res;
};

var _each = function(list, iterator){
    var keys,
        i = -1;

    if(list == null) return;

    // in this core each method
    // we use while loop instead of for loop
    // for improving the efficiency

    // and use list.length in break condition
    // for reserving dynamic

    if(_isArray(list)){
        // if list is an array
        while(++i < list.length){
            if(iterator.call(zita, list[i], i, list) === false) break;
        }
    }else{
        // if list is an object
        keys = _keys(list);
        while(++i < keys.length){
            if(iterator.call(zita, list[keys[i]], keys[i], list) === false) break;
        }
    }

    return list;
};

var _some = function(list, iterator){
    var res = false;

    _each(list, function(value, key, list){
        // because the nativeForEach function couldn't break by return false
        // and I use this || condition to make it stop
        // if(res || (res = !!iterator.apply(zita, arguments))) return false;
        if(res = !!iterator.call(zita, value, key, list)) return false;
    });

    return res;
};

var _every = function(list, iterator){
    var res = true;

    _each(list, function(value, key, list){
        // because the nativeForEach function couldn't break by return false
        // and I use this && condition to make it stop
        // if(res && !(res = !!iterator.apply(zita, arguments))) return false;
        if(!(res = !!iterator.call(zita, value, key, list))) return false;
    });

    return res;
};

var _map = function(list, iterator){
    var res = [];

    _each(list, function(value, key, list){
        res.push(iterator.call(zita, value, key, list));
    });

    return res;
};

var _reduce = function(list, iterator, memo){
    var res = memo;

    _each(list, function(value, key, list){
        if(res == void 0){
            res = value;
        }else{
            res = iterator.call(zita, res, value, key, list);
        }
    });

    return res;
};

var _find = function(list, iterator){
    var res;

    _each(list, function(value, key, list){
        if(iterator.call(zita, value, key, list)){
            res = value;
            return false;
        }
    });

    return res;
};

var _filter = function(list, iterator){
    var res = [];

    _each(list, function(value, key, list){
        if(iterator.call(zita, value, key, list)){
            res.push(value);
        }
    });

    return res;
};

// function _flatten can make structure like [[], [], [], [], ...]
// become a flatten (a single level) one ([])
var _flatten = function(arr, shallow, memo){
    var res = memo || [],
        value,
        i = -1,
        len = arr.length;

    while(++i < len){
        value = arr[i];

        if(!_isArray(value)){
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
                _flatten(value, shallow, res);
            }
        }
    }

    return res;
};

var _compare = function(a, b){
    if(a !== b){
        if(a > b || a == void 0) return 1;
        if(a < b || b == void 0) return -1;
    }
    return 0;
};

var _nextIndex = function(arr, prev){
    var next = prev + 1;

    if(next >= arr.length) return -1;
    while(_compare(arr[next], arr[prev]) == 0 && next++ < arr.length);
    
    return next;
};

var _binarySearch = function(arr, target){
    var pivot,
        low = 0,
        high = arr.length;

    while(low < high){
        pivot = (low + high) >>> 1; // equal to Math.floor((low + high) / 2);
        _compare(arr[pivot], target) < 0 ? low = pivot + 1 : high = pivot;
    }

    return low;
};

var _quickSort = (function(){

    function sort(arr, low, high){            
        var pivot = arr[(low + high) >>> 1],
            i = low,
            j = high,
            tmpi,
            tmpj;
            // temp;

        if(low < high){
            while(true){
                while(_compare(arr[i], pivot) < 0) i++;
                while(_compare(arr[j], pivot) > 0) j--;
                
                if(i < j){
                    
                    // if tmpi === tmpj,
                    // left point move next, right point move previ and continue loop
                    // otherwise sorter will fail into endless loop 
                    tmpi = arr[i];
                    tmpj = arr[j];
                    if ( tmpi !== tmpj ) {
                        arr[i] = tmpj;
                        arr[j] = tmpi;
                    } else {
                        i++;
                        j--;
                    }
                    // temp = arr[i];
                    // arr[i] = arr[j];
                    // arr[j] = temp;

                    continue;
                }
                
                break;
            }

            sort(arr, low, i - 1);
            sort(arr, j + 1, high);
        }

        return arr;
    }

    return function(arr){
        return sort(_slice(arr), 0, arr.length - 1);
    }

})();

var _unique = function(arr){
    var res = [];
        i = 0,
        len = arr.length;

    res.push(arr[0]);

    while(++i < len){
        if(res[res.length - 1] != arr[i]){
            res.push(arr[i]);
        }
    }

    return res;
};

var _difference = (function(){

    function filter(a, b){
        var i = j = 0,
            res = [];

        while(i != -1 && j != -1){
            if(_compare(a[i], b[j]) == 0){
                i = _nextIndex(a, i);
                j = _nextIndex(b, j);
            }else{
                if(_compare(a[i], b[j]) < 0){
                    res.push(a[i]);
                    i = _nextIndex(a, i);
                }else{
                    res.push(b[j]);
                    j = _nextIndex(b, j);
                }
            }
        }

        if(i == -1 && j != -1){
            nativePush.apply(res, _slice(b, j));
        }

        if(j == -1 && i != -1){
            nativePush.apply(res, _slice(a, i));
        }

        return res;
    }

    return function(arr, rest){
        var res = arr,
            i = -1,
            len = rest.length;

        while(++i < len){
            res = filter(res, rest[i]);
        }

        return res;
    };

})();

var _intersection = (function(){

    function filter(a, b){
        var i = j = 0,
            res = [];

        while(i != -1 && j != -1){
            if(_compare(a[i], b[j]) == 0){
                res.push(a[i]);
                i = _nextIndex(a, i);
                j = _nextIndex(b, j);
            }else{
                if(_compare(a[i], b[j]) < 0){
                    i = _nextIndex(a, i);
                }else{
                    j = _nextIndex(b, j);
                }
            }
        }

        return res;
    }

    return function(arr, rest){
        var res = arr,
            i = -1,
            len = rest.length;

        while(++i < len){
            res = filter(res, rest[i]);
        }

        return res;
    };

})();

var _delay = function(callback, delay, args, context){
    context = context || window;

    return setTimeout(function(){
        callback.apply(context, args);
    }, delay);
};


// list: array or object

zita.each = function(list, iterator){
    // use the native ecmascript 5 each;
    if(list.forEach && list.forEach === nativeForEach){
        // don't support break the loop 
        return list.forEach(iterator, zita);
    }

    return _each(list, iterator);
};

zita.some = function(list, iterator){
    // use the native ecmascript 5 some;
    if(list.some && list.som === nativeSome){
        return list.some(iterator, zita);
    }

    return _some(list, iterator);
};

zita.every = function(list, iterator){
    // use the native ecmascript 5 every;
    if(list.every && list.every === nativeEvery){
        return list.every(iterator, zita);
    }

    return _every(list, iterator);
};

zita.map = function(list, iterator){
    // use the native ecmascript 5 map;
    if(list.map && list.map === nativeMap){
        return list.map(iterator, zita);
    }

    return _map(list, iterator);
};

zita.reduce = function(list, iterator, memo){
    var callback;

    // use the native ecmascript 5 reduce;
    if(list.reduce && list.reduce === nativeReduce){
        callback = iterator;
        iterator = function(seen, value, key, list){
            return callback.call(zita, seen, value, key, list);
        }
        return memo != void 0 ? list.reduce(iterator, memo) : list.reduce(iterator);
    }

    return _reduce(list, iterator, memo);
};

zita.invoke = function(list, method){
    var args = _slice(arguments, 2),
        isFunc = _isFunction(method);

    return _map(list, function(value){
        return (isFunc ? method : value[method]).apply(value, args);
    });
};

zita.pluck = function(list, key){
    return _map(list, function(value){
        return value[key];
    });
};

zita.find = function(list, iterator){
    if(list.find && list.find === nativeFind){
        return list.find(iterator, zita);
    }

    return _find(list, iterator);
};

zita.filter = function(list, iterator){
    if(list.filter && list.filter === nativeFilter){
        return list.filter(iterator, zita);
    }

    return _filter(list, iterator);
}

zita.reject = function(list, iterator){
    return _filter(list, function(value, key, list){
        return !iterator.call(zita, value, key, list);
    });
};

zita.where = function(list, props, first){
    return (first ? _find : _filter)(list, function(value){
        return zita.matches(value, props);
    });
};

zita.max = function(list, iterator){
    var max = {proxy : -Infinity, value : -Infinity};

    _each(list, function(value, key, list){
        var proxy = iterator ? iterator.call(zita, value, key, list) : value;

        if(proxy > max.proxy){
            max.proxy = proxy;
            max.value = value;
        }
    });

    return max.value;
};

zita.min = function(list, iterator){
    var min = {proxy : Infinity, value : Infinity};

    _each(list, function(value, key, list){
        var proxy = iterator ? iterator.call(zita, value, key, list) : value;

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
        i = -1,
        len = args.length;

    if(dest == null) return null;

    if(_isArray(dest)){
        nativePush.apply(dest, _flatten(args, true));
    }else{
        while(++i < len){
            _each(args[i], function(value, key){
                dest[key] = value;
            });
        }
    }

    return dest;
};

zita.clone = function(orig){
    return _isArray(orig) ? _slice(orig) : zita.merge({}, orig);
};

zita.size = function(list){
    if(list == null) return 0;

    if(_isArray(list)){
        return list.length;
    }else{
        return _keys(list).length;
    }
};

zita.toArray = function(list){
    if(_isArray(list)){
        return _slice(list);
    }else{
        return _values(list);
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
        if(value && _isFunction(value.toJSON)){
            return value.toJSON(key);
        }

        switch(_type(value)){
            case 'date' :
                if(value.toJSON)
                return isFinite(value.valueOf())
                ? value.getUTCFullYear()        + '-' +
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
                partial = _map(value, function(v, k, value){
                    return (v = walk(k, value, stack)) || 'null';
                });
                stack.pop();

                return partial.length === 0
                ? '[]'
                : '[' + partial.join(',') + ']';

            case 'object' :
                if(zita.contains(stack, value)) return '{}';

                stack.push(value);
                partial = _map(value, function(v, k, value){
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
                return void 0;
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

zita.initial = function(arr, length){
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
    return _some(arr, function(value){
        return value === target;
    });
};

zita.sort = function(arr){
    if(arr.length < 1000){
        return arr.sort(_compare);
    }else{
        return _quickSort(arr);
    }
};

zita.unique = function(arr){
    var sorted = false,
        res = [];

    if(typeof arr == 'boolean'){
        sorted = arr;
        arr = arguments[1];
    }

    if(sorted){
        return _unique(arr);
    }

    _each(arr, function(value, index){
        if(!zita.contains(res, value)){
            res.push(value);
        }
    });

    return res;
};

zita.difference = function(arr){
    var sorted = false,
        args = _slice(arguments, 1);

    if(typeof arr == 'boolean'){
        sorted = arr;
        arr = args.shift();
    }

    if(sorted){
        return _difference(arr, args);
    }

    // at first, we should flatten (merge) all array which need to be detected 
    args = _flatten(args, true);

    return _filter(zita.unique(arr), function(value){
        return !zita.contains(args, value);
    });
};

zita.intersection = function(arr){
    var sorted = false,
        args = _slice(arguments, 1);

    if(typeof arr == 'boolean'){
        sorted = arr;
        arr = args.shift();
    }

    if(sorted){
        return _intersection(arr, args);
    }

    return _filter(zita.unique(arr), function(value){
        return _every(args, function(rest){
            return zita.contains(rest, value);
        });
    });
};

zita.without = function(arr){
    return zita.difference(arr, _slice(arguments, 1));
};

zita.union = function(){
    return zita.unique(_flatten(_slice(arguments), true));
};

zita.flatten = function(arr, shallow){
    if(shallow && _every(arr, _isArray)){
        return nativeConcat.apply([], arr);
    }
    return _flatten(arr, shallow, []);
};

zita.indexOf = function(arr, target, sorted){
    var res = -1,
        len = arr.length;

    if(arr == null) return -1;

    if(sorted){
        if(sorted === true && arr[0] < arr[len - 1]){
            // if array is sorted (asc), use fast binary search instead
            res = _binarySearch(arr, target);
            return arr[res] == target ? res : -1;
        }else{
            sorted = sorted >>> 0; // force the variable covert to a number : false -> 0
            res = (sorted < 0 ? Math.max(0, len + sorted) : sorted) - 1;
        }
    }

    if(arr.indexOf && arr.indexOf === nativeIndexOf){
        return res != void 0 ? arr.indexOf(target, res) : arr.indexOf(target);
    }

    while(++res < len){
        if(arr[res] === target) return res;
    }

    return -1;
};

zita.lastIndexOf = function(arr, target, from){
    var res = arr.length;

    if(arr == null) return -1;

    if(arguments.length > 2) {
        res = from < 0 ? res + from : from;
    }

    if(arr.lastIndexOf && arr.lastIndexOf === nativeLastIndexOf){
        return res != void 0 ? arr.lastIndexOf(target, res) : arr.lastIndexOf(target);
    }

    while(res--){
        if(arr[res] === target) return res;
    }

    return -1;
};


// object

zita.has = _has;
zita.values = _values;
zita.keys = _keys;

zita.type = _type;
zita.isArray = _isArray;
zita.isFunction = _isFunction;

_each('Number Boolean String Date RegExp'.split(' '), function(type){
    zita['is' + type] = function(obj){ return _type(obj) == type.toLowerCase(); };
});

zita.isUndefined = function(obj){
    return obj == void 0;
};

zita.isNull = function(obj){
    return obj == null;
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

zita.isEqual = (function(){

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

zita.invert = function(obj){
    var res = {},
        keys = _keys(obj),
        i = -1,
        len = keys.length;

    while(++i < len){
        res[obj[keys[i]]] = keys[i];
    }

    return res;
};

zita.matches = function(obj, props){
    if(obj === props) return true;
    return _every(props, function(value, key){
        return key in obj && obj[key] === value;
    });
};

zita.pick = function(obj){
    var res = {},
        keys = _slice(arguments, 1),
        len = keys.length;

    while(len--){
        res[keys[len]] = obj[keys[len]];
    }

    return res;
};

zita.omit = function(obj){
    var res = {},
        keys = zita.difference(_keys(obj), _slice(arguments, 1)),
        len = keys.length;

    while(len--){
        res[keys[len]] = obj[keys[len]];
    };

    return res;
};


// function

zita.now = _now;

zita.bind = (function(){

    var proxy = function(){};

    return function(callback, context){
        var args, bound, self;

        // make sure browser support the functing binding
        // and not be overrided
        if(callback.bind && callback.bind === nativeBind){
            return nativeBind.apply(callback, _slice(arguments, 1));
        }

        args = _slice(arguments, 2);

        return bound = function(){
            if(!(this instanceof bound)) return callback.apply(context, args.concat(_slice(arguments)));

            proxy.prototype = callback.prototype;
            self = new proxy();
            proxy.prototype = null;

            callback.apply(self, args.concat(_slice(arguments)));
            
            return self;
        };
    };

})();

zita.curry = function(callback){
    var args = _slice(arguments, 1);

    return function(){
        return callback.apply(zita, args.concat(_slice(arguments)));
    };
};

zita.uncurry = function(callback){
    return function(context){
        return callback.apply(context, _slice(arguments, 1));
    };
};

zita.wrap = function(callback, wraper){
    return zita.currier(wraper, callback);
};

zita.cache = function(callback, hasher){
    var res = {};

    hasher = hasher || zita.identity;
    return function(){
        var key = hasher.apply(zita, arguments);

        return _has(res[key]) ? res[key] : (res[key] = callback.apply(zita, arguments));
    }
};

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
        timerId = _delay(callback, delay, [], zita);
    };
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
    };
};

zita.delay = function(callback, delay){
    var args = _slice(arguments, 2);

    return _delay(callback, delay || 10, args, zita);
};

// delay 0.01ms
// to force the callback function push into of event loop
zita.defer = function(callback){
    var args = _slice(arguments, 1);

    return _delay(callback, 0.01, args, zita);
};

zita.after = function(callback, times){
    return function(){
        if(times > 0){
            times--;
            return;
        }

        return callback.apply(zita, arguments);
    };
};

zita.once = function(callback){
    var ative = true;
        res;

    return function(){
        if(!active) return res;

        res = callback.apply(zita, arguments);
        callback = null;
        active = false;
        
        return res;
    };
};


// string

_each('encode decode'.split(' '), function(method){
    zita[method] = function(str){
        if(str == null) return '';

        return String(str).replace(rChar[method], function(match){
            return mChar[method][match];
        });
    };
});

zita.escape = function(str){
    if(str == null) return '';

    return String(str).replace(rChar.escape, function(match){
        return mChar.escape[match] || '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
    });
};

zita.trim = function(str){
    return String(str).replace(rChar.trim, '');
};

zita.camelCase = function(str){
    return String(str).replace(rChar.camelCase, function(all, first){
        return first.toUpperCase();
    });
};

zita.truncate = function(str, length, truncate){
    var len = Math.max(length || 30, 0);

    if(str.length < len) return str;
    return String(str).slice(0, len) + (truncate == void 0 ? '...' : truncate);
};

zita.parseQuery = function(str, separator){
    var query = String(str).match(rChar.query),
        key, value;

    if(query == null) return {};

    query = query.pop();
    separator = separator || '&';

    return _reduce(query.split(separator), function(hash, pair){
        if(pair.indexOf('=') != -1){
            pair = decodeURIComponent(pair).split('=');

            key = pair.shift();
            // in case, the value of this part include a equal sign
            // we should join them again
            value = pair.join('=');

            if(value != void 0){
                value = value.replace('+', ' ');
            }

            // if more than one part match the key
            // we should push them in an array
            if(key in hash){
                _isArray(hash[key]) || (hash[key] = [hash[key]]);
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
                if(v != void 0){
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
        str = zita.trim(String(str).replace(rChar.jsonclear, function(a){
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }));

        if(rChar.jsonchars.test(str
            .replace(rChar.jsonescape, '@')
            .replace(rChar.jsontokens, ']')
            .replace(rChar.jsonbraces, '')
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

        if(data != void 0){
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
        requestId = void 0;
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

            if(_isArray(callback)){
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

            if(cache[name] != void 0){
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
            return this.cache[index != void 0 ? index : this.index];
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

            if(next.index == void 0){
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
