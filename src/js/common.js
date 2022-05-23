let darkmode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
// if (darkmode) $('html').addClass('dark')
// window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
//     YK.darkMode()
// })

window.YK = {
    width: $(window).width(),
    height: $(window).height(),

    load: function() {
        gsap.to('.loading', {
            opacity: 0,
            duration: 0.5,
            delay: 0.5,
            onComplete: () => {
                $('.loading').addClass('off')
            }
        })

        const prop = {
            color: (darkmode) ? 50 : 220,
        }

        const initProp = () => {
            prop.number = Math.round(YK.width / 10)
            prop.size = YK.width < 767 ? 4 : 5
            prop.speed = YK.width < 767 ? 0.08 : 0.2
            prop.line = YK.width < 767 ? Math.round(YK.width / 3) : Math.round(YK.width / 14)
        }

        initProp()
    
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

                prop.color = (darkmode) ? 50 : 220
                
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

                        if (index != index2 && dist < prop.line) {
                            const opacity = 1 - (dist / prop.line)
                            p5.push()
                            p5.stroke(`rgba(${prop.color},${prop.color},${prop.color},${opacity})`)
                            p5.strokeWeight(YK.width < 767 ? 0.5 : 1)
                            p5.line(block.x, block.y, block2.x, block2.y)
                            p5.pop()
                        }
                    })
                        
                    p5.push()
                    p5.fill(prop.color)
                    p5.rect(block.x, block.y, block.size, block.size)
                    p5.pop()
                })
            }
    
            p5.windowResized = () => {
                initProp()
    
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
    },

    darkMode: function() {
        darkmode = !darkmode
        if (darkmode) $('html').addClass('dark')
        else $('html').removeClass('dark')
    }
};


$(window)
    .on('load', function() {
        YK.load()
        YK.resize()
    })
    .on('resize', function() {
        YK.resize()
    })
    .on('scroll', function() {
        YK.scroll()
    });