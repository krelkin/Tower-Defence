function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

function iObject(){
	
}

iObject.prototype = {
	last_id: 0,
	create:function(filename, id, top, left){
		
		obj = $("<div>", {
			id: "d" + id,
			style: "position:fixed; z-index:10; display: inline; top: " + top + "; left: " + left
			});
		obj.append( $("<img>", {src: filename}));
		
		$("#field").append(obj);
		
		return obj;
	},
	moove:function(){},
	destroy:function(){}
}





