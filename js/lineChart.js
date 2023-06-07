// set the dimensions and margins of the graph
const margin = { top: 15, right: 40, bottom: 55, left: 25 },
    height = 300 - margin.top - margin.bottom;

const lineChartContainer = d3.select("#lineChart")
const width = lineChartContainer.node().getBoundingClientRect().width - margin.left - margin.right

var line_data;
var x_line, y_line, yAxis;
var svg, color

export function drawLineChart() {
    // append the svg object to the body of the page
    svg = lineChartContainer
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("height", "100%")
        .attr("width", "100%")
        .classed("svg-content", true)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    //Read the data
    d3.csv("./resources/water_pollutants.csv",
        function (d) {
            return {
                reportingYear: new Date(parseInt(d.reportingYear), 0),
                countryName: d.countryName,
                Total: parseFloat(d.Total),
                Nitrogen: parseFloat(d.Nitrogen),
                Phosphorus: parseFloat(d.Phosphorus),
                TOC: parseFloat(d.TOC),
                'Heavy metals (Cd, Hg, Ni, Pb)': parseFloat(d['Heavy metals (Cd, Hg, Ni, Pb)'])
            }
        }
    ).then(
        // Now I can use this dataset:
        function (data) {
            line_data = data.filter(function (d) {
                if (d.reportingYear <= new Date(2019, 0)) {
                    return d;
                }
            });

            // Add X axis --> it is a date format
            x_line = d3.scaleTime()
                .domain(d3.extent(line_data, function (d) { return d.reportingYear; }))
                .range([0, (width - margin.right)]);

            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x_line));

            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height)
                .text("Year");

            // Add Y axis
            y_line = d3.scaleLinear()
                .domain([0, 550000000])
                .range([height, 0]);

            yAxis = d3.axisLeft(y_line);

            svg.append("g")
                .attr("class", "y-axis");

            // svg.append("text")
            //     .attr("class", "y label")
            //     .attr("text-anchor", "end")
            //     .attr("x", 0)
            //     .attr("y", -5)
            //     .attr("dy", "-.30em")
            //     .text("kg");

            const subgroups = ['Nitrogen', 'Phosphorus', 'TOC', 'Heavy metals (Cd, Hg, Ni, Pb)']

            color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(d3.schemeCategory10)

            const svg_legend = d3.select("#lineLegend")
                .append('svg')
                .attr(
                    "viewBox",
                    `-20 -20 350 350`
                )
                .attr("height", "100%")
                .attr("width", "100%")
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

            updateLineChart()
        })
}

export function updateLineChart({ country = "EU" } = {}) {
    var data = line_data.filter(function (d) {
        if (d.countryName == country) {
            return d;
        }
    });

    y_line.domain([0, d3.max(data, function (d) {
        return Math.max(
            parseFloat(d.Nitrogen),
            parseFloat(d.Phosphorus),
            parseFloat(d.TOC),
            parseFloat(d['Heavy metals (Cd, Hg, Ni, Pb)']))
    })]);

    svg.selectAll(".y-axis").transition()
        .duration(1000)
        .call(yAxis);

    const u_n = svg.selectAll(".line_n")
        .data([data], function (d) { return d.reportingYear });

    const u_p = svg.selectAll(".line_p")
        .data([data], function (d) { return d.reportingYear });

    const u_t = svg.selectAll(".line_t")
        .data([data], function (d) { return d.reportingYear });

    const u_h = svg.selectAll(".line_h")
        .data([data], function (d) { return d.reportingYear });

    // Updata the line
    u_n
        .join("path")
        .attr("class", "line_n")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .defined(function (d) { return d.Nitrogen != 0; })
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d.Nitrogen); }))
        .attr("fill", "none")
        .attr("stroke", color('Nitrogen'))
        .attr("stroke-width", 2.5)

    u_p
        .join("path")
        .attr("class", "line_p")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .defined(function (d) { return d.Phosphorus != 0; })
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d.Phosphorus); }))
        .attr("fill", "none")
        .attr("stroke", color('Phosphorus'))
        .attr("stroke-width", 2.5)

    u_t
        .join("path")
        .attr("class", "line_t")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .defined(function (d) { return d.TOC != 0; })
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d.TOC); }))
        .attr("fill", "none")
        .attr("stroke", color('TOC'))
        .attr("stroke-width", 2.5)

    u_h
        .join("path")
        .attr("class", "line_h")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .defined(function (d) { return d['Heavy metals (Cd, Hg, Ni, Pb)'] != 0; })
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d['Heavy metals (Cd, Hg, Ni, Pb)']); }))
        .attr("fill", "none")
        .attr("stroke", color('Heavy metals (Cd, Hg, Ni, Pb)'))
        .attr("stroke-width", 2.5)
}