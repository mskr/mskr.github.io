$(document).ready(function() {
    var path = "https://raw.githubusercontent.com/mskr/mskr.github.io/master/datavis";
    d3.text(path+"/imdb_data_set.csv", function(data) {
    	visualize(d3.dsvFormat(";").parse(data));
    });
});

function visualize(data) {
    makeCoordinateSystem(data);
}

function makeCoordinateSystem(data) {
    var countries = d3.map(data, function(d){return d.country;}).keys();
    var w = 500, h = 500;
    var x = d3.scale.linear().domain([1900, 2017]).range([0, w]); // x: year
    var y = d3.scale.linear().domain([0, 349000]).range([0, h]); // y: likes
    var r = d3.scale.linear().domain([0, 800000000]).range([0, 10]); // radius: budget
    var c = d3.scale.ordinal().domain(countries).range(d3.schemeCategory20c); // color: country
    
    var svg = d3.select("body")
        .append("svg")
            .attr("width", w)
            .attr("height", h);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // obscure:
    svg.append("g")
        .attr("class", "axis") // style with css
        .attr("transform", "translate(0,"+h+")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, 0)")
        .call("yAxis");
    

    svg.selectAll("circle").data(data).enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.title_year); })
        .attr("xy", function(d) { return y(d.movie_facebook_likes); })
        .attr("r", function(d) { return r(d.budget); })
        .attr("fill", function(d) { return c(d.country); });
    
}

function makeCirclePacking(data) {
    var width = 2000, height = 2000;
    // A SVG canvas shall serve as a data visualization surface in our document
    var svg = d3.select("body")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g");

    // Circle packing:
    // 1st need a hierarchical structure
    data = {name: "root", children: data}; // set all objects as children of artificial root
    // 2nd create the layout
    var pack = d3.layout.pack()
        .size([width, height])
        .padding(1.5)
        .value(function(d) { return d.budget; }); // specify the data field to be visualized

    // The ordinal scale can map ordered values (numbers, alphabets...) on range bands
    var color = d3.scaleOrdinal(d3.schemeCategory20c); // categorial scheme with 
                                                       // 20 colors (=20 range bands)

    // The linear scale maps the domain (of a numeric data element) to
    // a range (of screen space)
    var radii = d3.scale.linear().domain([0, 800000000]).range([0, width/2]);



    // Enter data into the document
    var groups = svg.selectAll("g").data(pack(data));
    groups = groups.enter()
        .append("g")
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });
    var circles = groups.append("circle")
        .attr("r", function(d) { return d.r; })
        .attr("fill", function(d) { return (d.name == "root") ? "white" : color(d.country); });
    var text = groups.append("text")
        .text(function(d) { return (d.r > 30) ? d.movie_title : ""; })
        .style("font-size", ".8em")
        .attr("text-anchor", "middle");
}