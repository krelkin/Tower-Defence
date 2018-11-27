
function Field(name, field, map){
	var selfField = this;
	this.map_index = 0;
	this.map_image = "";
	this.global_id = 0;			//глобальный id
	this.new_tower = undefined;	//новая башня для размещения (по умолчанию всегда должна быть undefined)
	this.map_div = $("#field");	//объект, куда поместить поле 
	this.class_game = name;		//наименование переменной класса игры
	this.name_field = field;	//наименование переменной класса
	this.display;				//класс отрисовки на экран
	this.tower_interface = new Array(); //башенки, расположенные на интерфейсе
	this.path = new Array();	//путь врагов
	this.enemy = new Array();	//волна врагов
	this.tower = new Array();	//выставленные башенки
	this.trash = new Array();	//выстрелы башенок
	this.timer;					//таймер, который запускает через n времени функцию step
	this.map = 0;				//номер карты
	this.wave = 0;				//номер волны
	this.lives = 2;				//количество жизни
	this.gold = 100;			//количество денег
	this.image_map = '';		//картинка карты
	this.delay = 0;				//время между перерисовкой
	this.total_enemies = 0;		//всего врагов в волне
	this.leaves_enemies = 0;	//осталось врагов в волне
	this.choosen_obj = undefined;//объект, который выбран. Для него мы будем рисовать отдельный интерфейс
	
	//wells
	this.enemy_appear_well = 0; //"колодец" появления врагов. Считает кво мс. до появления следующего врага

	this.createInterfaceTower = function(type, params_to_show){
		var tp = tower_params[type];
		var ind = 2;
		$.each(game_towers, function(tower_type, params_to_show){
			var tp = tower_params[tower_type].animation[tower_params[tower_type].tower_interface_action][tower_params[tower_type].tower_interface_vector];
			var x = 80 * (ind++) + (tp.frame_width / 2);
			var y = 778 + (tp.frame_height / 2);
			selfField.tower_interface.push(
				new Tower("tower_interface", tower_type, {"left": x, "top": y})
			);
		});
	}
	
	this.drawInterfaceParams = function(){
		var ind = 0;
		var y = 768 + 10 * (++ind);
		selfField.display.drawInterfaceParams("Золото", selfField["gold"], {"left": 10, "top": y});
		y = 768 + 10 * (++ind);
		selfField.display.drawInterfaceParams("Жизни", selfField["lives"], {"left": 10, "top": y});
		y = 768 + 10 * (++ind);
		selfField.display.drawInterfaceParams("Волна", selfField["wave"] + " (" + selfField["leaves_enemies"] + "/" + selfField["total_enemies"] + ")", {"left": 10, "top": y});
		//y = 768 + 10 * (++ind);
		//selfField.display.drawInterfaceParams("Жизни", selfField["lives"], {"left": 10, "top": y});
		/*$.each(interface_show_params, function(title, param){
			var y = 768 + 10 * (++ind);
			selfField.display.drawInterfaceParams(title, selfField[param], {"left": 10, "top": y});
		});*/
	}
	
	this.createInterface = function(var_game){
		//this.createInterfaceParams();
		this.createInterfaceTower();
	}
	
	this.initMap = function(map){
		this.map_index = map;
		var selfField = this;
		this.map_image = "./images/maps/map" + this.map_index + ".jpg";
		this.map_div.html("");
		this.map_div.append($("<img>", {src: this.map_image}));
		w = this.map_div.offsetWidth;
		h = this.map_div.offsetHeight;
		$("#" + this.map_div.attr("id") + " img").remove();
		
		this.display = new Display("./images/maps/map" + this.map_index + ".jpg", w, h);
		//this.display.initField("./images/maps/map" + this.map_index + ".jpg");
		$("canvas")[0].onclick = this.canvasOnclick
		
		
		$("canvas")[0].onmousemove = function(evt){
			if(selfField.new_tower != undefined){
				selfField.new_tower.current_position["left"] = evt.clientX;
				selfField.new_tower.current_position["top"] = evt.clientY;
			}else{
				var obj = undefined;
				$.each(selfField.tower, function(index, tower){
					var x = tower.current_position["left"];
					var y = tower.current_position["top"];
					var square_edge_x = tower_params[tower.type].animation[tower_params[tower.type].tower_interface_action][tower_params[tower.type].tower_interface_vector].frame_width / 2;
					var square_edge_y = tower_params[tower.type].animation[tower_params[tower.type].tower_interface_action][tower_params[tower.type].tower_interface_vector].frame_height/ 2;
					
					if(evt.clientX >= x - square_edge_x && evt.clientX <= x + square_edge_x
					  && evt.clientY >= y - square_edge_y && evt.clientY <= y + square_edge_y){
						tower.show_radius = true;
					}else{
						tower.show_radius = false;
					}
						
				});
			}
		};
	}
	
	this.canvasOnclick = function(evt){
		var obj = undefined;
		
		console.log("x: " + evt.clientX + "  y: " + evt.clientY);
		
		//если есть выбранный объект и выбранный объект не новая башенка и не башенка интерфейса и не враг.
		if(selfField.choosen_obj !== undefined 
		  && selfField.choosen_obj.id != "tower_interface" 
		  && selfField.choosen_obj.id != "place_tower" 
		  && !(selfField.choosen_obj instanceof Enemy)
		  && evt.clientY >= 768
		  ){
			obj = selfField.choosen_obj;
			if(evt.clientX >= 460 && evt.clientX <= 560
			  && evt.clientY >= 778 && evt.clientY <= 778+67)
				selfField.gold -= obj.upgradeDamage(selfField.gold);
			if(evt.clientX >= 580 && evt.clientX <= 680
			  && evt.clientY >= 778 && evt.clientY <= 778+67)
				selfField.gold -= obj.upgradeSpeedAttack(selfField.gold);
			if(evt.clientX >= 700 && evt.clientX <= 800
			  && evt.clientY >= 778 && evt.clientY <= 778+67)
				selfField.gold -= obj.upgradeRadius(selfField.gold);
		}
		
		if(obj == undefined)
			if(selfField.new_tower != undefined){//если мы ставим новую башенку
				var x = selfField.new_tower.current_position["left"];
				var y = selfField.new_tower.current_position["top"];
				var square_edge_x = tower_params[selfField.new_tower.type].animation[tower_params[selfField.new_tower.type].tower_interface_action][tower_params[selfField.new_tower.type].tower_interface_vector].frame_width / 2;
				var square_edge_y = tower_params[selfField.new_tower.type].animation[tower_params[selfField.new_tower.type].tower_interface_action][tower_params[selfField.new_tower.type].tower_interface_vector].frame_height/ 2;
					if(evt.clientX >= x - square_edge_x && evt.clientX <= x + square_edge_x
					  && evt.clientY >= y - square_edge_y && evt.clientY <= y + square_edge_y)
						obj = selfField.new_tower;
			}
			
		if(obj == undefined)
			$.each(selfField.tower_interface.concat(selfField.tower), function(index, tower){ //если выбираем башенку
				var x = tower.current_position["left"];
				var y = tower.current_position["top"];
				var square_edge_x = tower_params[tower.type].animation[tower_params[tower.type].tower_interface_action][tower_params[tower.type].tower_interface_vector].frame_width / 2;
				var square_edge_y = tower_params[tower.type].animation[tower_params[tower.type].tower_interface_action][tower_params[tower.type].tower_interface_vector].frame_height/ 2;
				
				if(evt.clientX >= x - square_edge_x && evt.clientX <= x + square_edge_x
				  && evt.clientY >= y - square_edge_y && evt.clientY <= y + square_edge_y)
					obj = tower;
			});
		
		if(obj == undefined)
			$.each(selfField.enemy, function(index, enemy){//если выбираем врага
				var x = enemy.current_position["left"];
				var y = enemy.current_position["top"];
				var square_edge_x = enemy_params[enemy.type].animation[enemy.action][enemy.vector].frame_width / 2;
				var square_edge_y = enemy_params[enemy.type].animation[enemy.action][enemy.vector].frame_height/ 2;
				
				if(evt.clientX >= x - square_edge_x && evt.clientX <= x + square_edge_x
				  && evt.clientY >= y - square_edge_y && evt.clientY <= y + square_edge_y)
					obj = enemy;
			});
		
		if(obj !== undefined){
			if(obj.id == "tower_interface") selfField.placeNewTower(obj, "create");
			if(obj.id == "place_tower") selfField.placeNewTower(obj, "place");
		}
		selfField.choosen_obj = obj;
		console.log(selfField.choosen_obj);
	}
	
	this.createObj = function(array){
		
	}

	this.createPath = function(array, image){
		$.each(array, function(index, value){
			selfField.map_div.append(
				$("<img>", {src: image,
							//id: "id" + value.id,
							style:
								"top:"  + value["top"]  + ";" + 
								"left:" + value["left"] + ";" + 
								"z-index:5;" + 
								"position:fixed"}
				)
			);
		});
	}
	
	this.refresh = function(){
		this.display.canvas.clearRect(0, 0, document.getElementById("canvas_field").width, document.getElementById("canvas_field").height);
		
		var params = {"Золото": this.gold, "Жизни": this.lives, "Волна": this.wave + " (" + this.leaves_enemies + "/" + this.total_enemies + ")"}
		this.display.drawInterface(this.tower_interface, params, this.choosen_obj, this.delay, this.gold);
		
		$.each(this.enemy, function(index, enemy){
			this.animation_well += selfField.delay;
			var draw_enemy = true;
			if(enemy.animation_well >= enemy_params[enemy.type].animation[enemy.action][enemy.vector].animation_delay){
				enemy.animation_well -= enemy_params[enemy.type].animation[enemy.action][enemy.vector].animation_delay;
				if(++enemy.frame >= enemy.animation[enemy.action][enemy.vector].length){
					if(enemy.action == "death"){
						delete selfField.enemy[index];
						selfField.enemy = selfField.enemy.filter(function(x) {return x !== undefined});
						draw_enemy = false;
					}else 
						enemy.frame = 0;
				}
			}
			if(draw_enemy)selfField.display.drawEnemy(enemy);
		});
		
		/*var towers;
		if(this.choosen_obj == undefined)towers = this.tower.concat(this.tower_interface);
			else towers = this.tower;*/
		
		$.each(this.tower, function(index, tower){
			tower.animation_well += selfField.delay;
			var tower_delay = tower.getAnimationDelay();
			if(tower.animation_well >= tower_delay){
				tower.animation_well -= tower_delay;
				if(++tower.frame >= tower.frames[tower.action])tower.frame = 0;
			}
			selfField.display.drawTower(tower);
		});
		
		if(this.new_tower != undefined)this.display.drawTower(this.new_tower);
	};
	
	this.initPath = function(map){							//инициировать путь при загрузке карты
		selfField.path = [];
		$.each(path_map[map], function(index, point){
			if(index == "image") return;
			selfField.path.push(point);
		});

		//this.createPath(this.path, path_map[map]["image"]);
	}

	this.step = function(){									//перерисовка интерфейса и проверки условий
		delay_func = this.delay/1000;
		this.enemy_appear_well += this.delay;
		enemy_apear = false;
		for(i = 0; i < this.enemy.length; i++)//выбираем первого неактивного после последнего активного
			if(!this.enemy[i].is_active && !this.enemy[i].is_dead){
				if(i == 0) old_enemy_type = this.enemy[0].type;
				else old_enemy_type = this.enemy[i - 1].type;
				break;
				}
		
		$.each(this.enemy, function(index, enemy){
			if(!enemy.is_active && !enemy_apear && !enemy.is_dead){ //если есть неактивный враг
				if(old_enemy_type == enemy.type) time = global_enemy[selfField.wave]["time_beetween_enemies"];
					else time = global_enemy[selfField.wave]["time_beetween_type"];
				
				if(selfField.enemy_appear_well >= time){
					selfField.enemy_appear_well -= time;
					enemy.is_active = true;
				}
				enemy_apear = true;
			}
			
			if(!enemy.is_active)return;
			
			old_enemy_type = enemy.type;
			
			if(selfField.loosen) return;
			selfField.lives -= enemy.move(selfField, delay_func, selfField.path);
			money = enemy.death();
			if(money !== false){
				delete selfField.enemy[index];
				selfField.leaves_enemies--;
			}else{
				selfField.gold += money;
			}
			selfField.loosen = selfField.loose();
		});
		this.enemy = this.enemy.filter(function(x) {return x !== undefined});
		
		$.each(this.tower, function(index, tower){
			shoot = tower.enemyInRadius(selfField.enemy, delay_func, selfField.global_id, tower);
			if(shoot !== false){
				selfField.trash.push(shoot);
				//selfField.createObj([shoot]);
				selfField.global_id = shoot.id;
			}
		});
		
		$.each(this.trash, function(index, trash){
			if(trash.enemy !== undefined) current_position = trash.enemy.current_position;
				else current_position = trash.path_point;
			is_damage = trash.move(delay_func, current_position );
			if(is_damage){
				if(trash.enemy !== undefined){
					trash.enemy.health -= trash.damage;
					money = trash.enemy.death();
					if (money > 0){
						selfField.gold += money;
						//selfField.veiwGold(selfField.gold);
						selfField.releaseTrashFromDefeatedEnemy(trash.enemy);
						delete selfField.enemy[selfField.enemy.indexOf(trash.enemy)];
						selfField.leaves_enemies--;
						selfField.enemy = selfField.enemy.filter(function(x) {return x !== undefined});
					}
				}
				delete selfField.trash[index];
			}
		});
		this.trash = this.trash.filter(function(x) {return x !== undefined});
		
		this.refresh( this.enemy.concat(this.tower.concat(this.trash ) ) );
		
		if(this.enemy.length == 0) this.nextWave();
	}
	
	this.nextWave = function(delay = 0){					//новая волна
		clearInterval(this.timer);
		if(delay > 0) this.delay = delay;
		this.wave++;
		if(this.initWaveEnemies())
			this.timer = setInterval(function(){selfField.step()}, this.delay);
		else
			this.win();
			
		return this.timer;
	};
	
	this.initWaveEnemies = function(){						//инициализация новой волны
		enemies = global_enemy[this.wave];
		if (enemies === undefined) return false;
		this.enemy_appear_well = global_enemy[this.wave]["time_beetween_enemies"];
		enemy_left = selfField.path[0]["left"];
		enemy_top = selfField.path[0]["top"];
		this.total_enemies = 0;
		$.each(enemies, function(type, amount){
			if(type == "time_beetween_enemies" || type == "time_beetween_type" || type == "time_wave") return;
			selfField.total_enemies += amount;
			for(var i = 0; i < amount; i++){
				current_position = {"left": enemy_left, "top": enemy_top};
				selfField.enemy.push(new Enemy(++selfField.global_id, type, 1, current_position, selfField.path[1]));
			}
		});
		
		this.leaves_enemies = this.total_enemies;
		return true;
	}

	this.releaseTrashFromDefeatedEnemy = function(enemy){	//убрать побеждённого врага из пуль, которые к нему стремились
		//в зависимости от сложности игры можно будет задать разный алгоритм для пуль.
		// к примеру, для easy пули будут искать нового врага;
		// а в сложном - пули будут исчезать за пределами радиуса
		$.each(this.trash, function(index, trash){
			if(trash === undefined) return;
			if(trash.enemy === enemy){
				trash.path_point = {"left": enemy.current_position["left"], "top": enemy.current_position["top"]};
				trash.enemy = undefined;
			}
		});
	}
	
	this.placeNewTower = function(obj, operation){		//создание башни для выставления игроком на поле
		if(operation == "create"){
			if(this.gold < tower_params[obj.type].price) return;
			this.new_tower = new Tower("place_tower", obj.type, {"left": obj.current_position["left"], "top": obj.current_position["top"]});
			this.new_tower.show_radius = true;
		}else if(operation == "place"){
			this.gold -= obj.price;
			//obj.id = ++selfField.global_id;
			this.tower.push( new Tower(++selfField.global_id, selfField.new_tower.type, selfField.new_tower.current_position) );
			delete this.new_tower;// == undefined;
		}
	}
	
	this.clearPlaceTower = function(){						//удалить башню, если поставлена на поле
		this.tower.push(this.place_tower);
		this.new_tower = undefined;
		$("#place_tower").remove();
	}

	this.loose = function(){		//проигрыш
		if(this.lives <= 0){
			clearInterval(this.timer);
			alert("Game over!");
			return true;
		}
	}
	
	this.win = function(){			//выгрыш
		alert("Congratulation! You win!");
	}


	//MENU FUNCTIONS
	this.showMenu = function(){//Показать главное меню
		$("#menu").html("");
		$("#menu").append( $("<input>", {type:"button", value: "Начать игру", onclick: this.class_game + "." + this.name_field + ".showMenuMaps()"}) );
		$("#menu").append( $("<br>") );
		$("#menu").append( $("<input>", {type:"button", value: "Выход", onclick: this.class_game + ".endGame()"}) );
	};
	
	this.showMenuMaps = function(){//Показать меню карт
		$("#menu").html("");
		$("#menu").append( $("<input>", {type:"button", id: "map1", value: "Карта 1", onclick: this.class_game + ".startGame(1)"}) );
		$("#menu").append( $("<br>") );
		$("#menu").append( $("<input>", {type:"button", value: "Назад", onclick: this.class_game + "." + this.name_field + ".showMenu()"}) );
	};

	this.showMenu();
}
