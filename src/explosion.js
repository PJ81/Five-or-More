class Explosion {
  constructor() {
    this.active = false;
    this.parts = [];
  }

  update(dt) {
    for (let z = this.parts.length - 1; z > -1; z--) {
      const cell = this.parts[z];
      cell.a -= dt * .9;
      if (cell.a < 0) {
        this.parts.splice(z, 1);
      } else {
        cell.x += cell.dx * dt * 30;
        cell.y += cell.dy * dt * 30;
      }
    }
    this.active = this.parts.length > 0;
    return this.active;
  }

  draw(ctx) {
    for (let z = this.parts.length - 1; z > -1; z--) {
      const cell = this.parts[z];
      ctx.globalAlpha = cell.a;
      ctx.fillStyle = COLORTABLE[cell.c];
      ctx.fillRect(cell.x, cell.y, 8, 8);
    }
  }

  startExplosion(x, y, c) {
    x *= BLOCK;
    x += BLOCK >> 1;
    y *= BLOCK;
    y += BLOCK >> 1;
    this.active = true;
    for (let a = 0; a < 9; a++) {
      const ang = Math.random() * (Math.PI * 2);
      this.parts.push({
        x,
        y,
        c,
        a: 1,
        dx: Math.cos(ang) * (Math.random() * 4 + 1),
        dy: Math.sin(ang) * (Math.random() * 4 + 1)
      });
    }
  }
}