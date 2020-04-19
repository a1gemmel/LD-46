"use strict;"
import * as PIXI from "pixi.js"
import { GameItems } from "./items.js"
import { keyboard, distance, colliding, addBoundingBox } from "./util.js"
import * as Game from "./const.js"

document.PIXI = PIXI

let SPEED = Game.WARM_SPEED;


//Create a Pixi Application
let app = new PIXI.Application({ width: Game.WINDOW_WIDTH, height: Game.WINDOW_HEIGHT });
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
  .add("footsteps-snowshoe.png")
  .add("plane.png")
  .add("toque.png")
  .add("mittens.png")
  .add("player-hat-mittens.png")
  .add("player-hat.png")
  .add("player-mittens.png")
  .add("rock-1.png")
  .add("rock-2.png")
  .add("rock-3.png")
  .add("rock-4.png")
  .add("shrub.png")
  .add("thermos.png")
  .add("snowshoes.png")
  .load(setup);


let map, fire, player, notifyText

function setup() {
  map = new PIXI.Sprite(
    PIXI.Loader.shared.resources["map.png"].texture
  );
  map.solid = false;
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
  fire.x = Game.WINDOW_WIDTH / 2 + 150;
  fire.y = Game.WINDOW_HEIGHT / 2 + 150;
  fire.play()
  fire.animationSpeed = 0.25;
  fire.solid = false;
  fire.type = "fire";

  let fireCircle = new PIXI.Graphics();
  fireCircle.lineStyle(3, 0xC9701C)
  fireCircle.drawCircle(fire.x, fire.y, Game.FIRE_AFFECT_DISTANCE)
  fireCircle.alpha = 0.5;
  app.stage.addChild(fireCircle);
  state.worldItems.push(fireCircle)
  state.worldItems.push(fire);

  generateItems()

  let plane = new PIXI.Sprite(
    PIXI.Loader.shared.resources["plane.png"].texture
  )
  plane.x = 45;
  plane.y = 332;
  plane.rotation = 0.32
  app.stage.addChild(plane);
  plane.type = "plane";
  plane.solid = false;
  state.worldItems.push(plane);

  notifyText = new PIXI.Text(
    'This is a PixiJS text',
    {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xff1010,
      align: 'center'
    });
  notifyText.alpha = 0;
  notifyText.type = "text";
  state.worldItems.push(notifyText);
  app.stage.addChild(notifyText);


  player = new PIXI.Sprite(
    PIXI.Loader.shared.resources["player.png"].texture
  )
  player.x = Game.WINDOW_WIDTH / 2;
  player.y = Game.WINDOW_HEIGHT / 2;
  player.anchor.x = 0.5
  player.anchor.y = 0.5
  player.scale.x = 0.5
  player.scale.y = 0.5
  player.type = "player";
  //addBoundingBox(player)

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



function setText(text) {
  notifyText.text = text
  notifyText.x = player.x + 10;
  notifyText.y = player.y - 10;
  notifyText.alpha = 1;
}

function gameLoop() {
  if (state.fireSize > 5) {
    state.fireSize *= 0.998
  }

  addFootstep()
  updatePlayerRotation()
  let [actualVx, actualVy] = updatePlayerPosition()
  calculateBodyHeat()
  updateMapLocation()

  if (14 < state.timeToLose && state.timeToLose < 15) {
    setText("Your fire will go out soon...")
  }
  fire.scale.x = 0.5 * (0.1 + Math.log10(state.fireSize))
  fire.scale.y = 0.5 * (0.1 + Math.log10(state.fireSize))

  function move(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i].x += actualVx;
      arr[i].y += actualVy;
    }
  }

  move(state.worldItems)
  move(state.footsteps)

  state.footsteps.forEach(f => {
    f.alpha -= 0.001
  })
  notifyText.alpha -= 0.006;



  state.timeToLose -= (1 / 60)
  state.timeToRescue -= (1 / 60)
  updateScoreboard()
}

function updatePlayerPosition() {
  let oldX = player.x;
  let oldY = player.y;
  player.x -= state.playerVx;
  player.y -= state.playerVy;

  for (let i = 0; i < state.worldItems.length; i++) {
    let item = state.worldItems[i]

    // it's something we can pick up
    if (!item.solid) {
      if (distance(item, player) < 50) {
        let pickedUp = tryPickupItem(item)
        if (pickedUp) {
          state.worldItems.splice(i, 1)
          item.destroy()
        }
      }
      continue;
    }

    // it's something we can walk into
    if (colliding(player, item)) {
      // try just the X move
      player.y = Math.round(oldY)
      if (!colliding(player, item)) {
        // // go on to check collision with other objects
        player.x = oldX;
        state.playerX += state.playerVx;
        return [state.playerVx, 0];
      }
      // try just the Y move
      player.y = oldY - state.playerVy
      player.x = oldX
      if (!colliding(player, item)) {
        player.y = oldY;
        state.playerY += state.playerVy;
        return [0, state.playerVy]
      } else {
        player.x = oldX;
        player.y = oldY;
        return [0, 0]
      }
    }
  }
  player.x = oldX;
  player.y = oldY;
  state.playerX += state.playerVx;
  state.playerY += state.playerVy;
  return [state.playerVx, state.playerVy];
}

function tryPickupItem(item) {
  switch (item.type) {
    case "logs": {
      state.inventory.logs += 3;
      setText("logs (+3 wood)")
      return true
    }
    case "shrub": {
      state.inventory.logs += 1;
      setText("shrub (+1 wood)")
      return true
    }
    case "mittens": {
      state.inventory.mittens = true;
      if (state.inventory.toque) {
        player.texture = PIXI.Loader.shared.resources["player-hat-mittens.png"].texture
      } else {
        player.texture = PIXI.Loader.shared.resources["player-mittens.png"].texture
      }
      setText(`mittens (+${Game.MITTENS_BUFF}% max warmth`)
      return true
    }
    case "toque": {
      state.inventory.toque = true;
      if (state.inventory.mittens) {
        player.texture = PIXI.Loader.shared.resources["player-hat-mittens.png"].texture
      } else {
        player.texture = PIXI.Loader.shared.resources["player-hat.png"].texture
      }
      setText(`toque (-${Game.TOQUE_BUFF}% freeze rate)`)
      return true
    }
    case "thermos": {
      state.playerTemp += Game.THERMOS_BUFF;
      setText(`hot thermos (+${Game.THERMOS_BUFF}% instant warmth)`)
      return true
    }
    case "snowshoes": {
      state.inventory.snowshoes = true;
      setText(`snowshoes (+${Game.SNOWSHOE_BUFF}% speed)`)
      Game.WARM_SPEED *= 1 + Game.SNOWSHOE_BUFF / 100
      Game.SLOW_SPEED *= 1 + Game.SNOWSHOE_BUFF / 100
      return true
    }
  }
}

function updateScoreboard() {
  let temp = document.getElementById("body-temp")
  let fireclock = document.getElementById("fire-clock")
  let logcount = document.getElementById("log-count")

  temp.style["padding-left"] = state.playerTemp + "px";
  temp.style.backgroundColor = Game.colorForTemp(state.playerTemp);
  document.getElementById("body-temp-icon").src = Game.iconForTemp(state.playerTemp);


  fireclock.innerHTML = Math.ceil(state.timeToLose);
  logcount.innerHTML = state.inventory.logs;
}

function calculateBodyHeat() {
  if (distance(fire, player) > Game.FIRE_AFFECT_DISTANCE) {
    state.playerTemp -= (0.08 * (state.inventory.toque ? (1 - Game.TOQUE_BUFF / 100) : 1))
    if (49 < state.playerTemp && state.playerTemp < 50) {
      setText("You feel the cold...")
    }
    if (24 < state.playerTemp && state.playerTemp < 25) {
      setText("You are dangerously cold...")
      SPEED = Game.COLD_SPEED
      if (state.playerVx != 0) {
        state.playerVx = SPEED * (state.playerVx > 0) ? 1 : -1
      }
      if (state.playerVy != 0) {
        state.playerVy = SPEED * (state.playerVy > 0) ? 1 : -1
      }
    }
    return
  }
  if (state.playerTemp > 50) {
    SPEED = Game.WARM_SPEED
  }

  state.playerTemp += 0.005 * Math.sqrt((Game.FIRE_AFFECT_DISTANCE - distance(fire, player)))
  let maxWarmth = 100 + (state.inventory.mittens ? Game.MITTENS_BUFF : 0)
  state.playerTemp = Math.min(maxWarmth, state.playerTemp)

}

function addFootstep() {
  if (state.footsteps.length > Game.MAX_FOOTSTEPS) {
    let toDelete = state.footsteps.shift()
    toDelete.destroy()
  }

  if (state.footsteps.length > 0) {
    let lastStep = state.footsteps[state.footsteps.length - 1]

    if (distance(lastStep, player) < 32) {
      return
    }
  }

  let asset = state.inventory.snowshoes ? "footsteps-snowshoe.png" : "footsteps.png";
  let newStep = new PIXI.Sprite(
    PIXI.Loader.shared.resources[asset].texture
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

  map.x = (state.playerX % Game.WINDOW_WIDTH)

  if (map.x > 0) {
    map.x -= Game.WINDOW_WIDTH
  }
  map.y = (state.playerY % Game.WINDOW_HEIGHT)
  if (map.y > 0) {
    map.y -= Game.WINDOW_HEIGHT
  }
}

function generateItems() {
  const setRandomPos = function (sprite) {
    sprite.x = (0.5 - Math.random()) * 3000
    sprite.y = (0.5 - Math.random()) * 3000
    if (Math.abs(sprite.x) < 150 && Math.abs(sprite.y) < 150) {
      setRandomPos(sprite);
    }
  }

  Object.keys(GameItems).forEach(function (item) {
    const data = GameItems[item]
    for (let i = 0; i < data.count; i++) {
      const sprite = new PIXI.Sprite(
        PIXI.Loader.shared.resources[item + ".png"].texture
      )
      setRandomPos(sprite)
      // if (data.rotate) {
      //   sprite.rotation = Math.random() * Math.PI * 2
      // }
      sprite.type = item
      sprite.solid = data.solid

      if (Game.DEBUG) {
        addBoundingBox(sprite)
      }

      app.stage.addChild(sprite)
      state.worldItems.push(sprite)
    }
  })
}

function canPlaceWood() {
  return distance(player, fire) < Game.WOOD_PLACE_DISTANCE && state.inventory.logs > 0
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

  document.onmousemove = function (e) {
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

function getMarginalRescueDecrease() {
  return Math.log2(state.fireSize / 2)
}