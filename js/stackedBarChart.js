//Stacked bar chart
var x_axis, y, subgroups, groups, pollutants_data, bars, color;

// set the dimensions and margins of the graph
const margin = { top: 30, right: 0, bottom: 40, left: 80 },
    height = 320 - margin.top - margin.bottom;

const stackedBarChartContainer = d3.select("#stackedBarChart")
const width = stackedBarChartContainer.node().getBoundingClientRect().width - margin.left - margin.right

export function drawStackedBarChart() {

    // append the svg object to the body of the page
    const svg_sb = stackedBarChartContainer
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMinYMin meet")
        .classed("svg-content", true)
        // .attr("width", "84%")
        .append("g")

    // Add X axis
    x_axis = svg_sb.append("g")
        .attr("transform", "translate(0," + height + ")")

    y = d3.scaleLinear()
        .domain([0, 190000000])
        .range([height, 0]);

    // Not sure if goes here
    svg_sb.append("g")
        .call(d3.axisLeft(y));

    svg_sb.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -10)
        .attr("dy", ".15em")
        // .attr("transform", "rotate(-90)")
        .text("kg");

    bars = svg_sb.append("g").attr("class", "bars");

    // d3.csv("./resources/2007_water_pollutants.csv").then(function (data) {
    d3.csv("./resources/water_pollutants.csv").then(function (data) {
        pollutants_data = data;

        // List of subgroups = header of the csv files = soil condition here
        subgroups = pollutants_data.columns.slice(3)

        // color palette = one color per subgroup
        color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#834aaf'])

        // var keys = ["0 - 5", "5 - 10", "10 - 20", "20 - 40", "40 - 200"]

        // Usually you have a color scale in your chart already

        const svg_legend = d3.select("#stackedBarLegend")
            .append('svg')
            .attr(
                "viewBox",
                `-20 -20 350 350`
            )
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content", true)
            .append("g")

        let mouseOver = function (d) {
            console.log(d.srcElement.__data__[0])
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


        // Add one dot in the legend for each name.
        svg_legend.selectAll("mydots")
            .data(subgroups)
            .enter()
            .append("circle")
            .attr("cx", 10)
            .attr("cy", function (d, i) { return 20 + i * 40 }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 10)
            .style("fill", function (d) { return color(d) })
            .attr("class", "legend-dot-stacked-bar")
            .attr("id", function (d) { return "legend-dot-stacked-bar-" + d[0] })
            .attr("cursor", "pointer")
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)

        // let mouseOverText = function (d) {
        //     d3.selectAll(".legend-text-stacked-bar")
        //         .transition()
        //         .duration(200)
        //         .style("opacity", .5)
        //     // .style("stroke", "transparent")
        //     d3.select(this)
        //         .transition()
        //         .duration(200)
        //         .style("opacity", 1)
        //     // .style("stroke", "black")
        // }

        // let mouseLeaveText = function (d) {
        //     d3.selectAll(".legend-text-stacked-bar")
        //         .transition()
        //         .duration(200)
        //         .style("opacity", 1)
        //     // .style("stroke", "transparent")
        // }

        // Add one dot in the legend for each name.
        svg_legend.selectAll("mylabels")
            .data(subgroups)
            .enter()
            .append("text")
            .attr("x", 30)
            .attr("y", function (d, i) { return 20 + i * 40 }) // 100 is where the first dot appears. 25 is the distance between dots
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
                updateStackedBarChart({ pollutant: d.srcElement.__data__ })
            })

        // console.log(stackedData)
        updateStackedBarChart()
    })
}

export function updateStackedBarChart({ pollutant = "Total", year = "2019" } = {}) {
    var data_year = pollutants_data.filter(function (d) {
        if (d.reportingYear == year && d.countryName != "EU") {
            return d;
        }
    });

    data_year = data_year.map(function (d) {
        return {
            Total: d.Total,
            countryName: d.countryName,
            Nitrogen: d.Nitrogen,
            Phosphorus: d.Phosphorus,
            TOC: d.TOC,
            'Heavy metals (Cd, Hg, Ni, Pb)': d['Heavy metals (Cd, Hg, Ni, Pb)']
        }
    });

    data_year.sort(function (b, a) {
        var res = parseFloat(a[pollutant]) - parseFloat(b[pollutant])
        return (isNaN(res) ? 0 : res);
    })

    groups = data_year.map(d => (d.countryName));

    var EU_index = groups.indexOf("EU");
    if (EU_index !== -1) {
        groups.splice(EU_index, 1);
    }

    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])

    x_axis
        .transition().duration(1000)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    //stack the data? --> stack per subgroup
    const stackedData = d3.stack()
        .keys(subgroups)
        // .order(d3.stackOrderDescending)
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