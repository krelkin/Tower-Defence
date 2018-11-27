function Move(){
}

Move.prototype.pathPointBetween = function(path_point, current_position, old_position){
	x = (path_point["left"] <= current_position["left"] && path_point["left"] >= old_position["x"]) 
	  ||(path_point["left"] >= current_position["left"] && path_point["left"] <= old_position["x"]);
	  
	y = (path_point["top"] <= current_position["top"] && path_point["top"] >= old_position["y"]) 
	  ||(path_point["top"] >= current_position["top"] && path_point["top"] <= old_position["y"]);
	  
	return x && y;
}

Move.prototype.moveObj = function(delay, plus_speed = true, path_point = undefined){
	reach_point = false;
	
	if(path_point == undefined) path_point = this.path_point;
	
	
	//проверяем частный случай, когда двигаемся только по горизонтали, либо по вертикали
	particular_case = {"x": this.current_position["left"] == path_point["left"],
					   "y": this.current_position["top"]  == path_point["top"]};
	
	//сохраняем старые значения
	old_value = {"x": this.current_position["left"],
				 "y": this.current_position["top"]};
	
	//Находим расстояние между точками
	dist = Math.round( Math.sqrt(Math.pow(path_point["left"] - this.current_position["left"], 2) + 
								 Math.pow(path_point["top"]  - this.current_position["top"], 2) ) );
	
	if(this instanceof Enemy){
		well = this.path_well;
		speed = this.speed;
	}else if(this instanceof Trash){
		well = this.path_well;
		speed = this.speed;
	}
	
	if(plus_speed)//добавляем значение скорости
		well += speed * delay;
	
	//получаем целое количество пикселей, на которое сдвинется моб
	enemy_px = Math.floor(well);
	
	if(dist <= enemy_px){
		well -= dist;
		this.current_position["left"] = path_point["left"];
		this.current_position["top"]  = path_point["top"];
		reach_point = true;
	}else{
		if(enemy_px > 0){
			//колодца движений забираем количество пикселей
			well -= enemy_px;
			
			//измеряем лямбду соотношений сторон
			lamb = (dist - enemy_px) / enemy_px;
			//высчитываем текущее положение
			this.current_position["left"] = Math.round( (path_point["left"] + this.current_position["left"] * lamb) / (1 + lamb) );
			this.current_position["top"]  = Math.round( (path_point["top"]  + this.current_position["top"]  * lamb) / (1 + lamb) );
			
			if(particular_case["x"]) //частный случай движения по вертикали
				reach_point = (path_point["top"] >= old_value["y"] && path_point["top"] <= this.current_position["top"]);
			else if(particular_case["y"]) //частный случай движения по горизонтали
				reach_point = (path_point["left"] >= old_value["x"] && path_point["left"] <= this.current_position["left"]);
			else //движение под углом
				reach_point = (Math.abs( (path_point["left"] - old_value["x"])/(this.current_position["left"] - old_value["x"]).toFixed(2) - 
						(path_point["top"] - old_value["y"])/(this.current_position["top"]  - old_value["y"]).toFixed(2) ) < 0.01)
						&& this.pathPointBetween(path_point, this.current_position, old_value);
						
			if(this.current_position["top"] == path_point["top"] 
				&& this.current_position["left"] == path_point["left"])
					reach_point = true;
		}
	}
	
	if(this instanceof Enemy){
		this.path_well = well;
	}
	
	return reach_point;

}

Move.prototype.getCurrentPosition = function(current_position, image){
	
	if(this instanceof Enemy){
		img = $("<img>", {src: image});
		$("body").append(img);

		current_position["left"] -= +img.css("width").substr(0, img.css("width").length - 2) / 2;
		current_position["top"] -= +img.css("height").substr(0, img.css("height").length - 2) / 2;
	}
}

