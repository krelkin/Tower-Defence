function Tower(id, type, current_position){
	//PROPERTIES
	selfTower = this;
	this.id = id;			//id башенки
	this.type = type;		//тип башенки
	this.current_position = current_position;
	this.animation = {};
	
	this.frame = 0;
	this.frames = {};
	this.enemy_focus = "first";
	
	this.price 		= tower_params[type].price;
	this.damage 	= tower_params[type].damage;
	this.speedattack= tower_params[type].speedattack;
	this.radius 	= tower_params[type].radius;
	this.image	 	= tower_params[type].images;

	this.show_radius = false;
	this.action = tower_params[type].tower_interface_action;
	this.vector = tower_params[type].tower_interface_vector;
	
	this.update_damage		= {"image": undefined, "index": new Array(), "gold": new Array(), "current_upgrade": 0};
	this.update_radius		= {"image": undefined, "index": new Array(), "gold": new Array(), "current_upgrade": 0};
	this.update_speedattack = {"image": undefined, "index": new Array(), "gold": new Array(), "current_upgrade": 0};
	/*на будущее*/
	this.buff = new Array();
	this.debuff = new Array();

	//WELLS
	this.animation_well = 0; 	//"колодец" анимации
	this.speedattack_well = 0; 	//"колодец" скорости атаки
	
	//FUNCTIONS
	this.sold  = function(){}
	
	this.getSpeedAttack = function(){
		//тут будет логика увеличения или уменьшения скорости атаки башенки
		return this.speedattack;
	}
	
	this.getDamage = function(){
		//тут будет логика увеличения или уменьшения урона башенки
		return this.damage;
	}

	this.getRadius = function(){
		//тут будет логика увеличения или уменьшения радиуса башенки
		return this.radius;
	}
	
	this.upgradeDamage = function(gold){
		if(gold >= this.update_damage.gold[this.update_damage.current_upgrade]){
			this.damage = this.update_damage.index[this.update_damage.current_upgrade];
			this.update_damage.current_upgrade++;
			return this.update_damage.gold[this.update_damage.current_upgrade - 1];
		}
		return 0;
	}

	this.upgradeSpeedAttack = function(gold){
		if(gold >= this.update_speedattack.gold[this.update_speedattack.current_upgrade]){
			this.speedattack = this.update_speedattack.index[this.update_speedattack.current_upgrade];
			this.update_speedattack.current_upgrade++;
			return this.update_speedattack.gold[this.update_speedattack.current_upgrade - 1];
		}
		return 0;
	}

	this.upgradeRadius = function(gold){
		if(gold >= this.update_radius.gold[this.update_radius.current_upgrade]){
			this.radius = this.update_radius.index[this.update_radius.current_upgrade];
			this.update_radius.current_upgrade++;
			return this.update_radius.gold[this.update_radius.current_upgrade - 1];
		}
		return 0;
	}

	this.getAnimationDelay = function(){
		var all_frames = 0;
		if(this.images instanceof Array) all_frames = this.images.length;
			else all_frames = this.frames[this.action];
		if(this.action == "attack")
			return ((1000 / tower_params[this.type].speedattack) * (tower_params[this.type].speedattack)/this.getSpeedAttack()) / all_frames;
		else
			return tower_params[this.type].animation[this.action][this.vector].animation_delay;
	}
	
	this.getEnemy = function(enemy_arr, sort){
		if(enemy_arr.length == 1) return enemy_arr[0];
		if(this.enemy_focus == "first"){
			var first_enemy = enemy_arr[0];
			$.each(enemy_arr, function(index, enemy){
				if(enemy.distance_traveled > first_enemy.distance_traveled)
					first_enemy = enemy;
			});
		}
		return first_enemy;
	}
	
	this.shoot = function(enemies, delay, global_id){
		
		this.speedattack_well += this.speedattack * delay;
		if(this.speedattack_well >= 1){
			this.speedattack_well--;
			//здесь должен быть алгоритм выбора врага, но пока что будет выбираться всегда первый
			var en = this.getEnemy(enemies);
			this.newVector(en);
			return new Trash(++global_id, this.type, en, this.getDamage(), this.current_position);
		}
		return false;
	}
	
	this.enemyInRadius = function(enemies, delay, global_id, tower){
		var current_enemy = new Array();
		$.each(enemies, function(index, enemy){
			if(!enemy.is_active) return;
			if(enemy.is_dead) return;
			/*(x - x0)^2 + (y - y0)^2 <= R^2
			где 
				x и y - координаты точки, 
				x0 и y0 - координаты центра окружности, 
				R - радиус окружности, ^2 - возведение в квадрат. 
				Если условие выполняется, то точка находится внутри (или на окружности, в случае равенства левой и правой частей). 
				Если не выполняется, то точка вне окружности.
			*/
			if(
				(Math.pow(enemy.current_position["top"]  - tower.current_position["top"] , 2)) + 
				(Math.pow(enemy.current_position["left"] - tower.current_position["left"], 2))  
				<= Math.pow(tower.radius, 2)
			)
			current_enemy.push(enemy);
		});
		if(current_enemy.length > 0){//в поле зрения хотя бы один враг
			if(tower.action != "attack"){
				tower.action = "attack";
				tower.frame = 0;
				tower.animation_well = 0;
			}
			return this.shoot(current_enemy, delay, global_id); //возврат объекта выстрела
		}else{
			if(tower.action != "stand"){
				tower.action = "stand";
				tower.frame = 0;
				tower.animation_well = 0;
				this.newVector(undefined);
			}
			this.speedattack_well = 1 - this.speedattack * delay;
			return false;
		}
		
	}
	
	this.newVector = function(enemy){
		var vector = "";
		if(enemy !== undefined){
			if(this.current_position["left"] < enemy.current_position["left"])vector += "r";
			if(this.current_position["left"] > enemy.current_position["left"])vector += "l";
			if(this.current_position["top"] < enemy.current_position["top"])vector += "d";
			if(this.current_position["top"] > enemy.current_position["top"])vector += "t";
		}else{
			vector = this.vector;
		}
		
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
	
	this.init = function(){
		var selfTower = this;
		$.each(tower_params[this.type].animation, function(action, moves){
			selfTower.animation[action] = {};
			$.each(moves, function(vector, params){
				if(Object.prototype.toString.call(params.images) === '[object Array]'){
					var ia = selfTower.animation[action][vector] = new Array();
					for(var i = 0; i < params.images.length; i++){
						img = new Image();
						img.src = tower_params[selfTower.type].catalog_images + selfTower.type + "/" + params.images[i];
						ia.push(img);
					}
				}else{
					img = new Image();
					img.src = tower_params[selfTower.type].catalog_images + selfTower.type + "/" + params.images;
					selfTower.animation[action][vector] = img;
					selfTower.frames[action] =params["count_frames_width"] - params["start_from"][0] + 1 + params["end_on"][0] +
									params["count_frames_width"] * (params["end_on"][1] - params["start_from"][1] - 1);
				}
			});
		});
		
		$.each(tower_params[this.type].upgrade, function(index, params){
			var arr;
			if(index == "damage")arr = selfTower.update_damage;
			if(index == "radius")arr = selfTower.update_radius;
			if(index == "speedattack")arr = selfTower.update_speedattack;
			img = new Image();
			img.src = tower_params[selfTower.type].catalog_images + selfTower.type + "/interface/" + tower_params[selfTower.type].upgrade_buttons[index];
			arr["image"] = img;
			$.each(params, function(ind, arr_params){
				arr[ind] = arr_params;
			});
		});
	}
	
	this.init();
}
