function Display(image_src = "", width = 1024, height = 768){
	this.field_image = undefined;
	this.field_width = width;
	this.field_height = height;
	this.canvas == undefined;
	this.frame = 0;
	this.interfaceObject = undefined;
	
	this.initField = function(image_src, width, height){
		if(this.canvas === undefined){
			canvas = $("<canvas>", {id: "canvas_field", style:"position:fixed;z-index:50"})[0];
			canvas.width = width;
			canvas.height= height + 200; // 200 - высота интерфейса
			$("#field").append(canvas);
			this.canvas = canvas.getContext("2d");
			this.canvas.font = '16px serif';
		}
		if(image_src != ""){
			/*img = new Image();
			img.src = image_src;*/
			//img = $("<img>", {src: image_src, style: "width:this.field_width;height:this.field_height"})[0];
			$("#field").append( $("<img>", {src: image_src, style: "width:this.field_width;height:this.field_height;position:fixed"}) );
			//this.field_image = img;
			//this.canvas.save();
		}
	}
	
	this.drawInterfaceParams = function(params){
		var x = 10;
		var y = this.field_height + 20;
		var st = 25;
		var i = 0;
		this.canvas.save();
		this.canvas.translate(x, y);
		var selfDisplay = this;
		$.each(params, function(title, param){
			selfDisplay.canvas.fillText(title + ": " + param, x, st * i++);
		});
		this.canvas.restore();
	}
	
	this.drawInterfaceTower = function(tower_interface, delay, gold){
		var selfDisplay = this;
		$.each(tower_interface, function(index, tower){
			tower.animation_well += delay;
			var tower_delay = tower.getAnimationDelay();
			if(tower.animation_well >= tower_delay){
				tower.animation_well -= tower_delay;
				if(++tower.frame >= tower.frames[tower.action])tower.frame = 0;
			}
			selfDisplay.drawTower(tower, tower.price > gold);
		});
	}
	
	this.drawParamsChoosenTower = function(x, y){
		this.canvas.fillText("Урон:", x, y);
		this.canvas.fillText("Скорость:", x, y + 25);
		this.canvas.fillText("Радиус:", x, y + 50);
		this.canvas.fillText(this.interfaceObject.getDamage(), x + 80, y);
		this.canvas.fillText(this.interfaceObject.getSpeedAttack() + " в/с", x + 80, y + 25);
		this.canvas.fillText(this.interfaceObject.getRadius() + " px", x + 80, y + 50);
	}
	
	this.drawButt = function(x, y, gold, param){
		var tower = this.interfaceObject;
		var arr = tower["update_" + param];
		if(arr.current_upgrade < arr.index.length){
			this.canvas.drawImage(arr.image, x, y);
			this.canvas.fillText("Цена: " + arr.gold[arr.current_upgrade], x, y + 80);
			if(arr.gold[arr.current_upgrade] > gold){
				this.canvas.fillStyle = 'rgba(200, 0, 0, 0.5)';
				this.canvas.fillRect(x, y, 100, 67);
				this.canvas.fillStyle = 'black';
			}
		}
	}
	
	this.drawUpgradeButton = function(x, y, gold){
		this.drawButt(x, y, gold, "damage");
		this.drawButt(x + 110, y, gold, "speedattack");
		this.drawButt(x + 220, y, gold, "radius");
	}
	
	this.drawChoosenTowerInterface = function(gold){
		var action = tower_params[this.interfaceObject.type].tower_interface_action;
		var vector = tower_params[this.interfaceObject.type].tower_interface_vector;
		var tower_animation_param = tower_params[this.interfaceObject.type].animation[action][vector];
		
		var x = 160;
		var y = this.field_height + 10;
		
		this.canvas.save();
		
		this.canvas.translate(x, y);
		
		//нарисовали саму башенку
		if(this.interfaceObject.animation[action][vector] instanceof Array){
			this.canvas.drawImage(
				this.interfaceObject.animation[action][vector][0],
				this.interfaceObject.current_position["left"] - (tower_animation_param.frame_width / 2),
				this.interfaceObject.current_position["top"] - (tower_animation_param.frame_height / 2)
			);
		}else{
			var frame_tower = 0;
			if (tower_animation_param.start_from[0] != 0 || tower_animation_param.start_from[1] != 0){
				var remove_frames = tower_animation_param["count_frames_width"] + 1 + tower_animation_param["start_from"][0] +
								tower_animation_param["count_frames_width"] * (tower_animation_param["start_from"][1] - 1) - 1;
				frame_tower += remove_frames;
			}
			var frames_height = 1;
			var xa = 0;
			var ya = 0;
			if(frame_tower < tower_animation_param["count_frames_width"]){
				xa = frame_tower;
			}else{
				ya = Math.floor(frame_tower / tower_animation_param.count_frames_width);
				xa = frame_tower - ya * (tower_animation_param.count_frames_width);
			}
			this.canvas.drawImage(
				this.interfaceObject.animation[action][vector],     //Объект Image анимации 
				Math.round(tower_animation_param.frame_width * xa), 	//Берем текущий кадр, ширина кадра * шаг анимации
				Math.round(tower_animation_param.frame_height * ya), //Берем текущий кадр, высота кадра * шаг анимации
				tower_animation_param.frame_width,      			//Вырез в ширину объекта
				tower_animation_param.frame_height,     			//И в высоту
				0, 													//Размещаем по горизонтали на холсте
				0, 													//И по вертикали
				tower_animation_param.frame_width,      			//Ширина как у кадра
				tower_animation_param.frame_height      			//Ну и высота
			);
		}
		
		//нарисовали параметры башенки
		x = 100;
		this.drawParamsChoosenTower(x, 10);
		
		x = 300;
		//нарисовали кнопки 
		this.drawUpgradeButton(x, 0, gold);
		
		this.canvas.restore();
	}
	
	this.drawInterface = function(tower_interface, params, choosen_obj, delay, gold){
		if(choosen_obj == undefined || choosen_obj.id == "tower_interface" || choosen_obj.id == "place_tower" || choosen_obj instanceof Enemy){
			this.drawInterfaceTower(tower_interface, delay, gold);
		}else{
			choosen_obj.show_radius = true;
			this.interfaceObject = choosen_obj;
			this.drawChoosenTowerInterface(gold);
		}
		this.drawInterfaceParams(params);
	}
	
	this.drawTower = function(tower, not_enougth_gold = false){
		
		var tower_animation_param = tower_params[tower.type].animation[tower.action][tower.vector];
		
		this.canvas.save();
		this.canvas.translate(tower.current_position["left"] - tower_animation_param.frame_width / 2, tower.current_position["top"] - tower_animation_param.frame_height / 2);
		
		if(tower.show_radius){
			this.canvas.beginPath();
			this.canvas.arc(tower_animation_param.frame_width / 2, tower_animation_param.frame_height / 2, tower.getRadius(), 0, 7);
			this.canvas.fillStyle = "rgba(0,255,155,0.5)";
			this.canvas.fill();
			this.canvas.lineWidth = 1;
			this.canvas.strokeStyle = 'red';
			this.canvas.stroke();
		}
		
		if(not_enougth_gold){
			this.canvas.fillStyle = 'rgba(200, 0, 0, 0.5)';
			//this.canvas.fillRect(0, 0, tower_animation_param.frame_width, tower_animation_param.frame_height);
			this.canvas.beginPath();
			this.canvas.arc(tower_animation_param.frame_width / 2, tower_animation_param.frame_height / 2, 30, 0, 7);
			this.canvas.fill();
			this.canvas.strokeStyle = 'red';
	}
		if(tower.animation[tower.action][tower.vector] instanceof Array){
			this.canvas.drawImage(tower.animation[tower.action][tower.vector][tower.frame], 0, 0);
		}else{
			var frame_tower = tower.frame;
			if (tower_animation_param.start_from[0] != 0 || tower_animation_param.start_from[1] != 0){
				var remove_frames = tower_animation_param["count_frames_width"] + 1 + tower_animation_param["start_from"][0] +
								tower_animation_param["count_frames_width"] * (tower_animation_param["start_from"][1] - 1) - 1;
				frame_tower += remove_frames;
			}
			var frames_height = 1;
			var x = 0;
			var y = 0;
			if(frame_tower < tower_animation_param["count_frames_width"]){
				x = frame_tower;
			}else{
				y = Math.floor(frame_tower / tower_animation_param.count_frames_width);
				x = frame_tower - y * (tower_animation_param.count_frames_width);
			}
			/*if(not_enougth_gold){
				this.canvas.globalCompositeOperation = 'destination-atop';
			}*/
			this.canvas.drawImage(
				tower.animation[tower.action][tower.vector],     				//Объект Image анимации 
				Math.round(tower_animation_param.frame_width * x), 	//Берем текущий кадр, ширина кадра * шаг анимации
				Math.round(tower_animation_param.frame_height * y), //Берем текущий кадр, высота кадра * шаг анимации
				tower_animation_param.frame_width,      			//Вырез в ширину объекта
				tower_animation_param.frame_height,     			//И в высоту
				0,//tower.current_position["left"] - (tower_animation_param.frame_width / 2),//Размещаем по горизонтали на холсте
				0,//tower.current_position["top"] - (tower_animation_param.frame_height / 2),//И по вертикали
				tower_animation_param.frame_width,      			//Ширина как у кадра
				tower_animation_param.frame_height      			//Ну и высота
			);
		}		
		this.canvas.restore();

	}
	
	this.drawEnemy = function(enemy){
		var enemy_animation_params = enemy_params[enemy.type].animation[enemy.action][enemy.vector];
		if(enemy.animation[enemy.action][enemy.vector] instanceof Array){
			var x = enemy.current_position["left"] - (enemy_params[enemy.type].animation[enemy.action][enemy.vector].frame_width / 2);
			var y = enemy.current_position["top"] - (enemy_params[enemy.type].animation[enemy.action][enemy.vector].frame_height / 2);
			this.canvas.save();
			this.canvas.translate(x, y);
			this.canvas.drawImage(enemy.animation[enemy.action][enemy.vector][enemy.frame], 0, 0);
			this.canvas.fillText(enemy.health,
								enemy_animation_params.frame_width / 2,
								10);
			this.canvas.restore();
		}else{
			var enemy_tower = enemy.frame;
			this.canvas.save();
			if (enemy_animation_params.start_from[0] != 0 || enemy_animation_params.start_from[1] != 0){
				var remove_frames = enemy_animation_params["count_frames_width"] + 1 + enemy_animation_params["start_from"][0] +
								enemy_animation_params["count_frames_width"] * (enemy_animation_params["start_from"][1] - 1) - 1;
				enemy_tower += remove_frames;
			}
			var frames_height = 1;
			var x = 0;
			var y = 0;
			if(enemy_tower < enemy_animation_params["count_frames_width"]){
				x = enemy_tower;
			}else{
				y = Math.floor(enemy_tower / enemy_animation_params.count_frames_width);
				x = enemy_tower - y * (enemy_animation_params.count_frames_width);
			}
			this.canvas.drawImage(
				enemy.animation[enemy.action][enemy.vector],     				//Объект Image анимации 
				Math.round(enemy_animation_params.frame_width * x), 	//Берем текущий кадр, ширина кадра * шаг анимации
				Math.round(enemy_animation_params.frame_height * y), //Берем текущий кадр, высота кадра * шаг анимации
				enemy_animation_params.frame_width,      			//Вырез в ширину объекта
				enemy_animation_params.frame_height,     			//И в высоту
				enemy.current_position["left"] - (enemy_animation_params.frame_width / 2),//Размещаем по горизонтали на холсте
				enemy.current_position["top"] - (enemy_animation_params.frame_height / 2),//И по вертикали
				enemy_animation_params.frame_width,      			//Ширина как у кадра
				enemy_animation_params.frame_height      			//Ну и высота
			);
			this.canvas.restore();
		}
	}
	
	this.drawField = function(image_src = "", new_field = false){
		if(this.field_image === undefined || new_field == true){
			this.initCanvas(image_src);
		}
	}
	
	this.initField(image_src, width, height);
}
