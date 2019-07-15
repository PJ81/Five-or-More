class State {
    constructor() {}
    update(dt) {}
    draw(ctx) {}
    input(i) {}
    start() {}
    stats(ctx) {}
}

class Game {
    constructor() {
        this.canvas = document.getElementById("main");
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.ctx = this.canvas.getContext('2d');

        this.game = new FoM();
        this.gameOver = new GameOver();

        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1 / 60;

        this.loop = (time) => {
            this.accumulator += (time - this.lastTime) / 1000;
            while (this.accumulator > this.deltaTime) {
                this.accumulator -= this.deltaTime;
                this.state.update(Math.min(this.deltaTime, .5));
            }
            this.lastTime = time;

            this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
            this.state.draw(this.ctx);
            requestAnimationFrame(this.loop);
        }

        this.canvas.addEventListener("mousedown", (e) => {
            const x = e.clientX - e.currentTarget.offsetLeft,
                y = e.clientY - e.currentTarget.offsetTop;
            this.state.input(x, y);
        });
        this.canvas.addEventListener("touchstart", (e) => {
            const x = e.touches[0].screenX - e.currentTarget.offsetLeft,
                y = e.touches[0].screenY - e.currentTarget.offsetTop;
            this.state.input(x, y);
        });

        this.state = this.game;
        this.state.start();

        window.addEventListener("stateChange", (e) => {
            switch (e.detail.state) {
                case GAME:
                    this.state = this.game;
                    break;
                case MENU:
                    //this.state = this.menu;
                    break;
                case GAMEOVER:
                    this.state = this.gameOver;
                    break;
            }
            this.state.start(e.detail);
        });

        this.loop(0);
    }
}