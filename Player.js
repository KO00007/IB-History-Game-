class Player extends GameObject {
  constructor(x, y) {
    super(x - 15, y - 15, 30, 30);
    this.name = 'Player';
    this.cx = x;
    this.cy = y;
    this.angle = -Math.PI / 2;
    this.vx = 0;
    this.vy = 0;
    this.thrusting = false;
    this.invulnerable = 3.0;
    this.shootCooldown = 0;
  }

  update(dt, canvas, keys) {
    if (keys['ArrowLeft'] || keys['a']) this.angle -= 5 * dt;
    if (keys['ArrowRight'] || keys['d']) this.angle += 5 * dt;
    this.thrusting = keys['ArrowUp'] || keys['w'];
    
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * 400 * dt;
      this.vy += Math.sin(this.angle) * 400 * dt;
    }
    
    this.vx *= 0.99;
    this.vy *= 0.99;
    
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > 500) {
      this.vx = (this.vx / speed) * 500;
      this.vy = (this.vy / speed) * 500;
    }
    
    this.cx += this.vx * dt;
    this.cy += this.vy * dt;
    
    if (this.cx < 0) this.cx += canvas.width;
    if (this.cx > canvas.width) this.cx -= canvas.width;
    if (this.cy < 0) this.cy += canvas.height;
    if (this.cy > canvas.height) this.cy -= canvas.height;
    
    this.x = this.cx - 15;
    this.y = this.cy - 15;
    
    if (this.invulnerable > 0) this.invulnerable -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
  }

  draw(ctx) {
    if (this.invulnerable > 0 && Math.floor(Date.now() / 150) % 2 === 0) return;
    
    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.rotate(this.angle);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.stroke();
    
    if (this.thrusting) {
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-15, 5);
      ctx.lineTo(-25, 0);
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.stroke();
    }
    
    ctx.restore();
  }
}
