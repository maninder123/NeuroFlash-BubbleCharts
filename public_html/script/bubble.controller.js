angular.module('myApp').controller('MyCtrl',
        myCtrl);

myCtrl.$inject = [
    '$scope',
    'MyApiService'

];

function myCtrl(
        $scope,
        MyApiService

        ) {
    $scope.submitStudnetForm = function () {
        d3.selectAll('svg').remove();
        var dim_wordsArray = [];
        var score_dim_wordsArray = [];
        dim_wordsArray = $scope.student.dim_words.split(",");
        score_dim_wordsArray = $scope.student.score_dim_words.split(",");
        var objParameter = {"dim_words": dim_wordsArray, "score_dim_words": score_dim_wordsArray, "model_id": "001"}
        MyApiService.getBubbleChartData(objParameter).then(function (response) {
            bubbleChart(response);
            //removing loader to the page on success.
            document.getElementById('loader').style.display = 'none';
        })
    };

    $scope.resetForm = function () {
        $scope.student = angular.copy($scope.OriginalStudent);

    };
    var child_color_array = ["#008B00", "#F2F2F2", "#4FE378", "#1EC746"]
    var parent_color_array = ["#878787", "#F3F3F3"];
    /* Function to draw bubble chart based on the response data dynamically*/
    function bubbleChart(response) {

        if (response.data.error){
            //removing loader to the page 
             document.getElementById('loader').style.display = 'none';
             document.getElementById('error-msg').style.display = 'block';
        }
// defining width and height of the svg
        var width = parseInt(d3.select("#bubbleChart").style("width"));

        // appending the svg element
        d3.select("#bubbleChart").html("");
        var svg = d3.select("#bubbleChart").append("svg").attr("width", width - 200).attr("height", width - 200), // 200 is to maintain the space down and up to the chart.
                diameter = +svg.attr("width"),
                g = svg.append("g").attr("transform", "translate(2,2)"),
                format = d3.format(",d");

// creating packages..
        var pack = d3.pack()
                .size([diameter - 4, diameter - 4]);


        /* Function to calculate the depth. */
        function depthCount(branch) {
            if (!branch.children) {
                return 1;
            }
            return 1 + d3.max(branch.children.map(depthCount));
        }

// Handling data to create child parent combinations based on their Ranks...
        var root = response.data;
        var dataToShow = [];
        var formattedData = [];
        root.map(function (v, k) {
            dataToShow.push({
                "name": v.word,
                "size": v.quartile_rank,
                "score": v.quartile_score
            });
        })
        var nested_data = d3.nest()
                .key(function (d) {
                    return d.score;
                })
                .entries(dataToShow);

        nested_data.map(function (v, k) {
            formattedData.push({"name": v.key, "children": v.values})
        })
        var arr = formattedData.sort(function (a, b) {
            return b.value - a.value;
        });

        for (i = 0; i <= arr.length - 1; i++) {
            arr[i + 1] ? arr[i + 1].children.push(arr[i]) : "";
        }
// Defining root based on their hierarchy...
        root = d3.hierarchy(arr[arr.length - 1])
                .sum(function (d) {
                    return d.size;
                })
                .sort(function (a, b) {
                    return b.value - a.value;
                });

        // color for children circles 
        var color = d3.scaleLinear()
                .domain([depthCount(root), 0])
                .range(child_color_array)
                .interpolate(d3.interpolateHcl);

        // color for Parent of children circles (roots)
        var colorParent = d3.scaleLinear()
                .domain([depthCount(root), 0])
                .range(parent_color_array)
                .interpolate(d3.interpolateHcl);

// creating node 
        var node = g.selectAll(".node")
                .data(pack(root).descendants())
                .enter().append("g")
                .attr("class", function (d) {
                    return d.children ? "node" : "leaf node";
                })
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

//appending titles to the node.
        node.append("title")
                .text(function (d) {
                    return d.data.name + "\n" + format(d.value);
                });

// drawing circles....
        node.append("circle")
                .attr("r", function (d, i) {
                    return d.r;
                })
                .style("fill", function (d) {
                    return d.children ? colorParent(d.depth) : color(d.depth);
                });

// appending text
        node.filter(function (d) {
            return !d.children;
        }).append("text")
                .attr("dy", "0.3em")
                .text(function (d) {
                    return d.data.name.substring(0, d.r / 3);
                });
    }
}