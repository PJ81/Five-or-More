class FoM extends State {
    constructor() {
        super();
        this.next = document.getElementById("next");
        this.next.width = WIDTH;
        this.next.height = 1.5 * BLOCK;
        this.ctxN = this.next.getContext('2d');

        this.hud = document.getElementById("hud");
        this.hud.width = WIDTH;
        this.hud.height = BLOCK;
        this.ctxH = this.hud.getContext('2d');

        this.score;
        this.nextBlocks;
        this.board;
        this.selected;

        this.bsf = new BSF();
        this.pathwalker = new Pathwalker();
        this.explosion = new Explosion();
    }

    searchLines(p) {
        const c = this.board[p.x + TXCOUNT * p.y],
            v1 = this.countSqrs(this.findLast(p.x, p.y, -1, 0, c), 1, 0, c),
            v2 = this.countSqrs(this.findLast(p.x, p.y, -1, -1, c), 1, 1, c),
            v3 = this.countSqrs(this.findLast(p.x, p.y, 0, -1, c), 0, 1, c),
            v4 = this.countSqrs(this.findLast(p.x, p.y, 1, -1, c), -1, 1, c);

        let sum = [],
            i;

        if (v1.length >= MATCHCOLORS)
            for (i = 0; i < v1.length; i++) sum.push(v1[i]);
        if (v2.length >= MATCHCOLORS)
            for (i = 0; i < v2.length; i++) sum.push(v2[i]);
        if (v3.length >= MATCHCOLORS)
            for (i = 0; i < v3.length; i++) sum.push(v3[i]);
        if (v4.length >= MATCHCOLORS)
            for (i = 0; i < v4.length; i++) sum.push(v4[i]);

        return sum;
    }

    isSafe(xx, yy, cl) {
        return (xx > -1 && yy > -1 && xx < TXCOUNT && yy < TYCOUNT && this.board[xx + TXCOUNT * yy] == cl);
    }

    findLast(xx, yy, dx, dy, cl) {
        while (this.isSafe(xx + dx, yy + dy, cl)) {
            xx += dx;
            yy += dy;
        }
        return {
            x: xx,
            y: yy
        };
    }

    countSqrs(pt, dx, dy, cl) {
        var v = [];
        while (1 == 1) {
            v.push(pt);
            if (this.isSafe(pt.x + dx, pt.y + dy, cl)) {
                pt = {
                    x: pt.x + dx,
                    y: pt.y + dy
                };
            } else {
                break;
            }
        }
        return v;
    }

    update(dt) {
        if (this.pathwalker.active) {
            if (!this.pathwalker.update(dt)) {
                this.board[this.selected.goal] = this.selected.color;
                const exp = this.searchLines({
                    x: this.selected.goal % TXCOUNT,
                    y: Math.floor(this.selected.goal / TXCOUNT)
                });

                if (exp.length > 0) {
                    this.score += Math.floor((45 * Math.log(0.25 * exp.length)));
                    exp.forEach(elm => {
                        this.board[elm.x + elm.y * TXCOUNT] = 0;
                        this.explosion.startExplosion(elm.x, elm.y, this.selected.color);
                    });
                } else {
                    this.addToBoard();
                }

                this.selected = null;
            }
        }
        if (this.explosion.active) {
            this.explosion.update(dt);
        }
    }

    draw(ctx) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = BLOCK; y < HEIGHT; y += BLOCK) {
            ctx.moveTo(0, y);
            ctx.lineTo(WIDTH, y);
        }

        for (let x = BLOCK; x < WIDTH; x += BLOCK) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, HEIGHT);
        }
        ctx.stroke();

        this.ctxN.clearRect(0, 0, this.next.width, this.next.height);
        this.ctxH.clearRect(0, 0, this.hud.width, this.hud.height);
        this.ctxN.fillStyle = "#333";
        this.ctxN.textAlign = "left";
        this.ctxN.font = "40px 'Open Sans Condensed'";
        this.ctxN.fillText("NEXT:", 16, 45);

        let a = 100;
        this.ctxN.beginPath();
        this.ctxN.lineWidth = 2;
        for (let x = 0; x < this.nextBlocks.length; x++) {
            this.ctxN.fillStyle = COLORTABLE[this.nextBlocks[x]];
            this.ctxN.fillRect(a + x * BLOCK + 8 * x, 10, BLOCK, BLOCK);
            this.ctxN.rect(a + x * BLOCK + 8 * x, 10, BLOCK, BLOCK);
            this.ctxN.stroke();
        }

        this.ctxH.fillStyle = "#333";
        this.ctxH.textAlign = "left";
        this.ctxH.font = "30px 'Open Sans Condensed'";
        this.ctxH.fillText(`SCORE: ${this.score}`, 18, 31);

        for (let x = 0; x < this.board.length; x++) {
            if (this.board[x] > 0) {
                ctx.fillStyle = COLORTABLE[this.board[x]];
                const a = (x % TXCOUNT),
                    b = Math.floor(x / TXCOUNT);

                ctx.fillRect(a * BLOCK + 3, b * BLOCK + 3, BLOCK - 6, BLOCK - 6);

                if (this.selected && this.selected.idx === x) {
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.rect(a * BLOCK + 3, b * BLOCK + 3, BLOCK - 6, BLOCK - 6);
                    ctx.stroke();
                }
            }
        }

        if (this.pathwalker.active) {
            this.pathwalker.draw(ctx);
        }

        if (this.explosion.active) {
            this.explosion.draw(ctx);
        }
    }

    input(x, y) {
        if (this.pathwalker.active) return;
        x = Math.floor(x / BLOCK);
        y = Math.floor(y / BLOCK);
        if (x < 0 || x >= TXCOUNT || y < 0 || y >= TYCOUNT) return;

        const clr = this.board[x + y * TXCOUNT];
        if (this.selected === null && clr === 0) return;

        if (this.selected !== null) {
            if (clr === 0) {
                this.selected.goal = x + y * TXCOUNT;
                const path = this.bsf.findPath(this.selected.idx, this.selected.goal, this.board);
                if (path !== null) {
                    this.board[this.selected.idx] = 0;
                    this.pathwalker.startWalk(path, this.selected.color);
                } else {
                    this.selected = null;
                }
            } else if (this.selected.idx === x + y * TXCOUNT) {
                this.selected = null;
            } else {
                this.selected = {
                    idx: x + y * TXCOUNT,
                    goal: 0,
                    color: clr,
                };
            }
        } else {
            this.selected = {
                idx: x + y * TXCOUNT,
                goal: 0,
                color: clr
            };
        }
    }

    generateNext() {
        this.nextBlocks = [];
        for (let n = 0; n < ADD; n++) {
            this.nextBlocks.push(Math.floor(Math.random() * MATCHCOLORS) + 1);
        }
    }

    addToBoard() {
        const freeSpots = []
        for (let x = 0; x < this.board.length; x++) {
            if (this.board[x] === 0) {
                freeSpots.push(x);
            }
        }

        if (freeSpots.length < ADD) {
            window.dispatchEvent(new CustomEvent("stateChange", {
                detail: {
                    state: GAMEOVER,
                    points: this.score
                }
            }));
            return;
        }

        while (this.nextBlocks.length) {
            const z = this.nextBlocks.splice(Math.floor(Math.random() * this.nextBlocks.length), 1)[0];
            const idx = freeSpots.splice(Math.floor(Math.random() * freeSpots.length), 1)[0];
            this.board[idx] = z;
        }

        this.generateNext();

        let cnt = 0;
        for (let x = 0; x < this.board.length; x++) {
            if (this.board[x] !== 0) {
                cnt++;
            }
        }
        if (cnt === TXCOUNT * TYCOUNT) {
            window.dispatchEvent(new CustomEvent("stateChange", {
                detail: {
                    state: GAMEOVER,
                    points: this.score
                }
            }));
        }
    }

    start() {
        this.board = [];
        for (let y = 0; y < TXCOUNT * TYCOUNT; y++) {
            this.board.push(0);
        }
        this.generateNext();
        this.addToBoard();

        this.score = 0;
        this.selected = null;
    }
}