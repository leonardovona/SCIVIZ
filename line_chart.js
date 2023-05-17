// set the dimensions and margins of the graph
const margin_line = { top: 10, right: 30, bottom: 30, left: 60 },
    width_line = 460 - margin_line.left - margin_line.right,
    height_line = 400 - margin_line.top - margin_line.bottom;

// append the svg object to the body of the page
const svg_line = d3.select("#lineChart")
    .append("svg")
    .attr("width", width_line + margin_line.left + margin_line.right)
    .attr("height", height_line + margin_line.top + margin_line.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("./resources/2007_water_pollutants.csv",

    // When reading the csv, I must format variables:
    function (d) {
        console.log(d)
        return { year: d.year, value: d.TOC }
    }).then(

        // Now I can use this dataset:
        function (data) {

            // Add X axis --> it is a date format
            const x = d3.scaleTime()
                .domain(d3.extent(data, function (d) { return d.year; }))
                .range([0, width_line]);
                svg_line.append("g")
                .attr("transform", `translate(0, ${height_line})`)
                .call(d3.axisBottom(x));

            // Add Y axis
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return +d.value; })])
                .range([height_line, 0]);
                svg_line.append("g")
                .call(d3.axisLeft(y));

            // Add the line
            svg_line.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.year) })
                    .y(function (d) { return y(d.value) })
                )

        })