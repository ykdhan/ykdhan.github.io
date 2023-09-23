import $ from 'jquery';

const ykSticky = function(selector, options) {
    let el;
    let $el;
    let $inner;

    let visible;
    let wrapTop;
    let wrapH;
    let innerH;
    let resizeTimeout;

    const defaultOptions = {
        align: 'center',
        on: function () {},
        off: function () {},
        scroll: function () {},
        resize: function () {},
    }

    const init = function() {
        el = document.querySelector(selector);
        $el = $(el);
        if (!$el.length) return false;

        $inner = $el.find('.sticky-inner');

        options = Object.assign(defaultOptions, options);
        
        const io = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    on();
                } else {
                    off();
                }
            });
        });
        io.observe(el);

        YK.$pageWrap.on('scroll', function() {
            visible && scroll();
        });

        $(window).on('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                resize();
            }, 10);
        });

        resize();
        scroll();
    };

    const on = function() {
        scroll();
        options.on();
        visible = true;
    };

    const off = function() {
        scroll();
        options.off();
        visible = false;
    };

    const scroll = function() {
        const percent = (YK.scrollTop - wrapTop) / (wrapH - YK.height);
        options.scroll(percent);
    };

    const resize = function() {
        wrapTop = 0;
        wrapH = $el.height();
        innerH = $inner.height();
        options.resize();
        scroll();
    };
    
    init();
}

export { ykSticky };