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


  export function colliding(player, object) {
      let pbox = player.getBounds()
      let obox = object.getBounds()

      let px = Math.round(pbox.x + 0.5 * pbox.width);
      let py = Math.round(pbox.y + 0.5 * pbox.height);

      let testX = px
      let testY = py

      if (px < obox.x) {
          testX = obox.x;        // left edge
      } else if (px > obox.x + obox.width) {
          testX = obox.x + obox.width; // right edge
      }
      if (py < obox.y) {
        testY = obox.y;        // top edge
      } else if (py > obox.y + obox.height) {
        testY = Math.floor(obox.y + obox.height); // bottom edge
      }

      let radius = 12;
      let distX = px - testX;
      let distY = py - testY;
      let distance = Math.sqrt((distX*distX) + (distY*distY));

      return distance <= radius
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