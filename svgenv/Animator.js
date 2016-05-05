/**
* @author: Marius Kircher
* This function can create a smooth linear transition (25 fps) 
* on a HTML or SVG element's numeric attribute.
* Color transitions are not supported.
* Animation starts after calling animate().
* Animation can be stopped by calling stop().
* This function internally uses jQuery.attr().
* @param elem : jQuery object
* @param attr : String
* @param dur : Number (duration of animation in seconds)
* @param to : Number (value of given attribute to animate to)
* @param repeatDelay : Number (delay after each repetition in seconds,
* negative values mean no repetition,
* positive values mean infinite repetition,
* undefined means zero delay)
* @param yoyo : Boolean (makes animation go back and forth in each repetition,
* is set to true if not given)
*/
function Animator(elem, attr, dur, to, repeatDelay, yoyo) {
    this.elem = elem;
    this.to = to;
    this.dur = dur;
    this.steps = this.dur*1000/40;
    this.cnt = 0;
    this.from = elem.attr(attr);
    if(!this.from) this.from = 0; //if given attr did not yet exist assume it zero
    if(isNaN(this.to)) { //if given value is not a number assume it a color hex string
        var fromRGB = hexToRgb(this.from);
        this.elem.attr(attr, "rgb("+fromRGB.r+","+fromRGB.g+","+fromRGB.b+")");
        var toRGB = hexToRgb(this.to);
        var rDiff = fromRGB.r - toRGB.r;
        var gDiff = fromRGB.g - toRGB.g;
        var bDiff = fromRGB.b - toRGB.b;
        var timeConst = (40/(this.dur*1000));
        //TODO rgb(...) kann keine Kommazahlen enthalten, aber Runden macht die Animation viel zu schnell. 
        // => Framerate muss fuer jede Farbkomponente separat passend eingestellt werden, 
        //     d.h. auch 3 Timer laufen lassen, die eine Update-Funktion aufrufen, welche dann den rgb(...) Wert schreibt
        this.rIncr = timeConst*rDiff; //0.116
        this.gIncr = timeConst*gDiff; // 0.108
        this.bIncr = timeConst*bDiff; // 0.044
        this.animateColor = function() {
            var that = this;
            this.timerIDanimate = setTimeout(function() {
                var s = that.elem.attr(attr);
                var currRgb = s.substring(4,s.length-1).split(",");
                var newRgb = "rgb("+(bringInRange(fromRGB.r,toRGB.r,currRgb[0]-that.rIncr) 
                    +","+bringInRange(fromRGB.g,toRGB.g,currRgb[1]-that.gIncr)
                    +","+bringInRange(fromRGB.b,toRGB.b,currRgb[2]-that.bIncr+")")
                );
                that.elem.attr(attr, newRgb);
                console.log(that.rIncr);
                if(that.cnt++ < that.steps) that.animateColor();
                else that.repeatHandler();
            }, 40);
        }
    }
    else {
        this.diff = this.from-this.to;
        this.incr = (40/(this.dur*1000))*this.diff;
        this.animate = function() {
            var that = this;
            this.timerIDanimate = setTimeout(function() {
                var currVal = that.elem.attr(attr);
                that.elem.attr(attr, currVal - that.incr);
                if(that.cnt++ < that.steps) that.animate();
                else that.repeatHandler();
            }, 40);
        }
    }
    this.repeatDelay = repeatDelay ? repeatDelay : 0;
    this.yoyo = (yoyo == undefined) ? true : yoyo;
    this.repeatHandler = function() {
        if(this.repeatDelay < 0) return;
        if(isNaN(this.to)) {
            if(this.yoyo) {
                this.rIncr = -this.rIncr;
                this.gIncr = -this.gIncr;
                this.bIncr = -this.bIncr;
            }
        }
        else if(this.yoyo) this.incr = -this.incr;
        var that = this;
        this.timerIDrepeat = setTimeout(function() {
            that.cnt = 0;
            (isNaN(that.to)) ? that.animateColor() : that.animate();
        }, this.dur + this.repeatDelay*1000)
    }
    this.timerIDanimate = -1;
    this.timerIDrepeat = -1;
    this.stop = function() {
        clearTimeout(timerIDanimate);
        clearTimeout(timerIDrepeat);
    }
}