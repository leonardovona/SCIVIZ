// set the dimensions and margins of the graph

const margin_line = { top: 10, right: 50, bottom: 40, left: 40 },
    // width_line = 550 ,
    height_line = 400 - margin_line.top - margin_line.bottom;

const lineChartContainer = d3.select("#lineChart")
const width_line = lineChartContainer.node().getBoundingClientRect().width - margin_line.left - margin_line.right

// append the svg object to the body of the page
const svg_line = lineChartContainer
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
        data = data.filter(function (d) {
            // need to fix in the dataset the year
            if (d.countryName == "EU" && d.reportingYear <= 2019) {
                return d;
            }
        });
        data = data.map(function (d) {
            return {
                year: d.reportingYear,
                'TOC': d['TOC'],
                'Nitrogen': d['Nitrogen'],
                'Phosphorus': d['Phosphorus'],
                'Heavy metals (Cd, Hg, Ni, Pb)': d['Heavy metals (Cd, Hg, Ni, Pb)']
            }
        });

        // Add X axis --> it is a date format
        const x = d3.scaleTime()
            .domain(d3.extent(data, function (d) { return d.year; }))
            .range([0, (width_line - margin_line.right)]);
        svg_line.append("g")
            .attr("transform", `translate(0, ${height_line})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 550000000])
            //.domain([0, d3.max(data, function (d) { return +d['TOC']; })])
            .range([height_line, 0]);
        svg_line.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        svg_line.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#e41a1c")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.year) })
                .y(function (d) { return y(d['Nitrogen']) })
            )

        // Add the line
        svg_line.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#377eb8")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.year) })
                .y(function (d) { return y(d['Phosphorus']) })
            )

        // Add the line
        svg_line.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#4daf4a")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.year) })
                .y(function (d) { return y(d['TOC']) })
            )

        // Add the line
        svg_line.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#834aaf")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.year) })
                .y(function (d) { return y(d['Heavy metals (Cd, Hg, Ni, Pb)']) })
            )

    })