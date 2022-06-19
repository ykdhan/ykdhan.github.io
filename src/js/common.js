import $ from 'jquery'
import gsap from 'gsap'
import { ykThree } from './three.js'
import { ykP5 } from './p5.js'

let darkmode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
// if (darkmode) $('html').addClass('dark')
// window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
//     YK.darkMode()
// })

window.YK = {
    width: $(window).width(),
    height: $(window).height(),

    load: function() {
        this.darkmode = darkmode
        
        gsap.to('.loading', {
            opacity: 0,
            duration: 0.5,
            delay: 0.5,
            onComplete: () => {
                $('.loading').addClass('off')
            }
        })

        ykP5.load()
        // ykThree.load()
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