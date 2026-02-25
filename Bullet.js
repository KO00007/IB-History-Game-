class Bullet extends GameObject {
  constructor(x, y, angle) {
    super(x - 2, y - 2, 4, 4);
    this.name = 'Bullet';
    this.speed = 800;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.life = 1.0;
  }

  update(dt, canvas) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    
    if (this.x < 0) this.x += canvas.width;
    if (this.x > canvas.width) this.x -= canvas.width;
    if (this.y < 0) this.y += canvas.height;
    if (this.y > canvas.height) this.y -= canvas.height;
  }

  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
