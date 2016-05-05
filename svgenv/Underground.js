var Underground = {

    init: function() {
        var paper = Snap("#underground");
        var width = getSvgViewBox().width,
            height = paper.attr("height");

        var density = 50;

        var vertices = [];
        for(var x = -1; x < width/density+1; x++) {
            var verticesCol = [];
            for(var y = 0; y < height/density+1; y++) {
                var xi = getRandomInt(x*density, (x+1)*density);
                var yi = getRandomInt(y*density, (y+1)*density);
                verticesCol.push(new Point(xi, yi));
            }
            vertices.push(verticesCol);
        }

        var goldVeinPos = getRandomInt(0,width/density-1);
        var goldVeinLength = 3;

        for(var i = 1; i < vertices.length; i++) {
            for(var j = 0; j < vertices[0].length-1; j++) {
                // draw polygons
                var color1 = "hsl(20,100,"+getRandomInt(15,20)+")";
                paper.polyline(vertices[i][j+1].x,   vertices[i][j+1].y,
                               vertices[i-1][j+1].x, vertices[i-1][j+1].y,
                               vertices[i-1][j].x,   vertices[i-1][j].y,
                               vertices[i][j+1].x,   vertices[i][j+1].y)
                .attr({fill:color1, stroke:color1, strokeWidth:2});
                var color2 = "hsl(20,100,"+getRandomInt(15,20)+")";
                paper.polyline(vertices[i][j].x,   vertices[i][j].y,
                               vertices[i-1][j].x, vertices[i-1][j].y,
                               vertices[i][j+1].x, vertices[i][j+1].y,
                               vertices[i][j].x,   vertices[i][j].y)
                .attr({fill:color2, stroke:color2, strokeWidth:2});

                // draw gold vein
                if(j < goldVeinLength)
                    paper.line(vertices[goldVeinPos][j].x, vertices[goldVeinPos][j].y,
                               vertices[goldVeinPos][j+1].x, vertices[goldVeinPos][j+1].y)
                    .attr({stroke:"gold", strokeWidth:3/(j+1)});
            }
        }
    }

}