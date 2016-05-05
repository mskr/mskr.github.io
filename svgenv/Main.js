$(document).ready(function() {

    Scroller.init();

    Underground.init();

    masterTL = new TimelineMax().add([

        Sky.animate(),

        Land.animate(),

        Sky.generateClouds(15, 0.01)

    ]);

    masterTL.eventCallback("onUpdate", function() {
        clock = masterTL.time()%DAY_NIGHT_CYCLE;
        $("#status .clock").text(parseInt(clock) +"/"+ DAY_NIGHT_CYCLE);
    });

    masterTL.seek(DAY_NIGHT_CYCLE/8);

});





/**
* Creates a shadow for svgEl and adapts it to the clock.
* @param timeline is used to pass an animation that the shadow should adopt
* @param opc is the opacity of the shadow which defaults to 0.5
*/
function shadow(svgEl, timeline, opc) {
    var shad = svgEl.use();
    shad.attr({
        filter: Snap("#shadowHelper"), 
        mask: "url(#fadeMask)", 
        opacity: opc?opc:0.5, 
        class: "shadow"
    });
    var shadWrapper = Snap("#mainSvg").g(shad);
    shadWrapper.attr({class: "shadowWrapper"});
    svgEl.before(shadWrapper);
    TweenMax.set(shad.node, {scaleY: 0, skewX: 90, transformOrigin: "0 100%", y: -1});
    masterTL.add(new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
    .to(shad.node, 0.5*0.5*DAY_NIGHT_CYCLE, {
        scaleY: -1,
        skewX: 0,
        ease: Linear.easeNone
    })
    .to(shad.node, 0.5*0.5*DAY_NIGHT_CYCLE, {
        scaleY: 0,
        skewX: -90,
        ease: Linear.easeNone
    })
    .progress((clock%(DAY_NIGHT_CYCLE/2))/(DAY_NIGHT_CYCLE/2)), 0);
    if(timeline) {
        for(var i = 0; i < timeline.getChildren().length; i++) {
            var child = timeline.getChildren()[i];
            var arr = [shadWrapper.node];
            if(child.target) arr.push(child.target);
            child._targets = arr;
        }
    }
    return shadWrapper;
}


Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
    Element.prototype.shadow = function(timeline, opacity) {
        return shadow(this, timeline, opacity);
    }
    global.win.Snap.Set.prototype.nodes = function() {
        var arr = [];
        this.forEach(function(el) {
            arr.push(el.node);
        });
        return arr;
    }
});



function getSvgWidth() {
    return $("#mainSvg").width();
}

function getSvgViewBox() {
    var vb = $("#mainSvg")[0].getAttribute("viewBox");
    var vbArr = vb.split(" ");
    return {
        originX: parseInt(vbArr[0]),
        originY: parseInt(vbArr[1]),
        width: parseInt(vbArr[2]),
        height: parseInt(vbArr[3])
    }
}

function getWindowWidthInSvgCoords() {
    var svgScale = $(window).height() / getSvgViewBox().height;
    return Math.round($(window).width() / svgScale);
}







function ParallelLoop(bodyFunc, delay, startImmediately) {
    this.bodyFunc = bodyFunc;
    this.delay = delay;
    this.isFirstRun = true;
    this.startImmediately = startImmediately;
    this.timerID = -1;
    this.run = function() {
        if(this.isFirstRun && this.startImmediately) 
            bodyFunc();
        var that = this;
        this.timerID = setTimeout(function() {
            that.bodyFunc();
            that.isFirstRun = false;
            that.run();
        }, delay);
    }
    this.stop = function() {
        clearTimeout(this.timerID);
    }
}


function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function bringInRange(min, max, val) {
    if(min > max) {
        var tmp = min;
        min = max;
        max = tmp;
    }
    if(val < min) return min;
    else if(val > max) return max;
    else return val;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Point(x,y) {
  this.x = x;
  this.y = y;
}

// creates the prototype chain "... -> Class -> Subclass -> new f()"
function extend(Class, Subclass) {
	if(Class instanceof Function) Class = new Class();
	Object.setPrototypeOf(Subclass, Class);
	var f = Subclass._; // use _: function(){} as constructor
	f.prototype = Subclass;
	return f;
}