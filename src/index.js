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
  .load(setup);


let mapA, mapB, mapC, mapD

function setup() {
    mapA = new PIXI.Sprite(
        PIXI.Loader.shared.resources["map.png"].texture
      );
    mapA.scale.x = 2;
    mapA.scale.y = 2;

    app.stage.addChild(mapA);

    setupControls()


    app.ticker.add(delta => gameLoop(delta));

}


let state = {
    playerX: 0,
    playerY: 0,
    playerVx: 0,
    playerVy: 0,
}

function gameLoop(delta) {

    state.playerX += state.playerVx;
    state.playerY += state.playerVy;

    updateMapLocation()

}


function updateMapLocation() {
    const halfHeight = WINDOW_HEIGHT / 2
    const halfWidth = WINDOW_WIDTH / 2 
    
    mapA.x = (state.playerX % WINDOW_WIDTH)

    if (mapA.x > 0) {
      mapA.x-= WINDOW_WIDTH
    }
    mapA.y = (state.playerY % WINDOW_HEIGHT)
    if (mapA.y > 0) {
      mapA.y-= WINDOW_HEIGHT
    }
}

function setupControls() {
  const SPEED = 3;
  let up = keyboard("ArrowUp")
  let down = keyboard("ArrowDown")
  let left = keyboard("ArrowLeft")
  let right = keyboard("ArrowRight")

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