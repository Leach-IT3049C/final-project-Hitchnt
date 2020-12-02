//Game
const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const dead = document.createElement("audio");
dead.preload="auto";
dead.src = "Game2/sounds/WatchOut.wav";
const pass = document.createElement("audio");
pass.preload="auto";
pass.src = "Game2/sounds/pass.wav";

// Game timer
const timeDisplay = document.querySelector('.time-display');
let intervalID = null;
let timeInSeconds = 0;

//storage
const fastest = document.querySelector('.fastest');
const fastestTimeSpan = document.getElementById('fastest-time');
let storageAvailable = false;



/*---------------------------------------------------------*/ 

if (typeof(Storage) !== "undefined") {
    storageAvailable = true;
    if(localStorage.fastestTime){
		//timeDisplay.innerHTML = localStorage.fastestTime;
		timeInSeconds = localStorage.fastestTime;
    	//alert(localStorage.fastestTime);
    }
}

function Bird(x, y, image) {
	this.x = x,
	this.y = y,
	this.width = image.width / 2,
	this.height = image.height,
	this.image = image;
	this.draw = function(context, state) {
		if (state === "up")
			context.drawImage(image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		else{
			context.drawImage(image, this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		}
	}
};

function displaySeconds(){
    timeInSeconds++;
    timeDisplay.textContent = timeInSeconds;
  }
  setInterval(displaySeconds,1000);
function Obstacle(x, y, h, image) {
	this.x = x,
	this.y = y,
	this.width = image.width / 2,
	this.height = h,
	this.draw = function(context, state) {
		if (state === "up") {
			context.drawImage(image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		} else {
			context.drawImage(image, this.width, image.height - this.height, this.width, this.height, this.x, this.y, this.width, this.height);
		}
	}
};

function FlappyBird() {}
FlappyBird.prototype = {
	bird: null, // Bird.
	bg: null, // Background map
	obs: null, // Obstacles.
	obsList: [],
	mapWidth: 500, //  Canvas Width
	mapHeight: 500, //  Canvas height
	startX: 90, // The starting position  
	startY: 225,
	obsDistance: 150, // The distance between the upper and lower obstacles
	obsSpeed: 2, // The speed at which obstacles move 
	obsInterval: 2500, // Create obstacle interval ms  
	upSpeed: 3, // The rate of assost  
	downSpeed: 3, // gravity 
	line: 75, // Ground height
	score: 0, //Score. 
	touch: false, // Whether to touch
	touchup: false, // go down
	touchdown: false, // go down
	gameOver: false,
	CreateMap: function() {
		//Background.
		this.bg = new Image();
		this.bg.src = "img/1.png";
		var startBg = new Image();
		startBg.src = "img/1.png";
		// Because of the Image asynchronous loading, the image is drawn when the load is complete
		startBg.onload = function(){
			c.drawImage(startBg, 0, 0);
		};
		//Bird.
		var image = new Image();
		image.src = "img/bird.png";	
		image.onload = function(){
			this.bird = new Bird(this.startX, this.startY, image);
			//this.bird.draw(c, "down");
		}.bind(this);

		//Obstacles.
		this.obs = new Image();
		this.obs.src = "img/OIP.png";
		this.obs.onload = function() {
			var h = 100; // The default pipe height on the first obstacle is 100
			var h2 = this.mapHeight - h - this.obsDistance;
			var obs1 = new Obstacle(this.mapWidth, 0, h, this.obs);
			var obs2 = new Obstacle(this.mapWidth, this.mapHeight - h2, h2 , this.obs);
			this.obsList.push(obs1);
			this.obsList.push(obs2);
		}.bind(this);
	},
	CreateObs: function() {
		// The pipe height on the obstacle is randomly generated
		var h = Math.floor(Math.random() * (this.mapHeight - this.obsDistance - this.line));
		var h2 = this.mapHeight - h - this.obsDistance;
		var obs1 = new Obstacle(this.mapWidth, 0, h, this.obs);
		var obs2 = new Obstacle(this.mapWidth, this.mapHeight - h2, h2, this.obs);
		this.obsList.push(obs1);
		this.obsList.push(obs2);

		// Remove cross-border obstacles
		if (this.obsList[0].x < -this.obsList[0].width)
			this.obsList.splice(0, 2);
	},
	DrawObs: function () { //  Draw obstacles
		c.fillStyle = "#00ff00";
		for (var i = 0; i < this.obsList.length; i++) {
			this.obsList[i].x -= this.obsSpeed;
			if (i % 2)
				this.obsList[i].draw(c, "up");
			else
				this.obsList[i].draw(c, "down");
		}
	},
	CountScore: function () { // Scoring
		if (this.score == 0 && this.obsList[0].x + this.obsList[0].width < this.startX) {
			pass.play();
			this.score = 1;
			return true;
		}
		return false;
	},
	ShowScore: function () { // Show the score
		c.strokeStyle = "#000";
		c.lineWidth = 1;
		c.fillStyle = "#000";
		c.fillText(this.score, 10, 50);
		c.strokeText(this.score, 10, 50);
	},
	CanMove: function () { // Collision detection
		if (this.bird.y < 0 || this.bird.y > this.mapHeight - this.bird.height - this.line) {
			dead.play();
			this.gameOver = true;
		} else {
			var boundary = [{
				x: this.bird.x,
				y: this.bird.y
			}, {
				x: this.bird.x + this.bird.width,
				y: this.bird.y
			}, {
				x: this.bird.x,
				y: this.bird.y + this.bird.height
			}, {
				x: this.bird.x + this.bird.width,
				y: this.bird.y + this.bird.height
			}];
			for (var i = 0; i < this.obsList.length; i++) {
				for (var j = 0; j < 4; j++)
					if (boundary[j].x >= this.obsList[i].x && boundary[j].x <= this.obsList[i].x + this.obsList[i].width && boundary[j].y >= this.obsList[i].y && boundary[j].y <= this.obsList[i].y + this.obsList[i].height) {
						this.gameOver = true;
						dead.play();
						break;
					}
				if (this.gameOver)
					break;
			}
		}
	},
	CheckTouch: function () { // Detect touch      
		//if (this.touch) {
		//	this.bird.y -= this.upSpeed ;
		//	this.bird.draw(c, "up");
		//}
		if (this.touchup) {
			this.bird.y -= this.downSpeed;
			this.bird.draw(c, "down");
		}
		if (this.touchdown) {
			this.bird.y += this.downSpeed;
			this.bird.draw(c, "up");
		}
		else {
			this.bird.y -= this.downSpeed -3.5 ;
			this.bird.draw(c, "down");
        }

	},
	
	ClearScreen: function () { // Clear the screen
	/* 	img.style.display='none';*/
		c.drawImage(this.bg, 0, 0);
	},
	ShowOver: function() {
		var overImg = new Image();
		overImg.src = "img/over.png";
		overImg.onload = function(){
			c.drawImage(overImg, (this.mapWidth - overImg.width) / 2, (this.mapHeight - overImg.height) / 2 - 50);
		}.bind(this);
		document.onkeydown=function(event){
		    var e = event || window.event || arguments.callee.caller.arguments[0];
			    if(e && e.keyCode==32){
					open('Game2.html',true);
					
						
						// console.log('timer value in click event listener:' + intervalID);
					  
		        }
		};
		return;
	}
};

var game = new FlappyBird();
var Speed = 20;
var IsPlay = false;
var GameTime = null;
var btn_start;
window.onload = InitGame;
var img=document.getElementsByTagName('img')[0];
function InitGame() {
	c.font = "3em Arial";
	game.CreateMap();

	document.onkeydown=function(event){
	    var e = event || window.event || arguments.callee.caller.arguments[0];
		    if (!IsPlay) {
				IsPlay = true;
				GameTime = RunGame(Speed);
			}
	        //else if(e && e.keyCode==32){
	        //    game.touch=true;
	        //}
		switch (event.keyCode) {
			case 32: {
				game.touchup = true;
				break
			}
			case 37: {
				//moveleft()
				break
			}
			case 38: {

				game.touchup = true;
				game.touchdown = false;
				break
			}
			case 39: {
				//moveright()
				break
			}
			case 40: {
				game.touchdown = true;
				break
			}
		}
	
	};
	document.onkeyup = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (!IsPlay) {
			IsPlay = true;
			GameTime = RunGame(Speed);
		}
		
		switch (event.keyCode) {
			case 32: {
				game.touchup = false;
				game.touch = true;
				break
			}
			case 37: {
				//moveleft()
				break
			}
			case 38: {

				game.touchup = false;
				game.touchdown = false;
				game.touch = true;
				break
			}
			case 39: {
				//moveright()
				break
			}
			case 40: {
				game.touch = true;
				game.touchdown = false;
				break
			}
		}

	};

}


function RunGame(speed) {
	var updateTimer = setInterval(function() {
		// If the bird starts the scorekeeper through the first obstacle
		if (game.CountScore()) {
			var scoreTimer = setInterval(function() {
				if (game.gameOver) {
					clearInterval(scoreTimer);
					return;
				}
				pass.play();
				game.score++;
			}, game.obsInterval);
		}

		game.CanMove();
		if (game.gameOver) {
			game.ShowOver();
			clearInterval(updateTimer);
			return;
		}
		game.ClearScreen();
		game.DrawObs();
		game.CheckTouch();
		game.ShowScore();
	}, speed);
	var obsTimer = setInterval(function() {
		if (game.gameOver) {
			clearInterval(obsTimer);
			return;
		}
		game.CreateObs();
	}, game.obsInterval);
}