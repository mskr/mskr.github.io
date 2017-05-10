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
    var width = 1000;
    var height = 500;
    var margin = {top: 0, right: 0, bottom: 60, left: 40};
    var svg = d3.select("body")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var w = width - margin.left - margin.right;
    var h = height - margin.bottom - margin.top;

    var countries = d3.map(data, function(d) { return d.country; }).keys();
    //var MAX_BUDGET_US = d3.max(data, function(d) { return (d.country=="USA") ? +d.budget : 0; });
    var MIN_YEAR = d3.min(data, function(d) { return (d.title_year)?+d.title_year:3000; });
    var MAX_YEAR = d3.max(data, function(d) { return +d.title_year; });
    var MAX_LIKES = d3.max(data, function(d) { return +d.movie_facebook_likes; });
    var x = d3.scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, w]); // x: year
    var y = d3.scaleLinear().domain([MAX_LIKES, 0]).range([0, h]); // y: likes
    //var r = d3.scale.linear().domain([0, MAX_BUDGET_US]).range([0, 100]); // radius: budget
    var c = d3.scale.ordinal().domain(countries).range(d3.schemeCategory20c); // color: country

    // country color-code legend
    svg.append("g")
        .attr("transform", "translate(0," + (height-5) + ")")
        .selectAll("circle").data(countries).enter().append("circle")
            .attr("r", 5)
            .attr("cx", function(d) { return countries.indexOf(d) * 10; })
            .attr("fill", function(d) { return c(d); })
            .append("title") // mouseover tooltip
                .text(function(d) { return d; });

    // axes
    var xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d")); // decimal format
    var yAxis = d3.axisLeft(y)
        .tickFormat(d3.format(".2s")); // 2 rounded digits + SI-unit
    svg.append("g")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .append("text")
            .text("Year")
            .attr("transform", "translate(" + w + "," + 30 + ")")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .style("font", "1.5em sans-serif")
    svg.append("g")
        .call(yAxis)
        .append("text")
            .text("Facebook Likes")
            .attr("transform", "translate(" + 20 + "," + 0 + ") rotate(-90)")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .style("font", "1.5em sans-serif")
    
    // enter data
    var point = svg.append("g").selectAll("circle").data(data).enter().append("g")
        .attr("transform", function(d) { return "translate(" + x(+d.title_year) + "," + y(+d.movie_facebook_likes) + ")";})
    point.append("circle")
        .attr("r", function(d) { return 5; })
        .attr("fill", function(d) { return c(d.country); })
        .append("title") // mouseover tooltip
            .text(function(d) { return d.movie_title + "\n" + d.title_year + "\n" + d.country + "\n" + d.movie_facebook_likes; })
    point.append("text")
        .text(function(d) {
            return ((+d.movie_facebook_likes>40000 && +d.title_year<1990)
                || (+d.movie_facebook_likes>198000)
                || (+d.movie_facebook_likes>1000 && +d.title_year<1930)
                || (+d.movie_facebook_likes>100000 && +d.title_year<2000)) 
                    ? d.movie_title + "(" + d.movie_facebook_likes + " likes)" : "";
        })
        .attr("text-anchor", "end")
        .attr("transform", "translate(-10, 10)")
        .style("font", ".8em sans-serif")
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