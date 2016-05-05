var Scroller = {

    init: function() {
        var svgViewBox = getSvgViewBox();
        var svgScale = $(window).height() / svgViewBox.height;
        $(window).resize(function() {
            // mainSvg height correct about 185ms after document loaded
            // allows us to compute svgScale more accurately than by using window height
            svgScale = $("#mainSvg").height() / svgViewBox.height;
        })
        var parallaxElems = $(".parallax");
        var nearestLayer = 0;
        for(var i = 0; i < parallaxElems.length; i++) {
            var l = $(parallaxElems[i]).data("layer");
            if(l > nearestLayer) nearestLayer = l;
        }
        $("#scroller").scroll(function() {
            svgScale = $("#mainSvg").height() / svgViewBox.height;
            var svgScrollLeft = $(this).scrollLeft() / svgScale;
            for(var i = 0; i < parallaxElems.length; i++) {
                var l = $(parallaxElems[i]).data("layer");
                if(l != nearestLayer) Snap(parallaxElems[i]).transform("translate("+ 1/(l+1)*svgScrollLeft +",0)");
            }
        });
    }

}