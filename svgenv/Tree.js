Tree = extend({}, {

    _: function(pos) {
        if(!pos) throw "Please specify position";
        this.plant(pos, 0.01);
    },

    generate: function(number, wind) {
        var anims = [];
        var pos = -getSvgViewBox().width/number;
        for(var i = 0; i < number; i++) {
            var tree = Snap("#tree-1").clone().appendTo(Snap("#trees")).attr({
                class: "tree",
                width: 200,
                height: 200,
                x: pos += getSvgViewBox().width/number,
                y: 200
            });
            var treeStem = tree.select(".stem");
            var animWave = this.animateWave(treeStem.node, wind);
            tree.shadow(animWave);
            anims.push(animWave);
        }
        return new TimelineMax().add(anims);
    },

    plant: function(xPos, wind) {
        var tree = Snap("#tree-1").clone().appendTo(Snap("#trees")).attr({
            class: "tree",
            width: 200,
            height: 200,
            x: xPos,
            y: 200
        });
        var stem = tree.select(".stem");

        var animWave = this.animateWave(stem.node, wind);

        var woodenParts = tree.selectAll(".stem > path, .branch > path");
        var outerBranches = tree.selectAll(".stem > .branch:not(.sapling)");
        var rightBranches = tree.selectAll(".stem .branch.right");
        var leftBranches = tree.selectAll(".stem .branch.left");
        var topBranches = tree.selectAll(".stem .branch.top");
        var leaves = tree.selectAll(".stem .leaf");
        var saplings = tree.selectAll(".sapling");

        //TweenMax.set(woodenParts.nodes(), {fill: "#228B22"});
        TweenMax.set(rightBranches.nodes(), {transformOrigin: "0 50%"});
        TweenMax.set(leftBranches.nodes(), {transformOrigin: "100% 50%"});
        TweenMax.set(topBranches.nodes(), {transformOrigin: "50% 100%"});
        TweenMax.set(stem.node, {transformOrigin: "50% 100%"});

        var tl = new TimelineMax()
        .fromTo(stem.node, 5, {scale: 0}, {scale: 1});
        this.recursiveGrow(outerBranches.nodes(), tl);
        
        tl.eventCallback("onComplete", function() {
            var shadow = tree.shadow(animWave);
            TweenMax.fromTo(shadow.node, 5, {opacity: 0}, {opacity: 1});
        })
    },

    recursiveGrow: function(branches, tl) {
        if(branches.length == 0) return;
        tl.fromTo(branches, 5, {scale: 0}, {scale: 1}, "-=2");
        var allDirectSubBranches = [];
        for(var i = 0; i < branches.length; i++) {
            var branch = Snap(branches[i]);
            branch.attr({id: "tmp"});
            var directSubBranches = branch.selectAll("#tmp > .branch").nodes();
            branch.attr({id: ""});
            allDirectSubBranches = allDirectSubBranches.concat(directSubBranches);
        }
        this.recursiveGrow(allDirectSubBranches, tl);
    },

    animateWave: function(elem, wind) {
        var amplitude = wind*90;
        var frequency = 4;
        TweenMax.set(elem, {skewX: 0, transformOrigin: "50% 100%"});
        return new TimelineMax()
        .to(elem, frequency/4, {
            skewX: amplitude,
            ease: Power1.easeInOut
        })
        .to(elem, frequency/2, {
            skewX: -amplitude,
            repeat: -1,
            yoyo: true,
            ease: Power1.easeInOut
        });
    }

});