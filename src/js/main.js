window.YK = {
    width: $(window).width(),
    height: $(window).height(),

    load: function() {
        const prop = {
            number: YK.width < 767 ? 80 : 150,
            size: YK.width < 767 ? 5 : 7,
            speed: YK.width < 767 ? 0.1 : 0.2,
            color: 50,
            line: YK.width < 767 ? 55 : 80,
        }
    
        const chain = (p5) => {
            class Block {
                constructor() {
                    this.x = Math.floor(Math.random() * YK.width)
                    this.y = Math.floor(Math.random() * YK.height)
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
                p5.createCanvas(YK.width * 1.2, YK.height * 1.2).parent('p5')
                p5.noStroke()
                p5.rectMode(p5.CENTER)
    
                for (let i = 0; i < blocks.length; i ++) {
                    blocks[i] = new Block()
                }
            }
    
            p5.draw = () => {
                p5.clear()
                
                blocks.forEach((block, index) => {
                    if (block.x + block.dx > YK.width * 1.2 || block.x + block.dx < 0) {
                        block.changeDirX();
                    }
                    if (block.y + block.dy > YK.height * 1.2 || block.y + block.dy < 0) {
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
                            p5.strokeWeight(YK.width < 767 ? 0.5 : 1)
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
                prop.number = YK.width < 767 ? 90 : 150
                prop.size = YK.width < 767 ? 5 : 7
                prop.speed = YK.width < 767 ? 0.1 : 0.2
                prop.line = YK.width < 767 ? 50 : 70
    
                p5.resizeCanvas(YK.width * 1.2, YK.height * 1.2)
    
                blocks = new Array(prop.number)
                
                for (let i = 0; i < blocks.length; i ++) {
                    blocks[i] = new Block()
                }
            }
        }
    
        new p5(chain)

    },

    resize: function() {
        YK.width = $(window).width()
        YK.height = $(window).height()

        $('.yk-height').css({ height: YK.height })
    }
};


$(window)
    .on('load', function() {
        YK.load()
        YK.resize()

        $('.btn_project').on('click', () => {
            $('.page').animate({
                scrollTop: $('.section-project').height()
            }, 300)
        })
    })
    .on('resize', function() {
        YK.resize()
    })
    .on('scroll', function() {
        YK.scroll()
    });