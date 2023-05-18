// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 760 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg, abstractionData;

export function drawGroupedBarChart() {
    // append the svg object to the body of the page
    svg = d3.select("#groupedBarChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("./resources/water_abstraction.csv").then(function (data) {
        // List of subgroups = header of the csv files = soil condition here
        var subgroups = data.columns.slice(2)


        abstractionData = data.filter(function (d) {
            if (d.country == "EU" && (
                d.year == 2007 ||
                d.year == 2011 ||
                d.year == 2015 ||
                d.year == 2019)) {
                return d;
            }
        });

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(abstractionData, function (d) { return (d.year) })

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 90000])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Another scale for subgroup position?
        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#834aaf', '#ff7f00', '#ffff33', '#a65628'])

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in data = loop group per group
            .data(abstractionData)
            .enter()
            .append("g")
            .attr("transform", function (d) { return "translate(" + x(d.year) + ",0)"; })
            .selectAll("rect")
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
            .enter().append("rect")
            .attr("x", function (d) { return xSubgroup(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) { return color(d.key); });

    })
}

export function updateGroupedBarChart({ country = "EU" } = {}) {
    abstractionData = data.filter(function (d) {
        if (d.country == country) {
            return d;
        }
    });


}