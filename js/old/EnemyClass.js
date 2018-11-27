function Enemy(id, type, index_point, current_position, end_point) { //супостат

	//PROPERTIES
	this.id = id;
	this.type = type;
	params = enemy_params[this.type];
	
	this.index_point = index_point;
	this.path_point = end_point;			//точка пути (куда идёт моб)
	this.on_last_point = false;				//достиг ли супостат последней точки
	this.distance_traveled = 0;				//пройденный супостатом путь
	this.is_active = false;
	
	this.image = params.image;				//картинка супостата
	this.speed = params.speed;				//скорость (px per sec)
	this.health = params.health;			//здоровье
	this.death_price = params.death_price;	//материальная выгода убийства
	
	enemy_left = current_position["left"];
	enemy_top = current_position["top"];
	this.current_position = {"left": enemy_left, "top": enemy_top};
	//this.getCurrentPosition(this.current_position, this.image); 	//текущее положение супостата

	//WELLS
	this.path_well = 0;	//"колодец" пройденного пути
	
	//FUNCTIONS
	
	this.move = function(game_field, delay, path, plus_speed = true){
		
		this.distance_traveled += this.speed * delay;
		new_end_point = this.moveObj(delay);

		if(new_end_point){ //если супостат достиг следующей точки
			this.index_point++;
			if(this.index_point == path.length){ //если эта точка последняя на карте
				console.log(this.index_point + ": " + this.type + ": current_position[" + this.current_position["left"] + ", " + this.current_position["top"] + "]" + 
																  "	 path_point[" + this.path_point["left"] + ", " + this.path_point["top"] + "]");
				this.on_last_point = true; //дошел до последней точки
				return 1;
			}else{
				this.path_point = path[this.index_point]; //перевести на новую точку
				if(this.path_well >= 1) this.move(game_field, delay, path, false);
				console.log(this.index_point + ": " + this.type + ": current_position[" + this.current_position["left"] + ", " + this.current_position["top"] + "]" + 
																  "	 path_point[" + this.path_point["left"] + ", " + this.path_point["top"] + "]");
				return 0;
			}
		}else{
			//console.log(this.index_point + ": " + this.type + ": " + this.current_position["left"]);
		}
		return 0;
	};
	



	this.death = function(enemy_array, index){
		var res = false;
		if(this.on_last_point)
			res = 0;
		else if(this.health <= 0)
			res = this.death_price;
		return res;
	};
	
	/*на будущее*/
	this.buff = new Array();
	this.debuff = new Array();
	
}

Enemy.prototype = Object.create(Move.prototype);
