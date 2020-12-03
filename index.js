
// GAME
let Game1 = false;
const gameWrapper = document.getElementById(`app`);
let SpeedTimer = document.getElementById(`speed`);
const myInterval = setInterval(DidWeWinYet, 1000);
let BoolSpeed = false;
let SpeedMaintain = 0;
// START 
const difficultySelectForm = document.getElementById(`difficultySelect`);
let intervalID = null;
const timeDisplay = document.querySelector('.time-display');
let timeInSeconds = 0;

//storage
const fastest = document.querySelector('.time');
const fastestTimeSpan = document.querySelector('time-display');
let storageAvailable = false;



/*---------------------------------------------------------*/ 

if (typeof(Storage) !== "undefined") {
    storageAvailable = true;
    if(localStorage.fastestTime){
    /**	fastestTimeSpan.innerHTML = localStorage.fastestTime;
     	fastest.classList.add('show');*/
    }
}


// loop untill 100mph is maintain for 5 sec or <
function DidWeWinYet(){
  if((SpeedTimer.innerHTML) >= 100){
    BoolSpeed= true;
    SpeedMaintain++
    
  }
  else{
    BoolSpeed= false;
    SpeedMaintain = 0;
  }
  if(Game1 == false){
    // if we maintain over 5 sec then we win  
    if(SpeedMaintain >=5 ){ 
      localStorage.fastestTime = timeInSeconds;
    alert('gratz moving to next stage');
    localStorage.fastestTime= timeDisplay.textContent;
    Game1=true;
    open('Game2.html',true);
    }
  }
  else{
    /** nothing futher  */
  }
}


SpeedTimer.addEventListener(`input`, function (event) {  
  alert(speedEl.innerHTML);
  if(number(speedEl.innerHTML) >= "50"){
    alert(speedEl.innerHTML);
    }
  });


difficultySelectForm.addEventListener(`submit`, function (event) {
console.log("User clicked the start button");

  event.preventDefault();
  gameWrapper.classList.remove(`hidden`);
  difficultySelectForm.classList.add(`hidden`);
  if(!intervalID){
    intervalID = setInterval(displaySeconds, 1000);
    // console.log('timer value in click event listener:' + intervalID);
  }
  });

  function displaySeconds(){
    timeInSeconds++;
    timeDisplay.textContent = timeInSeconds;
  }

const canvasWidth = Math.min(
  window.innerWidth,
  config.maxCanvasWidth,
)
const canvasHeight = window.innerHeight



const { requestAnimationFrame } = window
let prevTime = 0

const render = (game, time) => {
  const {
    ctx,
    player,
  } = game

  const speed = getSpeed(game)
  const { fps } = config

  if (time - prevTime > 1000 / fps) {
    clearCanvas(ctx)

    moveRoad(game)
    drawRoad(game)

    updateSpeed(game, speed)
    outputCurrentInfo(game)

    player.move(game)
    player.draw(ctx)

    controlEnemies(game)
    controlExplosions(game)

    checkEnemiesCollisions(game)
    prevTime = time
  }

  requestAnimationFrame((time) => render(game, time))
}

const checkEnemiesCollisions = (game) => {
  const {
    player,
    objects: { enemies = []},
  } = game

  enemies.forEach((enemy) => {
    const isCollision = checkCollisions(player, enemy, Player, Enemy)
    if (isCollision) onCarCrash(game)
  })
}


const crashAudioElm = document.getElementById('crashAudio')
const onCarCrash = (game) => {
  removeSpeedInterval(game)
  setSpeed(game, 0)
}

const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
}

window.onload = () => {
  const canvas = document.getElementById('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const ctx = canvas.getContext('2d')

  const playerX = (canvasWidth - Player.width) / 2 - 10
  const playerY = (canvasHeight - Player.height) - 50

  const player = new Player(playerX, playerY)
  const game = {
    ctx,
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
    },
    control: {
      pedals: {
        gas: false,
        brake: false,
      },
      prevPedal: 'gas',
      turn: {
        left: false,
        right: false,
      },
    },
    player,
    objects: {
      enemies: [],
      trees: [],
      explosions: [],
    },
    road: [],
    score: {
      distance: 0,
      circles: [],
    },
  }
  setSpeed(game, 20)
  addEventListener('keydown', (e) => player.moveCarByEvent.bind(player)(e, game))
  addEventListener('keyup', (e) => player.stopKeyEvent.bind(player)(e, game))
  render(game)
}
