$(document).ready(function() {
    console.log("document ready");
    var data = [];
    d3.csv("http://mskr.github.io/datavis/imdb_data_set.csv", function(dat) {
    	console.log(dat);
    });
});
