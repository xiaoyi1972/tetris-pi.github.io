function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
class SingleParticle {
  constructor(properties) {
    this.HZ_MATCH_MULTIPLIER = .5 / 60 * 1000;
    this.xDampening = 1;
    this.yDampening = 1;
    this.xFlurry = 0;
    this.yFlurry = 0;
    this.flicker = 0;
    this.lifetime = 0;
    this.maxlife = 100;
    this.opacity = 1;
    this.gravity = 0;
    this.gravityAcceleration = 1.05;
    this.lifeVariance = 0;
    this.type = "";
    for (const key of Object.keys(properties)) {
      const value = properties[key];
      this[key] = value;
    }
    const lifeGen = getRandomInt(this.lifeVariance * 100) / 100;
    this.maxlife += this.lifeVariance / 2 - lifeGen;
    this.maxlife *= this.HZ_MATCH_MULTIPLIER;
  }
  update(ms) {
    const widthMultiplier = 190 / 400;
    const multiplier = ms / 8.33333333333;
    const multiplierWithWidth = ms / 8.33333333333 * widthMultiplier;
    const xFlurryGen = getRandomInt(this.xFlurry * 100) / 100;
    const yFlurryGen = getRandomInt(this.yFlurry * 100) / 100;
    this.xVelocity += (this.xFlurry / 2 - xFlurryGen) * multiplier;
    this.yVelocity += (this.yFlurry / 2 - yFlurryGen) * multiplier;
    this.lifetime += this.HZ_MATCH_MULTIPLIER * multiplier;
    this.x += this.xVelocity * multiplierWithWidth;
    this.y -= this.yVelocity * multiplierWithWidth;
    this.y += this.gravity * multiplier;
    this.gravity *= 1 + (this.gravityAcceleration - 1) * multiplier;
    this.xVelocity /= 1 + (this.xDampening - 1) * multiplier;
    this.yVelocity /= 1 + (this.yDampening - 1) * multiplier;
    //console.log(this.lifetime,this.maxlife)
    if (this.lifetime >= this.maxlife) {
      return true;
    }
  }
  draw(ctx) {
    const opacity = (this.maxlife - this.lifetime) / this.maxlife - Math.random() * this.flicker;
    ctx.fillStyle = `rgba(${this.red}, ${this.blue}, ${this.green}, ${opacity})`;
    ctx.strokeStyle = `rgba(${this.red}, ${this.blue}, ${this.green}, ${opacity})`;
    ctx.lineWidth = 1
    const size = 6;
    //console.log(this.x, this.y)
    if (this.type == "line") {
      ctx.strokeStyle = `rgba(${this.red}, ${this.blue}, ${this.green}, ${opacity})`;
      ctx.lineWidth = 0.5
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y - 100);
      ctx.stroke();
    }
    else if (this.type == "square") {
      ctx.save()
      ctx.translate(this.x + size / 2, this.y + size / 2)
      ctx.rotate(opacity * 2 * Math.PI);
      ctx.translate(-(this.x + size / 2), -(this.y + size / 2))
      //ctx.fillRect(this.x, this.y, size, size);
      ctx.strokeRect(this.x, this.y, size, size);
      ctx.restore()
    }
    else if (this.type == "circle") {
      ctx.strokeStyle = `rgba(${this.red}, ${this.blue}, ${this.green}, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6, 0, 2 * Math.PI);
      ctx.stroke();
    }
    //ctx.fillRect(this.x, this.y, size, size);
  }
}

class Particle {
  constructor(ctx) {
    this.ctx = ctx;
    this.particles = [];
    this.hasCleared = false;
  }
  add(properties) {
    this.particles.push(new SingleParticle(properties));
  }
  // generate(x, y, xRange, yRange, velX, varianceX, velY, varianceY, amount) {
  generate(properties) {
    let r = getRandomInt(255 * 100) / 100
    let g = getRandomInt(255 * 100) / 100
    let b = getRandomInt(255 * 100) / 100
    const p = {
      amount: 1,
      red: r,
      blue: b,
      green: g,
      xVariance: 0,
      yVariance: 0,
      xVelocity: 0,
      yVelocity: 0,
      ...properties,
    };
    p.amount *= 0.5 * 1;
    for (let i = 0; i <= p.amount; i++) {
      const xGen = getRandomInt(p.xRange * 100) / 100 + p.x;
      const yGen = getRandomInt(p.yRange * 100) / 100 + p.y;
      const xVelGen = getRandomInt(p.xVariance * 100) / 100;
      const yVelGen = getRandomInt(p.yVariance * 100) / 100;
      const xVelocity = p.xVariance / 2 - xVelGen + p.xVelocity;
      const yVelocity = p.yVariance / 2 - yVelGen + p.yVelocity;
      const finalProperties = {
        ...p,
        x: xGen,
        y: yGen,
        xVelocity: xVelocity,
        yVelocity: yVelocity,
      };
      this.add(finalProperties);
    }
  }
  update(ms) {
    const limit = 1000;
    while (this.particles.length > limit) {
      this.particles.splice(getRandomInt(limit - 1), 1);
    }
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      if (particle.update(ms)) {
        this.particles.splice(i, 1);
        i--;
      }
    }
    if (this.particles.length > 0) {
      this.isDirty = true;
      this.draw();
    } else {
      if (!this.hasCleared) {
        //clearCtx(this.ctx);
        this.hasCleared = true;
      }
    };
  }
  delete() {
    this.particles.splice(0);
  }
  draw() {
    //clearCtx(this.ctx);
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
  }
}