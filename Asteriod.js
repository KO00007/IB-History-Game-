class Asteroid extends GameObject {
  constructor(x, y, size) {
    const radius = size * 25;
    super(x - radius, y - radius, radius * 2, radius * 2);
    this.name = 'Asteroid';
    this.size = size;
    this.radius = radius;
    this.cx = x;
    this.cy = y;
    
    const speed = (4 - size) * 50;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.points = [];
    const numPoints = 8 + Math.floor(Math.random() * 5);
    for(let i = 0; i < numPoints; i++) {
      const a = (i / numPoints) * Math.PI * 2;
      const r = this.radius * (0.6 + Math.random() * 0.4);
      this.points.push({x: Math.cos(a) * r, y: Math.sin(a) * r});
    }
  }

  update(dt, canvas) {
    this.cx += this.vx * dt;
    this.cy += this.vy * dt;
    
    if (this.cx < 0) this.cx += canvas.width;
    if (this.cx > canvas.width) this.cx -= canvas.width;
    if (this.cy < 0) this.cy += canvas.height;
    if (this.cy > canvas.height) this.cy -= canvas.height;
    
    this.x = this.cx - this.radius;
    this.y = this.cy - this.radius;
  }

  draw(ctx) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i = 0; i < this.points.length; i++) {
      const px = this.cx + this.points[i].x;
      const py = this.cy + this.points[i].y;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
}
