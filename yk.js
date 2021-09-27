const prop = {
    number: window.innerWidth < 767 ? 55 : 80,
    size: 5,
    speed: window.innerWidth < 767 ? 0.1 : 0.2,
    color: 255,
    line: window.innerWidth < 767 ? 40 : 50,
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
        $('main').css({ width: prop.w, height: prop.h })
        $('.title').css('transform', 'translate(-50%, calc(-50% - ' + prop.h / 1.5 + 'px))')
        $('.github').css('transform', 'translate(-50%, calc(-50% + ' + prop.h / 1.5 + 'px))')
        p5.noStroke()
        p5.rectMode(p5.CENTER)

        for (let i = 0; i < blocks.length; i ++) {
            blocks[i] = new Block(i, i)
        }
	}

	p5.draw = () => {
        !$('html').hasClass('chain') && $('main canvas').length && $('html').addClass('chain')
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

                    p5.push()
                    p5.stroke(prop.color);
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
        console.log('resize')
        prop.number = window.innerWidth < 767 ? 55 : 80
        prop.speed = window.innerWidth < 767 ? 0.1 : 0.2
        prop.line = window.innerWidth < 767 ? 40 : 50
        prop.w = window.innerWidth < 767 ? 250 : 440
        prop.h = window.innerWidth < 767 ? 250 : 440

        p5.resizeCanvas(prop.w * 1.2, prop.h * 1.2)
        $('main').css({ width: prop.w, height: prop.h })
        $('.title').css('transform', 'translate(-50%, calc(-50% - ' + prop.h / 1.5 + 'px))')
        $('.github').css('transform', 'translate(-50%, calc(-50% + ' + prop.h / 1.5 + 'px))')
    }
}

new p5(chain)