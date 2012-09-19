// WRONG GRAVITY SOLUTION
var context = canvas.getContext("2d");

for (var i=0; i<20; i++) {
  context.fillRect(10+i*23, 270-i*64+i*i*4, 50, 50);
}

// FAT ZOO ANIMAL
var context = canvas.getContext("2d");
context.fillRect(44, 94, 111, 62);
context.fillRect(44, 94, 41, 111);
context.fillRect(113, 94, 41, 111);
context.fillRect(146, 49, 54, 51);

// CIRCLES
var context = canvas.getContext("2d");
function circle(x, y) {
    context.beginPath();
    context.arc(x, y, 10, 0, 2*Math.PI);
    context.fill();
}

for (var i=0; i<10; i++) {
    circle(300+20*i, 100);
}

// SPIRALS
for (var i=0; i<90; i++) {
  robot.drive(0.09*i);
  robot.turnLeft(73);
}

/// EXAMPLE CONSOLE PROGRAM ///
console.setColor("#64e9e1");
console.log("Colourful multiplication table:");
console.log("");
var width=9;

function printLine(x) {
  var line = "";
  for (var i=1; i<=width; i++) {
    var number = i*x;
    line += number + "\t";
  }
  console.log(line);
}

for (var i=1; i<=30; i++) {
  console.setColor("hsl(" + i*11 + ", 100%, 50%)");
  printLine(i);
}

/// EXAMPLE CANVAS PROGRAM ///
var context = canvas.getContext("2d");
for (var i=0; i<22; i++) {
  context.fillStyle = "hsla(" + (i*17) + ", 80%, 50%, 0.8)";
  context.fillRect(10+i*19.7, 254+i*-52.3+i*i*3.3, 50, 50);
}

context.strokeStyle = "#a526a5";
context.font = "32pt Calibri";
context.lineWidth = 2;
context.strokeText("Hello World!", 73, 399);

// ROBOT EXAMPLE
while(!robot.detectGoal()) {
  robot.turnLeft();
  while (robot.detectWall()) {
    robot.turnRight();
  }
  robot.drive();
}

//CONSOLE EXAMPLE
console.setColor("#fff");
console.log("A colourful multiplication table:");
console.log();

function printLine(n) {
  var text = "";
  for (var i=1; i<=8; i++) {
    text += (i*n) + "\t";
  }
  console.log(text);
}

for (var i=1; i<=20; i++) { 
  console.setColor("hsla(" + i*15 + ", 75%, 50%, 1)");
  printLine(i);
}

console.setColor("#ed7032");
console.log();
console.log(":-D");

// BLOCK EXAMPLE
var x = 10;
var context = canvas.getContext("2d");
context.fillStyle = "#aaa";

function keyDownHandler(event) {
  x += 20;
  context.fillRect(x, 100, 10, 10);
}

document.onkeydown = keyDownHandler;

// uses second curve from http://mathworld.wolfram.com/HeartCurve.html
var context = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

for(var x1=0; x1<5; x1++) {
  var x2 = x1*width/5;
  for (var y1=0; y1<6; y1++) {
    var y2 = y1*height/6;
    
    var x3 = x1*0.55+-1.1;
    var y3 = y1*-0.45+1.25;
if(Math.abs(Math.pow(x3*x3+y3*y3-1,3)-x3*x3*y3*y3*y3)<0.1){
      context.fillStyle = "red";
    } else {
      context.fillStyle = "black";
    }
    context.fillRect(x2, y2, width/10, height/10);
  }
}

// BLOCKS GAME
var x, y, width, height;
var points = 0, total = 0;
var context = canvas.getContext("2d");
context.font = "40pt Arial";

function newBlock() {
  context.clearRect(0, 0, canvas.width, canvas.height-50);
  width = Math.round(Math.random()*150)+50;
  height = Math.round(Math.random()*150)+50;
  x = Math.round(Math.random()*(canvas.width-width));
  y = Math.round(Math.random()*(canvas.height-50-height));
  context.fillRect(x, y, width, height);
  points = 30;
}

function tick() {
  context.clearRect(0, canvas.height-50, canvas.width, 50);
  points--;
  if (points <= 0) {
    newBlock();
  }
  
  var textY = canvas.height-10;
  context.textAlign = "left";
  context.fillText(points, 10, textY);
  context.textAlign = "right";
  context.fillText(total, canvas.width-10, textY);
}

function mouseDown(event) {
  if (event.layerX >= x && event.layerX <= x+width) {
    if (event.layerY >= y && event.layerY <= y+height) {
      total += points;
      points = 0;
      tick();
    }
  }
}

window.setInterval(tick, 25);
canvas.onmousedown = mouseDown;

// Another beautiful heart curve
var context = canvas.getContext("2d");
for (var ix=0; ix<25; ix++) {
  for (var iy=0; iy<25; iy++) {
    var x=ix/8.5-1.42, y=1.55-iy/8, x2=x*x, y2=y*y;
    if (Math.pow(x2+y2-1,3)-x2*y2*y < 0.001) {
      context.fillStyle = "#d00";
    } else {
      context.fillStyle = "#ccc";
    }
    context.fillRect(10+ix*20, 10+iy*20, 12, 12);
  }
}

// BRIDGE
var context = canvas.getContext("2d");

function bridge(x) {
  x -= canvas.width/2;
  return 140+x*x*0.0030+x*x*x*x*3e-8;
}

context.fillRect(0, 350, canvas.width, 4);

context.moveTo(38, 350);
for (var x=38; x<475; x++) {
  context.lineTo(x, bridge(x));
}
context.lineWidth = 4;
context.stroke();

for (var x=38; x<475; x+=20) {
  var y = bridge(x);
  context.fillRect(x-2, y, 3, 350-y);
}

context.strokeRect(-2, 352, 70, 200);
context.strokeRect(canvas.width-68, 352, 70, 200);

// Adapted from billmill.org/static/canvastutorial
var context = canvas.getContext("2d");

var paddleWidth = 80;
var paddleHeight = 12;
var bricks = [];
var bricksNumX = 7;
var bricksNumY = 5;
var brickWidth = canvas.width / bricksNumX;
var brickHeight = 20;
var brickMargin = 4;
var paddleX;
var ballX, ballY, ballVx, ballVy;

for (var y=0; y<bricksNumY; y++) {
  bricks[y] = [];
  for (var x=0; x<bricksNumX; x++) {
    bricks[y][x] = true;
  }
}

function init() {
  paddleX = canvas.width/2;
  ballX = 40;
  ballY = 150;
  ballVx = 7;
  ballVy = 12;
  for (var y=0; y<bricksNumY; y++) {
    for (var x=0; x<bricksNumX; x++) {
      bricks[y][x] = true;
    }
  }
}

function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function circle(x, y) {
  context.beginPath();
  context.arc(x, y, 10, 0, 2*Math.PI);
  context.fill();
}

function drawPaddle() {
  var x = paddleX - paddleWidth/2;
  var y = canvas.height - paddleHeight;
  context.fillRect(x, y, paddleWidth, paddleHeight);
}

function mouseMove(event) {
  paddleX = event.layerX;
}

function hitHorizontal() {
  if (ballX < 0) {
    ballVx = -ballVx;
  } else if (ballX >= canvas.width) {
    ballVx = -ballVx;
  }
}

function hitVertical() {
  if (ballY < 0) {
    ballVy = -ballVy;
  } else if (ballY < brickHeight*bricksNumY) {
    var bx = Math.floor(ballX/brickWidth);
    var by = Math.floor(ballY/brickHeight);
    
    if (bx >= 0 && bx < bricksNumX) {
      if (bricks[by][bx]) {
        bricks[by][bx] = false;
        ballVy = -ballVy;
      }
    }
  } else if (ballY >= canvas.height-paddleHeight) {
    var paddleLeft = paddleX-paddleWidth/2;
    var paddleRight = paddleX+paddleWidth/2;
    if (ballX >= paddleLeft && ballX <= paddleRight) {
      ballVy = -ballVy;
    } else {
      init();
      return false;
    }
  }
  return true;
}

function drawBricks() {
  for (var by=0; by<bricksNumY; by++) {
    for (var bx=0; bx<bricksNumX; bx++) {
      if (bricks[by][bx]) {
        var x = bx * brickWidth + brickMargin/2;
        var y = by * brickHeight + brickMargin/2;
        var width = brickWidth - brickMargin;
        var height = brickHeight - brickMargin;
        context.fillRect(x, y, width, height);
      }
    }
  }
}

function tick() {
  clear();
  drawPaddle();
  
  ballX += ballVx;
  ballY += ballVy;
  
  hitHorizontal();
  if (hitVertical()) {
    circle(ballX, ballY);
    drawBricks();
  } else {
    clear();
  }
}

init();
canvas.onmousemove = mouseMove;
window.setInterval(tick, 30);

