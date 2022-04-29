window.YK = {
    name: '한영광',
    birthdate: '951008',

    load: function() {
        $('#yk_name').text(this.name);
    }
};
window.YK.load();

const loadIntro = () => {
    const prop = {
        number: window.innerWidth < 767 ? 80 : 150,
        size: window.innerWidth < 767 ? 5 : 7,
        speed: window.innerWidth < 767 ? 0.1 : 0.2,
        color: 0,
        line: window.innerWidth < 767 ? 55 : 50,
        w: window.innerWidth,
        h: 600,
    }

    const chain = (p5) => {
        class Block {
            constructor() {
                this.x = Math.floor(Math.random() * prop.w)
                this.y = Math.floor(Math.random() * prop.h)
                this.dx = (prop.speed + Math.random()) * (Math.random() < 0.5 ? -1 : 1)
                this.dy = (prop.speed + Math.random()) * (Math.random() < 0.5 ? -1 : 1)
                this.size = prop.size
                this.color = prop.color
                this.rotate = Math.random()
            }

            move() {
                this.x += this.dx
                this.y += this.dy
            }

            changeDirX() {
                this.dx *= -1
            }

            changeDirY() {
                this.dy *= -1
            }
        }

        var blocks = new Array(prop.number)

        p5.setup = () => {
            p5.createCanvas(prop.w * 1.2, prop.h * 1.2)
            p5.noStroke()
            p5.rectMode(p5.CENTER)

            for (let i = 0; i < blocks.length; i ++) {
                blocks[i] = new Block()
            }
        }

        p5.draw = () => {
            p5.clear()

            blocks.forEach((block, index) => {
                if (block.x + block.dx > prop.w * 1.2 || block.x + block.dx < 0) {
                    block.changeDirX();
                }
                if (block.y + block.dy > prop.h * 1.2 || block.y + block.dy < 0) {
                    block.changeDirY();
                }

                block.move()

                blocks.forEach((block2, index2) => {
                    if (index != index2 &&
                        Math.abs(block.x - block2.x) < prop.line &&
                        Math.abs(block.y - block2.y) < prop.line) {
                        const l = {
                            from: { x: block.x, y: block.y },
                            to: { x: block2.x, y: block2.y },
                        }
                        let opacity = (Math.abs(block.x - block2.x) + Math.abs(block.y - block2.y)) / 2
                        opacity = opacity / prop.line
                        // console.log(opacity)
                        // opacity = 1

                        p5.push()
                        p5.stroke(`rgba(${prop.color},${prop.color},${prop.color},${opacity})`);
                        p5.strokeWeight(window.innerWidth < 767 ? 0.5 : 1)
                        p5.line(l.from.x, l.from.y, l.to.x, l.to.y);
                        p5.pop()
                    }
                })

                p5.push()
                p5.fill(prop.color)
                // p5.rotate(Math.PI * block.rotate + p5.frameCount)
                p5.rect(block.x, block.y, block.size, block.size)
                p5.pop()
            })
        }

        p5.windowResized = () => {
            prop.number = window.innerWidth < 767 ? 90 : 150
            prop.size = window.innerWidth < 767 ? 5 : 7
            prop.speed = window.innerWidth < 767 ? 0.1 : 0.2
            prop.line = window.innerWidth < 767 ? 50 : 70
            prop.w = window.innerWidth
            prop.h = window.innerHeight

            p5.resizeCanvas(prop.w * 1.2, prop.h * 1.2)

            blocks = new Array(prop.number)

            for (let i = 0; i < blocks.length; i ++) {
                blocks[i] = new Block()
            }
        }
    }
    // new p5(chain)
}
