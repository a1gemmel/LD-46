"use strict;"
import * as PIXI from "pixi.js"

document.PIXI = PIXI

const WINDOW_HEIGHT = 512, WINDOW_WIDTH = 512

const MAX_FOOTSTEPS = 100;
const SPEED = 3;

//Create a Pixi Application
let app = new PIXI.Application({width: WINDOW_WIDTH, height: WINDOW_HEIGHT});
//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById("game").appendChild(app.view);

PIXI.Loader.shared
  .add("map.png")
  .add("fire-1.png")
  .add("fire-2.png")
  .add("fire-3.png")
  .add("fire-4.png")
  .add("player.png")
  .add("logs.png")
  .add("footsteps.png")
  .add("plane.png")
  .load(setup);


let map, fire, player, notifyText

function setup() {
    map = new PIXI.Sprite(
        PIXI.Loader.shared.resources["map.png"].texture
      );
    map.scale.x = 2;
    map.scale.y = 2;

    app.stage.addChild(map);

    fire = new PIXI.AnimatedSprite(
      [
        PIXI.Loader.shared.resources["fire-1.png"].texture,
        PIXI.Loader.shared.resources["fire-2.png"].texture,
        PIXI.Loader.shared.resources["fire-3.png"].texture,
        PIXI.Loader.shared.resources["fire-4.png"].texture,
      ]
    )
    app.stage.addChild(fire);
    fire.scale.x = 0.5;
    fire.scale.y = 0.5;
    fire.anchor.x = 0.5;
    fire.anchor.y = 0.5;
    fire.x = WINDOW_WIDTH / 2 + 50;
    fire.y = WINDOW_HEIGHT / 2 + 50;
    fire.play()
    fire.animationSpeed = 0.25;
    
    generateItems()

    let plane = new PIXI.Sprite(
      PIXI.Loader.shared.resources["plane.png"].texture
    )
    plane.x = 45;
    plane.y = 332;
    plane.rotation = 0.32
    app.stage.addChild(plane);
    plane.type = "plane"
    state.worldItems.push(plane);

    notifyText = new PIXI.Text(
      'This is a PixiJS text',
      {
        fontFamily : 'Arial',
        fontSize: 24, 
        fill : 0xff1010, 
        align : 'center'
      });
      notifyText.alpha = 0;
      notifyText.type = "text";
      state.worldItems.push(notifyText);
      app.stage.addChild(notifyText);


    player = new PIXI.Sprite(
      PIXI.Loader.shared.resources["player.png"].texture
    )
    player.x = WINDOW_WIDTH / 2;
    player.y = WINDOW_HEIGHT / 2;
    player.anchor.x = 0.5
    player.anchor.y = 0.5
    player.scale.x = 0.5
    player.scale.y = 0.5

    app.stage.addChild(player)


    setupControls()
    app.ticker.add(delta => gameLoop(delta));
}


let state = {
    playerX: 0,
    playerY: 0,
    playerVx: 0,
    playerVy: 0,
    fire: fire,
    mouseX: 0,
    mouseY: 0,
    worldItems: [],
    footsteps: [],
    inventory: {
      logs: 0,
      hat: false,
      jacket: false,
    },
    playerTemp: 100,
    timeToLose: 60,
    timeToRescue: 300,
    fireSize: 60,
}

function move(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].x += state.playerVx;
    arr[i].y += state.playerVy;
  }
}

function setText(text) {
  notifyText.text = text
  notifyText.x = player.x + 10;
  notifyText.y = player.y - 10;
  notifyText.alpha = 1;
}

function pickupItems() {
  for (let i = 0; i < state.worldItems.length; i++) {
    let item = state.worldItems[i]
    if (distance(item, player) < 50) {
      switch (item.type) {
        case "log": {
          state.inventory.logs += 3;
          state.worldItems.splice(i, 1)
          item.destroy()
          setText("+3 wood")
          return;
        }
      }
    }
  }
}

function gameLoop() {
    state.playerX += state.playerVx;
    state.playerY += state.playerVy;
    fire.x += state.playerVx;
    fire.y += state.playerVy;

    if (state.fireSize > 5) {
      state.fireSize *= 0.998
    }
    fire.scale.x = 0.5 * (0.1 + Math.log10(state.fireSize))
    fire.scale.y = 0.5 * (0.1 + Math.log10(state.fireSize))

    move(state.worldItems)
    move(state.footsteps)

    state.footsteps.forEach(f => {
      f.alpha -= 0.001
    })
    notifyText.alpha -= 0.01;

    addFootstep()

    updatePlayerRotation()
    calculateBodyHeat()
    pickupItems()

    updateMapLocation()
  
    state.timeToLose -= (1 / 60)
    state.timeToRescue -= (1 / 60)
    updateScoreboard()
}

function updateScoreboard() {
  let temp = document.getElementById("body-temp")
  let fireclock = document.getElementById("fire-clock")
  let logcount = document.getElementById("log-count")
  let rescueclock = document.getElementById("rescue-clock")

  temp.innerHTML = Math.ceil(state.playerTemp);
  fireclock.innerHTML = Math.ceil(state.timeToLose);
  rescueclock.innerHTML = Math.ceil(state.timeToRescue);
  logcount.innerHTML = state.inventory.logs;
}

function calculateBodyHeat() {
  const FIRE_AFFECT_DISTANCE = 300
  if (distance(fire, player) > FIRE_AFFECT_DISTANCE) {
    state.playerTemp -= 0.08
    return
  }
  state.playerTemp += 0.005 * Math.sqrt((FIRE_AFFECT_DISTANCE - distance(fire, player)))
  state.playerTemp = Math.min(100, state.playerTemp)

}

function addFootstep() {


  if (state.footsteps.length > MAX_FOOTSTEPS) {
    let toDelete = state.footsteps.shift()
    toDelete.destroy()
  }

  if (state.footsteps.length > 0) {
    let lastStep = state.footsteps[state.footsteps.length - 1]

    if ( distance(lastStep, player) < 32) {
      return
    }
  }

  let newStep = new PIXI.Sprite(
    PIXI.Loader.shared.resources["footsteps.png"].texture
  );
  newStep.rotation = player.rotation
  newStep.anchor.x = 0.5
  newStep.anchor.y = 0.5
  newStep.x = player.x
  newStep.y = player.y
  state.footsteps.push(newStep)
  app.stage.addChild(newStep)
}


function updatePlayerRotation() {
  if (state.playerVx > 0) {
    if (state.playerVy > 0) {
      player.rotation = Math.PI * 1.75;
    } else if (state.playerVy < 0) {
      player.rotation = Math.PI * 1.25;
    } else {
      player.rotation = Math.PI * 1.5;
    }
  } else if (state.playerVx < 0) {
    if (state.playerVy > 0) {
      player.rotation = Math.PI * 0.25;
    } else if (state.playerVy < 0) {
      player.rotation = Math.PI * 0.75;
    } else {
      player.rotation = Math.PI * 0.5;
    }
  } else if (state.playerVy > 0) {
    player.rotation = Math.PI * 0;
  } else if (state.playerVy < 0) {
    player.rotation = Math.PI * 1;
  }
}



function updateMapLocation() {
    
    map.x = (state.playerX % WINDOW_WIDTH)

    if (map.x > 0) {
      map.x-= WINDOW_WIDTH
    }
    map.y = (state.playerY % WINDOW_HEIGHT)
    if (map.y > 0) {
      map.y-= WINDOW_HEIGHT
    }
}

function generateItems() {
  for (let i = 0; i < 50; i ++) {
    let log = new PIXI.Sprite(
      PIXI.Loader.shared.resources["logs.png"].texture
    );
    log.x = Math.random() * 3000
    log.y = Math.random() * 3000
    log.type = "log"
    app.stage.addChild(log)
    state.worldItems.push(log)
  }

}

function canPlaceWood() {
  return distance(player, fire) < 200 && state.inventory.logs > 0
}

function setupControls() {
  let up = keyboard("w")
  let down = keyboard("s")
  let left = keyboard("a")
  let right = keyboard("d")

  up.press = () => {
    state.playerVy = SPEED
  };
  up.release = () => {
    if (state.playerVy > 0) {
      state.playerVy = 0
    }
  };
  down.press = () => {
    state.playerVy = -SPEED
  };
  down.release = () => {
    if (state.playerVy < 0) {
      state.playerVy = 0
    }
  };
  left.press = () => {
    state.playerVx = SPEED
  };
  left.release = () => {
    if (state.playerVx > 0) {
      state.playerVx = 0
    }
  };
  right.press = () => {
    state.playerVx = -SPEED
  };
  right.release = () => {
    if (state.playerVx < 0) {
      state.playerVx = 0
    }
  };

  let e = keyboard("e")
  e.press = () => {
    if (canPlaceWood()) {
      state.inventory.logs--;
      let fireAdd = getMarginalFireTimeIncrease()
      let rescueAdd = getMarginalRescueDecrease()
      console.log("fire size", state.fireSize, "time add + ", fireAdd, "rescue - ", rescueAdd)
      state.timeToLose += fireAdd
      state.fireSize += 10
      state.timeToRescue -= rescueAdd
    }
  }

  document.onmousemove = function(e) {
    let game = document.getElementById("game")
    state.mouseX = e.clientX - game.getBoundingClientRect().x
    state.mouseY = e.clientY - game.getBoundingClientRect().y
  }
}

// Adding logs has a log effect (heh) on the time remaining since 
// it makes a bigger fire
function getMarginalFireTimeIncrease() {
  return 60 / state.fireSize
}

function  getMarginalRescueDecrease() {
  return Math.log2(state.fireSize / 2)
}


function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener(
    "keydown", downListener, false
  );
  window.addEventListener(
    "keyup", upListener, false
  );
  
  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}

function distance(a, b) {
  let d = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
  return Math.sqrt(d)
}