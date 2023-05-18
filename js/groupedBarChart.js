// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 760 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg, abstractionData, y, color, x, xSubgroup, subgroups, yAxis;

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
        subgroups = data.columns.slice(2)

        abstractionData = data.filter(function (d) {
            if (d.year == 2007 ||
                d.year == 2011 ||
                d.year == 2015 ||
                d.year == 2019) {
                return d;
            }
        });

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(abstractionData, function (d) { return (d.year) })

        // Add X axis
        x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0));

        // Another scale for subgroup position?
        xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        // color palette = one color per subgroup
        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#834aaf', '#ff7f00', '#ffff33', '#a65628'])

        // Add Y axis
        y = d3.scaleLinear()
            .domain([0, 90000])
            .range([height, 0]);

        yAxis = d3.axisLeft(y);

        svg.append("g")
            // .call(d3.axisLeft(y));
            .attr("class", "y-axis");

        updateGroupedBarChart()
    })
}

export function updateGroupedBarChart({ country = "EU" } = {}) {
    var data = abstractionData.filter(function (d) {
        if (d.country == country) {
            return d;
        }
    });

    y.domain([0, d3.max(data, function (d) {
        return Math.max(
            parseInt(d['Electricity cooling']),
            parseInt(d['Agriculture']),
            parseInt(d['Manufacturing']),
            parseInt(d['Public water supply']),
            parseInt(d['Manufacturing cooling']),
            parseInt(d['Mining and quarrying']),
            parseInt(d['Construction']))
    })]);

    svg.selectAll(".y-axis").transition()
        .duration(1000)
        .call(yAxis);

    var barGroups = svg.selectAll("g.layer").data(data);
    barGroups.enter().append("g").classed('layer', true)
        .attr("transform", function (d) { return "translate(" + x(d.year) + ",0)"; });

    barGroups.exit().remove();

    var bars = svg.selectAll("g.layer").selectAll("rect")
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })

    bars
        .enter()
        .append("rect")
        .attr("width", xSubgroup.bandwidth())
        .attr("x", function (d) { return xSubgroup(d.key); })
        .attr("fill", function (d) { return color(d.key); })
        .transition().duration(1000)
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return height - y(d.value); });

    bars
        .transition().duration(1000)
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return height - y(d.value); });

    bars.exit().remove();

}