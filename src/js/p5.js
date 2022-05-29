import p5 from 'p5'

class Block {
    constructor() {
        this.x = Math.floor(Math.random() * YK.width)
        this.y = Math.floor(Math.random() * YK.height)
        this.dx = (ykP5.speed + Math.random()) * (Math.random() < 0.5 ? -1 : 1)
        this.dy = (ykP5.speed + Math.random()) * (Math.random() < 0.5 ? -1 : 1)
        this.size = ykP5.size
        this.color = ykP5.color
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

export const ykP5 = {
    prop: function() {
        this.color = (YK.darkmode) ? 50 : 220
        this.number = Math.round(YK.width / 10)
        this.size = YK.width < 767 ? 4 : 5
        this.speed = YK.width < 767 ? 0.08 : 0.2
        this.line = YK.width < 767 ? Math.round(YK.width / 3) : Math.round(YK.width / 14)
    },

    load: function() {
        const _this = this
        _this.prop()
    
        const chain = (p5) => {
            var blocks = new Array(_this.number)
    
            p5.setup = () => {
                p5.createCanvas(YK.width * 1.2, YK.height * 1.2).parent('p5')
                p5.noStroke()
                p5.rectMode(p5.CENTER)
    
                for (let i = 0; i < blocks.length; i ++) {
                    blocks[i] = new Block()
                }
            }
    
            p5.draw = () => {
                p5.clear()

                _this.color = (YK.darkmode) ? 50 : 220
                
                blocks.forEach((block, index) => {
                    if (block.x + block.dx > YK.width * 1.2 || block.x + block.dx < 0) {
                        block.changeDirX();
                    }
                    if (block.y + block.dy > YK.height * 1.2 || block.y + block.dy < 0) {
                        block.changeDirY();
                    }
    
                    block.move()
    
                    blocks.forEach((block2, index2) => {
                        const dist = p5.dist(block.x, block.y, block2.x, block2.y)

                        if (index != index2 && dist < _this.line) {
                            const opacity = 1 - (dist / _this.line)
                            p5.push()
                            p5.stroke(`rgba(${_this.color},${_this.color},${_this.color},${opacity})`)
                            p5.strokeWeight(YK.width < 767 ? 0.5 : 1)
                            p5.line(block.x, block.y, block2.x, block2.y)
                            p5.pop()
                        }
                    })
                        
                    p5.push()
                    p5.fill(_this.color)
                    p5.rect(block.x, block.y, block.size, block.size)
                    p5.pop()
                })
            }
    
            p5.windowResized = () => {
                _this.prop()
    
                p5.resizeCanvas(YK.width * 1.2, YK.height * 1.2)
    
                blocks = new Array(_this.number)
                
                for (let i = 0; i < blocks.length; i ++) {
                    blocks[i] = new Block()
                }
            }
        }
    
        new p5(chain)
    },
}