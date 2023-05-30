// set the dimensions and margins of the graph
const margin = { top: 10, right: 50, bottom: 60, left: 42.5 },
    width = 600 - margin.left - margin.right,
    height = 370 - margin.top - margin.bottom;

var svg, abstractionData, y, color, x, xSubgroup, subgroups, yAxis;

export function drawGroupedBarChart() {
    // append the svg object to the body of the page
    svg = d3.select("#groupedBarChart")
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMinYMin meet")
        .classed("svg-content", true)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the Data
    d3.csv("./resources/water_abstraction.csv").then(function (data) {
        subgroups = data.columns.slice(2)

        abstractionData = data.filter(function (d) {
            if (d.year == 2007 ||
                d.year == 2011 ||
                d.year == 2015 ||
                d.year == 2019) {
                return d;
            }
        });

        var groups = d3.map(abstractionData, function (d) { return (d.year) })

        // Add X axis
        x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0));

        xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("font-size", "1em")
            .attr("x", width)
            .attr("y", height - 10)
            .text("Year");

        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeCategory10)

        y = d3.scaleLinear()
            .domain([0, 90000])
            .range([height, 0]);

        yAxis = d3.axisLeft(y);

        svg.append("g")
            .attr("class", "y-axis");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("font-size", "1em")
            .attr("x", 0)
            .attr("y", -10)
            .attr("dy", ".15em")
            .text("Million m³");

        const svg_legend = d3.select("#groupedBarLegend")
            .append('svg')
            .attr(
                "viewBox",
                `-20 -20 350 350`
            )
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content", true)
            .append("g")

        svg_legend.selectAll("mydots")
            .data(subgroups)
            .enter()
            .append("circle")
            .attr("cy", function (d, i) { return 20 + i * 40 })
            .attr("r", 10)
            .style("fill", function (d) { return color(d) })

        svg_legend.selectAll("mylabels")
            .data(subgroups)
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", function (d, i) { return 20 + i * 40 })
            .style("fill", function (d) { return color(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

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