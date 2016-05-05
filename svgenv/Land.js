var Land = {

    animate: function() {
        var animMountainIllu = this.animateMountainIllumination();
        var animFog = this.animateFarFog();
        var animNightFilter = this.animateNightFilter();
        return new TimelineMax().add([animMountainIllu, animFog, animNightFilter]);
    },

    animateNightFilter: function() {
        var colorMatrix = "#nightIlluminator feColorMatrix";
        TweenMax.set(colorMatrix, {attr: {values: 0.1}});
        var compTransferFuncs = "#nightIlluminator feComponentTransfer *";
        TweenMax.set(compTransferFuncs, {attr: {slope: 0.5}});
        return new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
        .to(colorMatrix, 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {values: 1},
            ease: Linear.easeNone
        }, 0)
        .to(compTransferFuncs, 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {slope: 1},
            ease: Linear.easeNone
        }, 0)
        .to(colorMatrix, 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {values: 0.1},
            ease: Linear.easeNone
        }, 0.8*0.5*DAY_NIGHT_CYCLE)
        .to(compTransferFuncs, 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {slope: 0.5},
            ease: Linear.easeNone
        }, 0.8*0.5*DAY_NIGHT_CYCLE);
    },

    animateMountainIllumination: function() {
        var mountainDarkside = $("#mountains-2 path:not(.sunside)");
        var mountainSunside = $("#mountains-2 .sunside");
        TweenMax.set([mountainDarkside, mountainSunside], {
            attr: {fill: mountainNightColor}
        });
        return new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
        .add([
            TweenMax.to(mountainDarkside, 0.2*0.5*DAY_NIGHT_CYCLE, {
                attr: {fill: mountainDarksideColor},
                ease: Linear.easeNone
            }),
            TweenMax.to(mountainSunside, 0.2*0.5*DAY_NIGHT_CYCLE, {
                attr: {fill: mountainSunsideColor},
                ease: Linear.easeNone
            })
        ])
        .add([
            TweenMax.to(mountainDarkside, 0.6*0.5*DAY_NIGHT_CYCLE, {
                attr: {fill: mountainSunsideColor},
                ease: Linear.easeNone
            }),
            TweenMax.to(mountainSunside, 0.6*0.5*DAY_NIGHT_CYCLE, {
                attr: {fill: mountainDarksideColor},
                ease: Linear.easeNone
            })
        ])
        .to([mountainDarkside, mountainSunside], 0.2*0.5*DAY_NIGHT_CYCLE, {
            attr: {fill: mountainNightColor},
            ease: Linear.easeNone
        });
    },

    animateFarFog: function() {
        var fog = "#far-fog";
        TweenMax.set(fog, {stopOpacity: 0.5});
        return new TimelineMax({repeat: -1, repeatDelay: 0.5*DAY_NIGHT_CYCLE})
        .to(fog, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopOpacity: 0,
            ease: Linear.easeNone
        })
        .to(fog, 0.2*0.5*DAY_NIGHT_CYCLE, {
            stopOpacity: 0.5,
            ease: Linear.easeNone
        }, "+="+0.6*0.5*DAY_NIGHT_CYCLE);
    }

}