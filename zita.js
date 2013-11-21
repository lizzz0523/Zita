/*
	by liz
*/

;(function(exports, undefined){

var zita = exports.zita = {};


// array or object

zita.each = function(obj, callback){
	var i = 0, key;

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
		key = zita.key(obj);
		for(; i < key.length; i++){
			if(callback.call(zita, key[i], obj[key[i]], obj) === false) break;
		}
	}

	return;
}

zita.key = function(obj){
	var res = [],
		prop;
	
	for(prop in obj){
		if(!obj.hasOwnProperty(prop)) continue;
		res.push(prop);
	}

	return res;
}

zita.value = function(obj){
	var res = [];
		prop;

	for(prop in obj){
		if(!obj.hasOwnProperty(prop)) continue;
		res.push(obj[prop]);
	}

	return res;
}


// function

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

	function now(){
		return (new Date).getTime();
	}

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

zita.contains = function(root, node){
	var cur;

	if(!node || !node.nodeType || node.nodeType != 1) return false;

	if(root.contains){
		return root.contains(node);
	}

	if(root.compareDocumentPosition){
		// DOCUMENT_POSITION_DISCONNECTED            1
		// DOCUMENT_POSITION_PRECEDING               2
		// DOCUMENT_POSITION_FOLLOWING               4
		// DOCUMENT_POSITION_CONTAINS                8
		// DOCUMENT_POSITION_CONTAINED_BY            16
		// DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC 32
		return !!(root.compareDocumentPosition(node) & 16);
	}

	cur = node;
	while(cur){
		if(cur == root) return true;
		cur = node.parentNode;
	}

	return false;
}


// tools

zita.Ticker = (function(){

	var win = exports,

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
			if(callback.tickId) return;

			callback.tickId = 'tick-' + tickId++;
			tickers.push({
				callback : callback,
				context : context || win
			});

			if(tickers.length == 1) run();
		},
		remove : function(callback){
			var ticker,
				i = 0,
				len = runers.length;

			if(!callback){
				tickers = [];
			}else{
				if(!callback.tickId) return;

				for(; i < len; i++){
					ticker = tickers[i];
					if(callback.tickId == ticker.callback.tickId){
						tickers.splice(i, 1);
						delete callback.tickId;
						break;
					}
				}
			}
			
			if(!tickers.length){
				stop();
			}
		}
	}
		
})();


})(window);
