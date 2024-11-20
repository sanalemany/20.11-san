let font;
let tSize = 130;  // tamaño del texto inicial
let tposX = 30;   // X position of text 
let tposY = 150;  // Y position of text
let pointCount = 0.25;  // between 0 to 1 point count

let speed = 8;    // speed particules, cuando más bajo el num más rápido 
let comebackSpeed = 50;  // como de rápido vuelve la interacción al estado normal 

let dia = 60; // diameter of interaction, al pasar el mouse
let randomPos = true;  // Random starting points
let pointsDirection = "right-down";  // Direction of movement (from right and down)
let interactionDirection = -0.7;  // -1 to 1, attraction to mouse

let textPoints = [];
let changeTime = 5000; // 5 segundos en milisegundos
let lastChangeTime = 0;
let isChanged = false; // Estado del texto

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeTextPoints("hello!!", tSize); // Inicialmente con "hello!!"
  lastChangeTime = millis(); // Marca el tiempo de inicio
}

function draw() {
  background(0);

  // Verifica si han pasado 5 segundos para cambiar el texto
  if (millis() - lastChangeTime > changeTime && !isChanged) {
    isChanged = true;
    tSize = 70; // Tamaño más pequeño
    initializeTextPoints("I'm Sandra Alemany\nfrom san.studio", tSize); // Recalcula con el nuevo texto
  }

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();
    v.behaviors();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (isChanged) {
    initializeTextPoints("I'm Sandra Alemany\nfrom san.studio", tSize);
  } else {
    initializeTextPoints("hello!!", tSize);
  }
}

// Recalcula las posiciones de las partículas
function initializeTextPoints(text, size) {
  textPoints = []; // Resetea las partículas existentes

  // Ajusta la posición inicial del texto
  tposX = width / 2 - size * 1.4;
  tposY = height / 2 - size / 2; // Centrado verticalmente
  let lines = text.split("\n"); // Divide el texto en líneas

  for (let j = 0; j < lines.length; j++) {
    let line = lines[j];
    let points = font.textToPoints(line, tposX, tposY + j * size * 1.2, size, {
      sampleFactor: pointCount,
    });

    for (let i = 0; i < points.length; i++) {
      let pt = points[i];
      let textPoint = new Interact(
        pt.x,
        pt.y,
        speed,
        dia,
        randomPos,
        comebackSpeed,
        pointsDirection,
        interactionDirection
      );
      textPoints.push(textPoint);
    }
  }
}

function Interact(x, y, m, d, t, s, di, p) {
  // Set home position
  this.home = t ? createVector(random(width), random(height)) : createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  // Set initial velocity based on right-down direction
  if (di === "right-down") {
    this.vel = createVector(1, 1).normalize().mult(m);  // Diagonal from right and down
  } else {
    this.vel = createVector(0, 0); // Default
  }

  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxForce = 0.6;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.color = color(255, 0, 0); // color inicial rojo
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
}

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
}

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.maxForce);
  return steer;
}

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    this.color = color(255, 105, 180);  // cambiar el color a rosa cuando haya interacción
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    this.color = color(255, 0, 0);  // volver al rojo cuando no haya interacción
    return createVector(0, 0);
  }
}

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
}

Interact.prototype.show = function () {
  stroke(this.color);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
}
