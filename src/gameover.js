class GameOver extends State {
    constructor() {
        super();
    }

    update(dt) {

    }

    draw(ctx) {
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "84px 'Open Sans Condensed'";
        ctx.fillText("GAME OVER", WIDTH >> 1, HEIGHT * .32);
        ctx.font = "50px 'Open Sans Condensed'";
        ctx.fillText("CLICK TO PLAY AGAIN!", WIDTH >> 1, HEIGHT * .52);
    }

    input(i) {
        window.dispatchEvent(new CustomEvent("stateChange", {
            detail: {
                state: GAME,
                points: this.score
            }
        }));
    }

    start() {

    }
}