/*
Leonardo Vona
SCIVIZ Project 22/23

Stacked Bar Chart visualizing the water pollutants in the EU countries
*/

// set the dimensions and margins of the graph
const margin = { top: 30, right: 0, bottom: 40, left: 45 },
    height = 320 - margin.top - margin.bottom;

const stackedBarChartContainer = d3.select("#stackedBarChart") // select the div container
const width = 600 - margin.left - margin.right

var x_axis, // x axis object
    y, // y axis values
    subgroups, // pollutants
    groups, // countries
    pollutants_data, // data to be visualized
    bars, // bars object
    color; // color scale


export function drawStackedBarChart() {
    // append the svg object
    const svg = stackedBarChartContainer
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )  // The viewbox attribute allows to stretch the svg to the div size making it responsive
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("height", "100%") // The height and width attributes limit the svg size to the one of the div container
        .attr("width", "100%")
        .classed("svg-content", true)
        .append("g")

    // Add X axis
    x_axis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")

    // Add Y axis
    y = d3.scaleLinear()
        .domain([0, 0.8])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Create bars group
    bars = svg.append("g").attr("class", "bars");
    
    // Read the data
    d3.csv("./resources/water_pollutants.csv").then(function (data) {
        pollutants_data = data;

        // pollutants
        subgroups = pollutants_data.columns.slice(3)

        // create color scale
        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeCategory10);

        // Create legend
        const svg_legend = d3.select("#stackedBarLegend")
            .append('svg')
            .attr(
                "viewBox",
                `-20 -20 290 290`
            )
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content", true)
            .append("g")
            
        // Event handlers for the legend
        let mouseOver = function (d) {
            d3.selectAll(".legend-dot-stacked-bar")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select("#legend-dot-stacked-bar-" + d.srcElement.__data__[0])
                .transition()
                .duration(200)
                .style("opacity", 1)
            d3.selectAll(".legend-text-stacked-bar")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select("#legend-text-stacked-bar-" + d.srcElement.__data__[0])
                .transition()
                .duration(200)
                .style("opacity", 1)
        }

        let mouseLeave = function (d) {
            d3.selectAll(".legend-dot-stacked-bar")
                .transition()
                .duration(200)
                .style("opacity", 1)
            d3.selectAll(".legend-text-stacked-bar")
                .transition()
                .duration(200)
                .style("opacity", 1)
        }

        // Add legend dots
        svg_legend.selectAll("mydots")
            .data(subgroups)
            .enter()
            .append("circle")
            .attr("cx", 10)
            .attr("cy", function (d, i) { return 20 + i * 40 })
            .attr("r", 10)
            .style("fill", function (d) { return color(d) })
            .attr("class", "legend-dot-stacked-bar")
            .attr("id", function (d) { return "legend-dot-stacked-bar-" + d[0] })
            .attr("cursor", "pointer")
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
            .on("click", function (d) {
                updateStackedBarChart({ pollutant: d.srcElement.__data__, year: document.querySelector("#year_input").value })
            })
        
        // Add legend values
        svg_legend.selectAll("mylabels")
            .data(subgroups)
            .enter()
            .append("text")
            .attr("x", 30)
            .attr("y", function (d, i) { return 20 + i * 40 })
            .style("fill", function (d) { return color(d) })
            .text(function (d) { return d })
            .attr("class", "legend-text-stacked-bar")
            .attr("id", function (d) { return "legend-text-stacked-bar-" + d[0] })
            .attr("cursor", "pointer")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
            .on("click", function (d) {
                updateStackedBarChart({ pollutant: d.srcElement.__data__, year: document.querySelector("#year_input").value })
            })

        updateStackedBarChart()
    })
}

export function updateStackedBarChart({ pollutant = "Total", year = "2019" } = {}) {
    // filter the data to get only the year and pollutant of interest
    var data_year = pollutants_data.filter(function (d) {
        if (d.reportingYear == year && d.countryName != "EU") {
            return d;
        }
    });

    // sort the data by pollutant value
    data_year.sort(function (b, a) {
        var res = parseFloat(a[pollutant]) - parseFloat(b[pollutant])
        return (isNaN(res) ? 0 : res);
    })

    // countries
    groups = data_year.map(d => (d.countryName));

    // remove EU from the countries
    var EU_index = groups.indexOf("EU");
    if (EU_index !== -1) {
        groups.splice(EU_index, 1);
    }

    // X axis values
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])

    // Update X axis
    x_axis
        .transition().duration(1000)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    const stackedData = d3.stack()
        .keys(subgroups)
        // order the stacked bars
        .order(series => {
            if (pollutant == "Total") {
                return d3.stackOrderDescending(series);
            } else {
                let n = series.length;
                const o = new Array(n);
                let i = 0;
                while (i < n && series[i].key != pollutant) {
                    i++;
                }
                o[0] = i;
                let j = 0, k = 1;
                while (j < n) {
                    if (j != i) {
                        o[k++] = j;
                    }
                    j++;
                }
                return o;
            }
        })
        (data_year)

    // Update bars
    bars
        .selectAll("g")
        .data(stackedData)
        .join(
            enter => enter
                .append("g")
                .attr("fill", d => color(d.key)),
            null,
            exit => {
                exit
                    .transition()
                    .duration(500)
                    .style("fill-opacity", 0)
                    .remove();
            }
        ).selectAll("rect")
        .data(d => d, d => d.data.countryName)
        .join(
            enter => enter
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => {
                    return x(d.data.countryName);
                })
                .attr("y", d => y(d[1]))
                .attr("width", x.bandwidth())
                .attr("heigth", d => y(d[0]) - y(d[1])),
            null,
            exit => {
                exit
                    .transition()
                    .duration(500)
                    .style("fill-opacity", 0)
                    .remove();
            }
        )
        .transition(d3.transition().duration(1000))
        .delay((d, i) => i * 20)
        .attr("x", d => x(d.data.countryName))
        .attr("y", d => {
            return y(d[1]);
        })
        .attr("width", x.bandwidth())
        .attr("height", d => {
            return y(d[0]) - y(d[1]);
        });
}