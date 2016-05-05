var Sky = {

    animate: function() {
        var animSunMoon = this.animateSunMoon();
        $(window).resize(function() {
            var currPos = animSunMoon.progress()*animSunMoon.duration();
            animSunMoon.kill();
            animSunMoon = Sky.animateSunMoon();
            animSunMoon.seek(currPos);
            masterTL.add(animSunMoon, 0);
        });
        var animColors = this.animateColors();
        var animStars = this.animateStars();
        var animMoonPhase = this.animateMoonPhase();
        return new TimelineMax().add([animColors, animSunMoon, animStars, animMoonPhase]);
    },

    animateColors: function() {
        var sun = "#sun circle";
        TweenMax.set(sun, {attr: {fill: sunRedColor}});
        var skyColor1 = "#sky-color-1";
        var skyColor2 = "#sky-color-2";
        TweenMax.set(skyColor1, {stopColor: daySkyColor, stopOpacity: 0.5});
        TweenMax.set(skyColor2, {stopColor: eveningRedColor, stopOpacity: 1});
        var tl1 = new TimelineMax({repeat: -1})
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: "white",
            ease: Linear.easeNone
        })
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: eveningRedColor,
            ease: Linear.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE)
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: nightGlowColor,
            ease: Linear.easeNone
        })
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: eveningRedColor,
            ease: Linear.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE);
        var tl2 = new TimelineMax({repeat: -1})
        .to(skyColor1, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopOpacity: 1,
            ease: Linear.easeNone
        })
        .to(skyColor1, 0.4*0.5*DAY_NIGHT_CYCLE, {
            stopOpacity: 0,
            stopColor: nightSkyColor,
            ease: Linear.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE)
        .to(skyColor1, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopOpacity: 0.5,
            stopColor: daySkyColor,
            ease: Linear.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE);
        var tl3 = new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
        .to(sun, 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {fill: sunColor}, 
            ease: Linear.easeNone
        })
        .to(sun, 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {fill: sunRedColor}, 
            ease: Linear.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE);
        return new TimelineMax().add([tl1, tl2, tl3]);
    },

    animateColors_d: function() {
        var skyColor1 = "#sky-color-1";
        var skyColor2 = "#sky-color-2";
        var sun = $("use.sun");
        TweenMax.set(skyColor2, {stopColor: eveningRedColor, stopOpacity: 1});
        TweenMax.set(skyColor1, {stopColor: nightSkyColor, stopOpacity: 1});
        TweenMax.set(sun, {fill: sunRedColor});
        var animSkyColor2 = new TimelineMax({repeat: -1})
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: "#fff", 
            ease: Power0.easeNone
        })
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: eveningRedColor, 
            ease: Power0.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE)
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: nightGlowColor, 
            ease: Power0.easeNone
        })
        .to(skyColor2, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopColor: eveningRedColor, 
            ease: Power0.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE);
        var animSkyColor1 = new TimelineMax({repeat: -1, repeatDelay: 0.3*0.5*DAY_NIGHT_CYCLE})
        .to(skyColor1, 0.6*0.5*DAY_NIGHT_CYCLE, {
            stopColor: daySkyColor, 
            ease: Power0.easeNone
        }, "-="+0.3*0.5*DAY_NIGHT_CYCLE)
        .to(skyColor1, 0.7*0.5*DAY_NIGHT_CYCLE, {
            stopColor: nightSkyColor, 
            ease: Power0.easeNone
        }, "+="+0.4*0.5*DAY_NIGHT_CYCLE);
        var animSun = new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
        .to(sun, 0.2*0.5*DAY_NIGHT_CYCLE, {
            fill: sunColor, 
            ease: Power0.easeNone
        })
        .to(sun, 0.2*0.5*DAY_NIGHT_CYCLE, {
            fill: sunRedColor, 
            ease: Power0.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE);
        var anim = new TimelineMax();
        anim.add([animSkyColor2, animSkyColor1, animSun]);
        return anim;
    },

    animateSunMoon: function() {
        var svgViewBox = getSvgViewBox();
        var sun = "use.sun";
        var sunDiameter = $("#sun circle").attr("r")*2;
        var moon = "use.moon";
        var moonDiameter = $("#moon-main").attr("r")*2;
        var animSun = new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
        .to(sun, 0.5*DAY_NIGHT_CYCLE, {
            bezier: {
                type:"cubic", 
                values: [
                    {x:0, y:0}, 
                    {x:0, y:-430}, 
                    {x:getWindowWidthInSvgCoords() - sunDiameter, y:-430}, 
                    {x:getWindowWidthInSvgCoords() - sunDiameter, y:0}
                ]
            },
            ease: Power0.easeNone
        });
        var animMoon = new TimelineMax({repeat: -1})
        .to(moon, LUNATION, {
            bezier: {
                type:"cubic", 
                values: [
                    {x:0, y:0}, 
                    {x:0, y:-430}, 
                    {x:getWindowWidthInSvgCoords() - moonDiameter, y:-430}, 
                    {x:getWindowWidthInSvgCoords() - moonDiameter, y:0}
                ]
            },
            ease: Power0.easeNone
        });
        return new TimelineMax().add([animSun, animMoon]);
    },

    animateMoonPhase: function() {
        var animShadow = new TimelineMax({repeat: -1, yoyo: true})
        .to("#moon-shadow", 0.3*0.5*LUNATION, {
            attr: {
                d: "M40,0 Q-10,40 40,80 L80,80 L80,0"
            },
            ease: Linear.easeNone
        })
        .to("#moon-shadow", 0.4*0.5*LUNATION, {
            attr: {
                d: "M40,0 Q90,40 40,80 L80,80 L80,0"
            },
            ease: Linear.easeNone
        })
        .to("#moon-shadow", 0.3*0.5*LUNATION, {
            attr: {
                d: "M80,0 Q90,40 80,80 L80,80 L80,0"
            },
            ease: Linear.easeNone
        });
        var animShine = new TimelineMax({repeat: -1, yoyo: true})
        .to("#shineMoon feGaussianBlur", 0.5*LUNATION, {
            attr: {stdDeviation: 20},
            ease: Linear.easeNone
        });
        return new TimelineMax().add([animShadow, animShine]);
    },

    animateStars: function() {
        var svg = Snap("#mainSvg");
        var svgViewBox = getSvgViewBox();
        var starsContainer = Snap("#stars");
        var shineFilter = Snap("#shineStars");
        for(var i = 0; i < 300; i++) {
            var star = svg.circle(
                Math.random()*svgViewBox.width, //cx
                Math.random()*svgViewBox.height*0.66, //cy
                Math.random()*3 //r
            );
            star.attr({fill: "white", filter: shineFilter});
            starsContainer.append(star);
        }
        TweenMax.set(starsContainer.node, {opacity: 0});
        return new TimelineMax({repeat: -1})
        .to(starsContainer.node, 0.4*0.5*DAY_NIGHT_CYCLE, {
            opacity: 1,
            ease: Linear.easeNone
        }, 0.5*DAY_NIGHT_CYCLE)
        .to(starsContainer.node, 0.4*0.5*DAY_NIGHT_CYCLE, {
            opacity: 0,
            ease: Linear.easeNone
        }, "+="+0.2*0.5*DAY_NIGHT_CYCLE);
    },

    generateClouds: function(number, wind) {
        var svgViewBox = getSvgViewBox();
        var gradient = Snap("#mainSvg").gradient("l(0,0,0,1)rgba(255,255,255,.3)-rgba(255,255,255,0)");
        var animClouds = new TimelineMax();
        for(var i = 0; i < number; i++) {
            var cloud = Snap("#cloud-1").use();
            cloud.attr({
                width: 286, 
                height: 106, 
                fill: gradient, 
                x: -286,
                y: Math.random()*svgViewBox.height/2.8
            });
            cloud.transform("scale("+Math.random()+")");
            Snap("#clouds").append(cloud);
            var randWind = Math.abs(Math.random()*wind);
            while(randWind==0) randWind = Math.abs(Math.random()*wind);
            var tl = new TimelineMax({repeat: -1});
            if(wind > 0)
                tl.to(cloud.node, 1/randWind, {
                    x: svgViewBox.width+286,
                    ease: Linear.easeNone
                });
            else
                tl.from(cloud.node, 1/randWind, {
                    x: svgViewBox.width+286,
                    ease: Linear.easeNone
                });
            animClouds.add(tl, 0);
        }
        return animClouds;
    }

}