// Initalize function and variables --------------------------------------------------------------
let canvas;
let awakeFunction;
let gameLogicFunction;
function initCGFW(awake, gameLogic, html_canvas, drawfunction, w, h, fs = false){
    canvas = addCGCanvas(html_canvas, drawfunction, w, h, fs);

    awakeFunction = awake;
    gameLogicFunction = gameLogic;

    Awake();
}
// ----------------------------------------------------------------------------------------------

// Handle game start and update loop ------------------------------------------------------------
function Awake(){
    awakeFunction();
    //setInterval(Update, 1000/FPS);
    requestAnimationFrame(Update);
}

//Update now uses requestAnimationFrame instead of setInterval
//and it also passes in the deltaTime, to be used in the game logic
let lastTime = Date.now();
function Update(){
    let currentTime = Date.now();
    let deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    //let logicTime = Date.now();
    gameLogicFunction(deltaTime);
    //logicTime = Date.now() - logicTime;
    
    //let drawTime = Date.now();
    CGDraw(canvas);
    //drawTime = Date.now() - drawTime;
    //console.log('logicTime:' + logicTime + '   draw time: ' + drawTime);

    requestAnimationFrame(Update); // As long as gameLogic and CGDraw finsih in less than 16.67ms, this will run at 60fps
}
//----------------------------------------------------------------------------------------------

// Helper functions ------------------------------------------------------------------------------
function truncate(num, places){
    let multiplier = Math.pow(10, places);
    return Math.trunc(num * multiplier) / multiplier;
}

// ----------------------------------------------------------------------------------------------

// Input functions -----------------------------------------------------------------------------
//call this function to get the mouse position
//have to send the event from the event listener
function getMousePos(e){
    console.log('getMousePos');
    console.log(e);
    console.log(canvas);
    //have to do canvas.canvas because canvas is CGCanvas object
    let rect = canvas.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    [x,y] = reverseStandardize(x, y); //convert to user coordinates
    return [x,y];
}

// automatically called when a key is pressed
// keyMap is a dictionary of all the keys that are currently being pressed
const keyMap = {};
onkeydown = onkeyup = function(e){
    e.preventDefault();
    keyMap[e.key] = e.type == 'keydown';
}
//----------------------------------------------------------------------------------------------

// GameObjects ---------------------------------------------------------------------------------
class GameObject{
    constructor(x, y, w, h, spriteSrc){ 
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        let img = new Image();
        img.src = spriteSrc;
        this.sprite = img;
        this.flipX = false;
    }

    moveTo(x, y){
        this.x = x;
        this.y = y;
    }

    changeSprite(spriteSrc){
        this.sprite.src = spriteSrc;
    }

    draw(){
        if(this.flipX){
            drawSpriteFlipX(this.x, this.y, this.w, this.h, this.sprite);
        }
        else{
            drawSprite(this.x, this.y, this.w, this.h, this.sprite);       
        }
    }

    isClicked(e){
        let [x,y] = getMousePos(e);
        if(x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h){
            return true;
        }
        return false;
    }
}
// ----------------------------------------------------------------------------------------------

// UI ------------------------------------------------------------------------------------------
// Must inlcude TextBox.draw() for every textbox in the draw function
class TextBox{
    constructor(x, y, w, h, text, textColor, fontSize, backgroundColor){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.textColor = textColor;
        this.fontSize = fontSize;
        this.backgroundColor = backgroundColor;
    }

    draw(){
        fillRect(this.x, this.y, this.w, this.h, this.backgroundColor); // background

        let text = this.text;

        //check if the text is too tall for the textbox
        let textHeight = this.fontSize;
        if(textHeight >= this.h){
            return; //text is too tall for the textbox
        }

        //check if the text is too wide for the textbox
        //if it is, then it will be cut off
        let textWidth = getTextWidth(text, this.fontSize);
        if(textWidth >= this.w){
            //text is too wide for the textbox, cut off the text
            let textWidthPerChar = textWidth / text.length; //average width of each character
            let maxChars = Math.floor(this.w / textWidthPerChar); //max number of characters that can fit in the textbox
            text = text.substring(0, maxChars - 1) + '..'; //cut off the text(plus one extra to add the '..' to the end) 
        }

        drawText(this.x, this.y, text, this.textColor, this.fontSize);
    }
    isClicked(e){
        let [x,y] = getMousePos(e);
        if(x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h){
            return true;
        }
        return false;
    }
}

function getTextWidth(text, fontSize){
    canvas.ctx.font = fontSize + 'px Arial';
    return canvas.ctx.measureText(text).width;
}
// ----------------------------------------------------------------------------------------------