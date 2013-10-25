/*
	by liz
*/
;(function(exports, undefined){

var zita = {};

zita.each = function(obj, callback){
	var i = 0, j, key;

	if(obj == null) return;

	if(obj.length){
		j = obj.length;
		for(; i < j; i++){
			if(callback.call(zita, i, obj[i], obj) === false) break;
		}
	}else{
		key = zita.key(obj);
		j = key.length;
		for(; i < j; i++){
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

zita.debounce = function(callback, delay){
	var timer = null,
		cb = callback;

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


})(window);
