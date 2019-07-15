class Pathwalker {
  constructor() {
    this.active = false;
    this.path;
    this.idx;
  }

  startWalk(path, clr) {
    this.path = [];
    for (let a = 0; a < path.length; a++) {
      this.path.push({
        x: path[a].x,
        y: path[a].y,
        c: 0,
        a: 0
      });
    }
    this.path[0].c = clr;
    this.path[0].a = 1;
    this.idx = 0;
    this.active = true;
  }

  update(dt) {
    if (this.idx < this.path.length - 1) {
      this.path[this.idx + 1].c = this.path[this.idx].c;
      this.path[this.idx + 1].a = 1;
      this.idx++;
    }

    let p = false;
    for (let a = 0; a < this.path.length - 1; a++) {
      const cell = this.path[a];
      if (cell.a > 0) {
        p = true;
        if ((cell.a -= dt * 5) < 0) {
          cell.a = 0;
        }
      }
    }


    this.active = p;
    return p;
  }

  draw(ctx) {
    for (let a = 0; a < this.path.length; a++) {
      const cell = this.path[a];
      if (cell.a > 0) {
        ctx.globalAlpha = cell.a;
        ctx.fillStyle = COLORTABLE[cell.c];
        ctx.fillRect(cell.x * BLOCK + 3, cell.y * BLOCK + 3, BLOCK - 6, BLOCK - 6);
      }
    }
  }
}