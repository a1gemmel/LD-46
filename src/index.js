"use strict;"
import * as PIXI from "pixi.js"

document.PIXI = PIXI

const WINDOW_HEIGHT = 512, WINDOW_WIDTH = 512

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
  .load(setup);


let map, fire, player

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
    fire.x = WINDOW_WIDTH / 2 + 50;
    fire.y = WINDOW_HEIGHT / 2 + 50;
    fire.play()
    fire.animationSpeed = 0.25;
    
    generateItems()

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
    inventory: {},
}

function move(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].x += state.playerVx;
    arr[i].y += state.playerVy;
  }
}


function gameLoop(delta) {

    state.playerX += state.playerVx;
    state.playerY += state.playerVy;
    fire.x += state.playerVx;
    fire.y += state.playerVy;

    move(state.worldItems)
    move(state.footsteps)

    addFootstep()

    updatePlayerRotation()

    updateMapLocation()
  

}


function addFootstep() {
  if (state.footsteps.length > 0) {
    let laststep = state.footsteps[state.footsteps.length - 1]
    let lastX = laststep.x + (laststep.width / 2)
    let lastY = laststep.y + (laststep.height / 2)

    let distance = Math.pow(player.x + (player.width / 4) - lastX, 2) + Math.pow(player.y + (player.height / 4) - lastY, 2)
    if ( distance < Math.pow(32, 2)) {
      return
    }
  }

  let newStep = new PIXI.Sprite(
    PIXI.Loader.shared.resources["footsteps.png"].texture
  );
  newStep.rotation = player.rotation
  newStep.x = player.x
  newStep.y = player.y
  state.footsteps.push(newStep)
  app.stage.addChild(newStep)
}


function updatePlayerRotation() {
  //player.rotation = Math.atan((player.y - state.mouseY) / (player.x - state.mouseX)) + Math.PI / 2
  //if (state.mouseX < player.x) {
  //  player.rotation += Math.PI;
  //}


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
  
  console.log(state.playerVx, state.playerVy, player.rotation)
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
    app.stage.addChild(log)
    state.worldItems.push(log)
  }

}

function setupControls() {
  const SPEED = 3;
  let up = keyboard("w")
  let down = keyboard("s")
  let left = keyboard("a")
  let right = keyboard("d")

  up.press = () => {
    state.playerVy = SPEED
  };
  up.release = () => {
    if (state.playerVy == SPEED) {
      state.playerVy = 0
    }
  };
  down.press = () => {
    state.playerVy = -SPEED
  };
  down.release = () => {
    if (state.playerVy == -SPEED) {
      state.playerVy = 0
    }
  };
  left.press = () => {
    state.playerVx = SPEED
  };
  left.release = () => {
    if (state.playerVx == SPEED) {
      state.playerVx = 0
    }
  };
  right.press = () => {
    state.playerVx = -SPEED
  };
  right.release = () => {
    if (state.playerVx == -SPEED) {
      state.playerVx = 0
    }
  };

  document.onmousemove = function(e) {
    let game = document.getElementById("game")
    state.mouseX = e.clientX - game.getBoundingClientRect().x
    state.mouseY = e.clientY - game.getBoundingClientRect().y
  }

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