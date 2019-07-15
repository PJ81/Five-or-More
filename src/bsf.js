class Node {
    constructor(wall = false, visited = false) {
        this.wall = wall;
        this.visited = visited;
        this.parent = {
            x: -1,
            y: -1
        };
    }
}
class BSF {
    constructor() {
        this.q;
        this.map;
    }

    findPath(s, e, map) {
        const start = {
            x: s % TXCOUNT,
            y: Math.floor(s / TXCOUNT)
        };
        const end = {
            x: e % TXCOUNT,
            y: Math.floor(e / TXCOUNT)
        };
        this.q = [];
        this.map = [];
        for (let i = 0; i < map.length; i++)
            this.map.push(new Node(map[i] > 0));

        this.q.push(start);
        while (this.q.length) {
            const pt = this.q.splice(0, 1)[0];
            this.pushNeighbours(pt);
        }
        this.q.push(end);

        if (!this.makePath(this.map[end.x + TXCOUNT * end.y].parent, start)) return null;
        this.q.push(start);
        this.q.reverse();
        return this.q;
    }

    makePath(p, e) {
        if (p == null) return false;
        if (e.x === p.x && e.y === p.y) return true;
        this.q.push(p);
        const z = this.map[p.x + TXCOUNT * p.y];
        if (z) return this.makePath(z.parent, e);
        else return null;
    }

    pushNeighbours(c) {
        let n;
        if (this.isSafe(c.x - 1, c.y)) {
            n = this.map[c.x - 1 + TXCOUNT * c.y];
            if (!n.visited && !n.wall) {
                n.visited = true;
                n.parent = {
                    x: c.x,
                    y: c.y
                };
                this.q.push({
                    x: c.x - 1,
                    y: c.y
                });
            }
        }

        if (this.isSafe(c.x + 1, c.y)) {
            n = this.map[c.x + 1 + TXCOUNT * c.y];
            if (!n.visited && !n.wall) {
                n.visited = true;
                n.parent = {
                    x: c.x,
                    y: c.y
                };
                this.q.push({
                    x: c.x + 1,
                    y: c.y
                });
            }
        }

        if (this.isSafe(c.x, c.y - 1)) {
            n = this.map[c.x + TXCOUNT * (c.y - 1)];
            if (!n.visited && !n.wall) {
                n.parent = {
                    x: c.x,
                    y: c.y
                };
                n.visited = true;
                this.q.push({
                    x: c.x,
                    y: c.y - 1
                });
            }
        }

        if (this.isSafe(c.x, c.y + 1)) {
            n = this.map[c.x + TXCOUNT * (c.y + 1)];
            if (!n.visited && !n.wall) {
                n.parent = {
                    x: c.x,
                    y: c.y
                };
                n.visited = true;
                this.q.push({
                    x: c.x,
                    y: c.y + 1
                });
            }
        }
    }

    isSafe(x, y) {
        return (x > -1 && y > -1 && x < TXCOUNT && y < TYCOUNT);
    }
}