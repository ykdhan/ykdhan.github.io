const prop = {
    number: window.innerWidth < 767 ? 50 : 80,
    size: window.innerWidth < 767 ? 3 : 5,
    speed: 0.2,
    color: 255,
    line: window.innerWidth < 767 ? 35 : 50,
    w: window.innerWidth < 767 ? 250 : 440,
    h: window.innerWidth < 767 ? 250 : 440,
}

const chain = (p5) => {

    class Block {
        constructor(x, y, dx, dy) {
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

    const blocks = new Array(prop.number)

	p5.setup = () => {
        p5.createCanvas(prop.w * 1.2, prop.h * 1.2)
        document.querySelector('main').style.width = prop.w + 'px'
        document.querySelector('main').style.height = prop.h + 'px'
        document.querySelector('.title').style.transform = 'translate(-50%, calc(-50% - ' + prop.h / 1.5 + 'px))'
        document.querySelector('.github').style.transform = 'translate(-50%, calc(-50% + ' + prop.h / 1.5 + 'px))'
        p5.noStroke()
        p5.rectMode(p5.CENTER)

        for (let i = 0; i < blocks.length; i ++) {
            blocks[i] = new Block(i, i)
        }
	}

	p5.draw = () => {
        p5.clear()
        
        blocks.forEach((block, index) => {
            if (block.x + block.dx > prop.w || block.x + block.dx < 0) {
                block.changeDirX();
            }
            if (block.y + block.dy > prop.h || block.y + block.dy < 0) {
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

                    p5.push()
                    p5.stroke(prop.color);
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
}

new p5(chain)