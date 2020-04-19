import * as PIXI from "pixi.js"

export function keyboard(value) {
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

  export function distance(a, b) {
    let d = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
    return Math.sqrt(d)
  }

  export function colliding(spriteA, spriteB) {
    let ab = spriteA.getBounds()
    let bb = spriteB.getBounds()
    let c = ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
    if (c) {
        console.log(spriteA.type, spriteB.type, "collided")
        console.log("distance:", distance(spriteA, spriteB))
        //drawBoundingBox(spriteA)
        //drawBoundingBox(spriteB)
    }
    return c
  }

  export function addBoundingBox(sprite) {
    let boundingBox = new PIXI.Graphics();
    boundingBox.lineStyle(1, 0xFF0000);
    let bb = sprite.getBounds();
    boundingBox.drawRect(0, 0, bb.width, bb.height);
    sprite.addChild(boundingBox)
  }

  function drawBoundingBox(sprite) {
    let boundingBox = new PIXI.Graphics();
    boundingBox.lineStyle(1, 0xFF0000);
    let bb = sprite.getBounds();
    boundingBox.drawRect(bb.x, bb.y, bb.width, bb.height);
    sprite.parent.addChild(boundingBox)
  }