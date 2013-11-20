/*
	by liz
*/

;(function(exports, undefined){

var zita = exports.zita = {};


// array or object

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


})(window);
