$(function () {
    $.fn.layout = function () {
        $(this).each(function (index, el) {
            var $dom = $(el);

            var top = 0;
            var bottom = 0;
            $('>.g-t', $dom).each(function () { top += $(this).outerHeight() });
            $('>.g-b', $dom).each(function () { bottom += $(this).outerHeight() });
            $('>.g-m', $dom).css({ top: top, bottom: bottom });

            var left = 0;
            var right = 0;
            var mn_left = 0;
            var mn_right = 0;
            var gl_length = $('>.g-l', $dom).length;
            $('>.g-m>.g-l', $dom).each(function (i) {
                var w = $(this).outerWidth();
                left += w;
                if (i == gl_length - 1) {
                    $(this).css({ marginLeft: 0, marginRight: -left });
                }
                else {
                    mn_left += w;
                    $(this).css({ marginLeft: 0, marginRight: 0 });
                }
            });
            var gr_length = $('>.g-l', $dom).length;
            $('>.g-m>.g-r', $dom).each(function (i) {
                var w = $(this).outerWidth();
                right += w;
                if (i == gr_length - 1) {
                    $(this).css({ marginLeft: -w, marginRight: 0 });
                }
                else {
                    mn_right += w;
                    $(this).css({ marginLeft: 0, marginRight: 0 });
                }

            });
            $('>.g-m>.g-mn>.g-mnc', $dom).css({ marginLeft: left, marginRight: right });
            $('>.g-m>.g-mn', $dom).css({ marginLeft: -mn_left, marginRight: -mn_right });

            $('.g-panel', $dom).not('.g-panel .g-panel', $dom).each(function () {
                var h = $('>.g-title', $(this)).outerHeight();
                $('>.g-content', $(this)).css({ top: h });
            })
        });
    };
    $('.g-layout').layout();
});