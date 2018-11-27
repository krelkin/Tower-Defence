function Game(var_name){
	
	this.iteration = 0;
	
	//PROPERTIES
	selfGame = this;
	this.fps = 60;				//количество fps в игре
	this.name = var_name;		//имя переменной
	this.loosen = false;		//индикатор проигрыша
	this.delay = 1000/this.fps;	//задержка таймера (в мс.)
	this.timer;					//таймер, который запускает через n времени функцию step
	
	
	this.field = new Field(var_name, "field");		//Объект field, который отвечает за перерисовку экрана

	//FUNCTIONS == ФУНКЦИИ
		
	//FUNCTIONS START/OVER GAME == ФУНКЦИИ НАЧАЛА/ОКОНЧАНИЯ ИГРЫ
	
	this.startGame = function(map){	//начало игры
		$("#menu").html("");
		
		this.wave = 0;//обнулить волну
		this.field.initMap(map); //инициировали карту
		this.field.initPath(map); //инициировали путь
		this.field.createInterface(this.name);
		
		this.timer = this.field.nextWave(this.delay); //начали игру, запуская новую волну
		
	};
	
	this.endGame = function(){		//выход из игры. А оно надо?
		alert("Fake button!")
	};
	
}