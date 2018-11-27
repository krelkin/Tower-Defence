function Enemy(id, type, index_point, current_position, end_point) { //супостат

	//PROPERTIES
	this.id = id;
	this.type = type;
	params = enemy_params[this.type];
	
	this.index_point = index_point;
	this.path_point = end_point;			//точка пути (куда идёт моб)
	this.vector = "d";							//старая точка пути, к которой идёт моб
	this.on_last_point = false;				//достиг ли супостат последней точки
	this.distance_traveled = 0;				//пройденный супостатом путь
	this.is_active = false;
	this.is_dead = false;
	this.old_current_position = {"left": 0, "top": 0};
	this.animation = {};
	
	this.frame = 0;
	this.all_frame = 0;
	this.action = "walk";
	//this.image = params.images[0];				//картинка супостата
	this.speed = params.speed;				//скорость (px per sec)
	this.health = params.health;			//здоровье
	this.death_price = params.death_price;	//материальная выгода убийства
	
	this.class_image = new Image();
	
	this.current_position = {"left": current_position["left"], "top": current_position["top"]};
	//this.getCurrentPosition(this.current_position, this.image); 	//текущее положение супостата
	this.buff = new Array();
	this.debuff = new Array();
	//WELLS
	this.path_well = 0;	//"колодец" пройденного пути
	this.animation_well = 0;//"колодец" смены анимации
	
	//FUNCTIONS
	
	this.move = function(game_field, delay, path, plus_speed = true){
		
		this.distance_traveled += this.speed * delay;
		this.old_current_position = {"left": this.current_position["left"], "top": this.current_position["top"]};
		new_end_point = this.moveObj(delay);
		
		if(new_end_point){ //если супостат достиг следующей точки
			this.index_point++;
			if(this.index_point == path.length){ //если эта точка последняя на карте
				this.on_last_point = true; //дошел до последней точки
				return 1;
			}else{
				this.path_point = path[this.index_point]; //перевести на новую точку
				if(this.path_well >= 1) this.move(game_field, delay, path, false);
				this.newVector();
				return 0;
			}
		}
		return 0;
	};
	
	this.newVector = function(){
		this.vector = "";
		var vector = "";
		if(this.current_position["left"] < this.path_point["left"])vector += "r";
		if(this.current_position["left"] > this.path_point["left"])vector += "l";
		if(this.current_position["top"] < this.path_point["top"])vector += "d";
		if(this.current_position["top"] > this.path_point["top"])vector += "t";
		
		var vectors_action = new Array();
		$.each(this.animation[this.action], function(vector, anim){
			vectors_action.push(vector);
		});
		if(vectors_action.length > 1){
			if(vectors_action.indexOf(vector) >= 0) this.vector = vector;
			else{
				var vector_change = false;
				for(var i = 0; i < vector.length; i++)
					if(vectors_action.indexOf(vector[i]) >= 0) {this.vector = vector[i]; vector_change = true;}
				if(vector_change && enemy == undefined)this.vector = vectors_action[0];
			}
		}else{
			this.vector = vectors_action[0];
		}

	}

	this.death = function(enemy_array, index){
		var res = false;
		if(this.on_last_point)
			res = 0;
		else if(this.health <= 0)
			res = this.death_price;
		if(res !== false){
			this.action = "death";
			this.is_active = false;
			this.is_dead = true;
			this.animation_well = 0;
			this.frame = 0;
		}
		return res;
	};
	
	this.init = function(){
		var anim = enemy_params[this.type].animation;
		var selfEnemy = this;
		$.each(anim, function(action, moves){
			selfEnemy.animation[action] = {};
			$.each(moves, function(vector, params){
				if(Object.prototype.toString.call(params.images) === '[object Array]'){
					var ia = selfEnemy.animation[action][vector] = new Array();
					for(var i = 0; i < params.images.length; i++){
						img = new Image();
						img.src = enemy_params[selfEnemy.type].catalog_images + selfEnemy.type + "/" + params.images[i];
						ia.push(img);
					}
				}else{
					img = new Image();
					img.src = enemy_params[selfEnemy.type].catalog_images + selfEnemy.type + "/" + params.images;
					selfEnemy.animation[action][vector] = img;
					selfEnemy.frames[action] =params["count_frames_width"] - params["start_from"][0] + 1 + params["end_on"][0] +
									params["count_frames_width"] * (params["end_on"][1] - params["start_from"][1] - 1);
				}
			});
			
		});
	}
	
	this.init();
	this.newVector();
}

Enemy.prototype = Object.create(Move.prototype);
