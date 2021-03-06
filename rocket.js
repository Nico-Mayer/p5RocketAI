function Rocket(dna) {
  this.position = createVector(800 / 2, 900 - 20);
  this.vel = createVector();
  this.acc = createVector();
  this.wayIsClear = false;
  this.fitness = 0;
  this.completed = false;
  this.crashed = false;
  this.time = 0;
  this.alive = true;
  this.trail = [];
  this.isBest = false;

  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }

  this.addForce = function (force) {
    this.acc.add(force);
  };

  this.update = function () {
    var d = dist(this.position.x, this.position.y, target.x, target.y);
    // Check if Rocket hits Target
    if (d < targetSize / 2) {
      finished = true;
      this.completed = true;
      if (this.alive) {
        completed++;
        this.alive = false;
      }
    }
    // Check if Rocked is Crasehd
    if (this.crashed) {
      if (this.alive) {
        crashed++;
        alive--;
        this.alive = false;
      }
    }
    // Move Rocket
    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc);
      this.position.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(10);
      this.time++;
    }

    // Stores every location for the Trail
    if (showTrail) {
      var currPos = createVector(this.position.x, this.position.y);
      this.trail.push(currPos);
      if (this.trail.length > 65) {
        this.trail.splice(0, 1);
      }
    } else {
      this.trail = [];
    }
    this.checkForCrash();
    this.addForce(this.dna.genes[count]);
  };

  this.render = function () {
    var alpha = this.dna.alpha;
    if (this.isBest) {
      alpha = 255;
    }
    if (this.dna.colorMutate) {
      var alpha = random(255);
    }
    push();
    if (showDistance || this.isBest) {
      var d = dist(this.position.x, this.position.y, target.x, target.y);
      fill(255);
      textSize(18);
      text(floor(d), this.position.x, this.position.y - 10);
    }
    if (showTrail) {
      this.renderTrail();
    }
    translate(this.position.x, this.position.y);
    rotate(this.vel.heading());
    noStroke();
    fill(this.dna.red, this.dna.green, this.dna.blue, alpha);
    rectMode(CENTER);
    rect(0, 0, 27, 7);
    pop();
  };

  this.calcFitness = function () {
    var d = dist(this.position.x, this.position.y, target.x, target.y);
    this.checkForClearWay(d);

    if (this.completed) {
      this.fitness = 1.0 / 16 + 10000.0 / (this.time * this.time);
    } else {
      this.fitness = 1 / (d * d);
    }
    if (this.crashed) {
      this.fitness = this.fitness / (1500 / this.time);
    }
    if (this.wayIsClear) {
      this.fitness = this.fitness * 16;
    }
  };

  this.checkForCrash = function () {
    for (i = 0; i < obstacles.length; i++) {
      if (obstacles[i].checkCollision(this.position.x, this.position.y)) {
        this.crashed = true;
      }
    }
    // Check for Wall Crash
    if (
      this.position.x < 0 ||
      this.position.x > 800 ||
      this.position.y < 0 ||
      this.position.y > 900
    ) {
      this.crashed = true;
    }
  };

  this.renderTrail = function () {
    var alpha = this.dna.alphaTrail;
    if (this.dna.colorMutate) {
      alpha = random(255);
    }
    stroke(this.dna.redTrail, this.dna.greenTrail, this.dna.blueTrail, alpha);
    beginShape();
    noFill();
    strokeWeight(3);
    for (var i = 0; i < this.trail.length; i++) {
      var v = this.trail[i];
      vertex(v.x, v.y);
    }
    endShape();
  };

  //______________Functions to detect if way to target is Clear_____________________
  this.checkForClearWay = function (distance) {
    var lineToTarget = this.calcRocketToTargetLine(
      this.position,
      target,
      distance
    );
    var colided = 0;
    for (i = 0; i < lineToTarget.length; i++) {
      for (j = 0; j < obstacles.length; j++) {
        if (obstacles[j].checkCollision(lineToTarget[i].x, lineToTarget[i].y)) {
          colided++;
        }
      }
    }
    if (colided == 0) {
      this.wayIsClear = true;
    }
  };

  this.calcRocketToTargetLine = function (pointA, pointB, distance) {
    var diff_X = pointB.x - pointA.x;
    var diff_Y = pointB.y - pointA.y;
    var pointNum = floor(distance);

    var interval_X = diff_X / (pointNum + 1);
    var interval_Y = diff_Y / (pointNum + 1);

    var points = [];
    for (let i = 1; i <= pointNum; i++) {
      points.push(
        createVector(pointA.x + interval_X * i, pointA.y + interval_Y * i)
      );
    }
    return points;
  };
}
