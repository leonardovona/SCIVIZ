// set the dimensions and margins of the graph
const margin_line = { top: 15, right:40, bottom: 50, left: 40 },
    // width_line = 550 ,
    height_line = 400 - margin_line.top - margin_line.bottom;

const lineChartContainer = d3.select("#lineChart")
const width_line = lineChartContainer.node().getBoundingClientRect().width - margin_line.left - margin_line.right

var line_data;
var x_line, y_line, yAxis;
var svg_line

export function drawLineChart() {


    // append the svg object to the body of the page
    svg_line = lineChartContainer
        .append("svg")
        .attr(
            "viewBox",
            `-${margin_line.left} -${margin_line.top} ${width_line + margin_line.left + margin_line.right} ${height_line + margin_line.top + margin_line.bottom}`
        )
        .attr("height", "100%")
        // .attr("preserveAspectRatio", "xMinYMin meet")
        // .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform", `translate(${margin_line.left},${margin_line.top})`);

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
                .range([0, (width_line - margin_line.right)]);

            svg_line.append("g")
                .attr("transform", `translate(0, ${height_line})`)
                .call(d3.axisBottom(x_line));

            svg_line.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width_line)
                .attr("y", height_line)
                .text("Year");


            // Add Y axis
            y_line = d3.scaleLinear()
                .domain([0, 550000000])
                //.domain([0, d3.max(data, function (d) { return +d['TOC']; })])
                .range([height_line, 0]);

            yAxis = d3.axisLeft(y_line);

            svg_line.append("g")
                // .call(d3.axisLeft(y_line))
                .attr("class", "y-axis");

            svg_line.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("x", -10)
                // .attr("y", 0)
                .attr("dy", "-.30em")
                // .attr("transform", "rotate(-90)")
                .text("kg");

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