function Trash(id, type, enemy, damage, tower_current_position){ //снаряд!
	selfTrash = this;
	this.id = id;
	this.type = type;
	this.path_point;		//куда стремиться пуля, если не указан враг
	this.damage = damage; 	//урон рассчитывается в башне и приходит в пулю, таким образом отсекаются все возможные путаницы с апгрейдами башен во время полета снаряда
	this.enemy = enemy;
	this.path_well = 0;
	this.current_position = {"left": tower_current_position["left"], "top": tower_current_position["top"]};
	
	this.image = trash_params[type].image[0];
	this.speed = trash_params[type].speed;
	
	this.move = function(delay, enemy_current_position){
		if(enemy_current_position == {})return;
		return this.moveObj(delay, true, enemy_current_position);
	};
	
}

Trash.prototype = Object.create(Move.prototype);