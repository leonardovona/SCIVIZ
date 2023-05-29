// set the dimensions and margins of the graph
const margin = { top: 15, right: 40, bottom: 35, left: 40 },
    // width_line = 550 ,
    height = 300 - margin.top - margin.bottom;

const lineChartContainer = d3.select("#lineChart")
const width = lineChartContainer.node().getBoundingClientRect().width - margin.left - margin.right

var line_data;
var x_line, y_line, yAxis;
var svg_line, color

export function drawLineChart() {
    // append the svg object to the body of the page
    svg_line = lineChartContainer
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMinYMin meet")
        .classed("svg-content", true)
        .append("g")
        // .attr("height", "10%")
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
        // When reading the csv, I must format variables:
        // function (d) {
        //     // d = d.filter(function (d) {
        //     //     if (d.countryName == "EU") {
        //     //         return d;
        //     //     }
        //     // });
        //     console.log(d)
        //     return { year: d.reportingYear, value: d.TOC }
        // }).then(
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

            svg_line.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x_line));

            svg_line.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height)
                .text("Year");


            // Add Y axis
            y_line = d3.scaleLinear()
                .domain([0, 550000000])
                //.domain([0, d3.max(data, function (d) { return +d['TOC']; })])
                .range([height, 0]);

            yAxis = d3.axisLeft(y_line);

            svg_line.append("g")
                // .call(d3.axisLeft(y_line))
                .attr("class", "y-axis");

            svg_line.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", -5)
                .attr("dy", "-.30em")
                // .attr("transform", "rotate(-90)")
                .text("kg");

            const subgroups = ['Nitrogen', 'Phosphorus', 'TOC', 'Heavy metals (Cd, Hg, Ni, Pb)']

            color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#e41a1c', '#377eb8', '#4daf4a', '#834aaf'])

            const svg_legend = d3.select("#lineLegend")
                .append('svg')
                .attr(
                    "viewBox",
                    `-20 -20 350 350`
                )
                .attr("preserveAspectRatio", "xMinYMin meet")
                .classed("svg-content", true)
                .append("g")
                // .append('svg')
                // .attr(
                //     "viewBox",
                //     `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
                // )
                // .attr("preserveAspectRatio", "xMinYMin meet")
                // // .classed("svg-content-responsive", true)
                // .attr("height", "100%")
                // .append("g")

            // Add one dot in the legend for each name.
            svg_legend.selectAll("mydots")
                .data(subgroups)
                .enter()
                .append("circle")
                .attr("cy", function (d, i) { return 20 + i * 40 }) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 10)
                .style("fill", function (d) { return color(d) })


            // Add one dot in the legend for each name.
            svg_legend.selectAll("mylabels")
                .data(subgroups)
                .enter()
                .append("text")
                .attr("x", 20)
                .attr("y", function (d, i) { return 20 + i * 40 }) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function (d) { return color(d) })
                .text(function (d) { return d })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")

            // var res = line_data.map(function (d) { console.log(d); return d.key }) // list of group names
            // var color = d3.scaleOrdinal()
            //     .domain(res)
            //     .range(['#e41a1c', '#377eb8', '#4daf4a', '#834aaf'])

            // Draw the line
            // svg.selectAll(".line")
            //     .data(sumstat)
            //     .enter()
            //     .append("path")
            //     .attr("fill", "none")
            //     .attr("stroke", function (d) { return color(d.key) })
            //     .attr("stroke-width", 1.5)
            //     .attr("d", function (d) {
            //         return d3.line()
            //             .x(function (d) { return x(d.year); })
            //             .y(function (d) { return y(+d.n); })
            //             (d.values)
            //     })


            updateLineChart()
        })
}

export function updateLineChart({ country = "EU" } = {}) {
    var data = line_data.filter(function (d) {
        // need to fix in the dataset the year
        if (d.countryName == country) {
            return d;
        }
    });
    // data = data.map(function (d) {
    //     return {
    //         year: d.reportingYear,
    //         'TOC': d['TOC'],
    //         'Nitrogen': d['Nitrogen'],
    //         'Phosphorus': d['Phosphorus'],
    //         'Heavy metals (Cd, Hg, Ni, Pb)': d['Heavy metals (Cd, Hg, Ni, Pb)']
    //     }
    // });
    // console.log(line_data)

    // if(country == "EU"){
    //     y_max = 550000000
    // }else{
    //     y_max = 150000000
    // }

    y_line.domain([0, d3.max(data, function (d) {
        return Math.max(
            parseInt(d.Nitrogen),
            parseInt(d.Phosphorus),
            parseInt(d.TOC),
            parseInt(d['Heavy metals (Cd, Hg, Ni, Pb)']))
    })]);
    svg_line.selectAll(".y-axis").transition()
        .duration(1000)
        .call(yAxis);

    const u_n = svg_line.selectAll(".line_n")
        .data([data], function (d) { return d.reportingYear });

    const u_p = svg_line.selectAll(".line_p")
        .data([data], function (d) { return d.reportingYear });

    const u_t = svg_line.selectAll(".line_t")
        .data([data], function (d) { return d.reportingYear });

    const u_h = svg_line.selectAll(".line_h")
        .data([data], function (d) { return d.reportingYear });


    // Updata the line
    u_n
        .join("path")
        .attr("class", "line_n")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d.Nitrogen); }))
        .attr("fill", "none")
        .attr("stroke", "#e41a1c")
        .attr("stroke-width", 2.5)

    u_p
        .join("path")
        .attr("class", "line_p")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d.Phosphorus); }))
        .attr("fill", "none")
        .attr("stroke", "#377eb8")
        .attr("stroke-width", 2.5)

    u_t
        .join("path")
        .attr("class", "line_t")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d.TOC); }))
        .attr("fill", "none")
        .attr("stroke", "#4daf4a")
        .attr("stroke-width", 2.5)

    u_h
        .join("path")
        .attr("class", "line_h")
        .transition()
        .duration(3000)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear); })
            .y(function (d) { return y_line(d['Heavy metals (Cd, Hg, Ni, Pb)']); }))
        .attr("fill", "none")
        .attr("stroke", "#834aaf")
        .attr("stroke-width", 2.5)

    /*
    // update_line_chart
    // Add the line
    svg_line.append("path")
        .datum(line_data)
        .attr("fill", "none")
        .attr("stroke", "#e41a1c")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear) })
            .y(function (d) { return y_line(d['Nitrogen']) })
        )

    // Add the line
    svg_line.append("path")
        .datum(line_data)
        .attr("fill", "none")
        .attr("stroke", "#377eb8")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear) })
            .y(function (d) { return y_line(d['Phosphorus']) })
        )

    // Add the line
    svg_line.append("path")
        .datum(line_data)
        .attr("fill", "none")
        .attr("stroke", "#4daf4a")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear) })
            .y(function (d) { return y_line(d['TOC']) })
        )

    // Add the line
    svg_line.append("path")
        .datum(line_data)
        .attr("fill", "none")
        .attr("stroke", "#834aaf")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x_line(d.reportingYear) })
            .y(function (d) { return y_line(d['Heavy metals (Cd, Hg, Ni, Pb)']) })
        )*/
}