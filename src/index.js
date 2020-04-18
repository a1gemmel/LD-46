import * as PIXI from "pixi.js"


//Create a Pixi Application
let app = new PIXI.Application({width: 512, height: 512});

//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById("game").appendChild(app.view);