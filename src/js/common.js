import $ from 'jquery';
import gsap from 'gsap';
import { setStyleProperty, getPercent } from './_functions';
import { ykSticky } from './_sticky.js';

let darkmode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
// if (darkmode) $('html').addClass('dark')
// window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
//     YK.darkMode()
// })

setStyleProperty('vh', $(window).height() + 'px');

window.YK = {
    width: $(window).width(),
    height: $(window).height(),
    scrollTop: 0,

    load: function() {
        this.darkmode = darkmode;
        this.$pageWrap = $('.page-wrap');
        
        // ykP5.load()

        this.$pageWrap.on('scroll', function() {
            YK.scroll();
        });

        let packageSize = {};
        $('.block').on('click', function(e) {
            const $target = $(e.target).closest('.block');
            if ($target.hasClass('active')) $target.removeClass('active');
            else $target.closest('.block-list').find('.block').removeClass('active') && $target.addClass('active');
        })

        new ykSticky('.sticky-package', {
            scroll: function(per) {
                const closeIn = getPercent(per, 0, 0.5);
                const moveX = getPercent(per, 0.5, 0.5);
                const moveY = getPercent(per, 0.8, 0.2);

                $('.package-bg').css({
                    clip: `rect(${packageSize.height * closeIn}px, ${YK.width - packageSize.width * closeIn}px, ${YK.height - packageSize.height * closeIn}px, ${packageSize.width * closeIn}px)`
                });

                if (closeIn == 1) $('.package-bg').addClass('hide');
                else $('.package-bg').removeClass('hide');

                $('.package-title').css({
                    transform: `translateX(${-(packageSize.width) * moveX}px)`
                });
                $('.package-guide').css({
                    opacity: 0.5 - moveX / 2
                });
                $('.package-title span').css({
                    transform: `translateY(${(YK.width < 768 ? 20 : 30) * moveY}px)`
                });
            },
            resize: function() {
                const minus = YK.width < 768 ? 40 : 50;
                packageSize = {
                    width: YK.width / 2 - minus,
                    height: YK.height / 2 - minus
                };
            }
        });
        // ykThree.load()
    },

    scroll: function() {
        this.scrollTop = this.$pageWrap.scrollTop();
    },

    resize: function() {
        YK.width = $(window).width()
        YK.height = $(window).height()

        $('.yk-height').css({ height: YK.height })
        setStyleProperty('vh', YK.height + 'px');
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