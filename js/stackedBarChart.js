//Stacked bar chart
var x_axis, y, subgroups, groups, pollutants_data, bars, color;

// set the dimensions and margins of the graph
const margin_sb = { top: 30, right: 0, bottom: 40, left: 80 },
    height_sb = 500 - margin_sb.top - margin_sb.bottom;

const stackedBarChartContainer = d3.select("#stackedBarChart")
const width_sb = stackedBarChartContainer.node().getBoundingClientRect().width - margin_sb.left - margin_sb.right

export function drawStackedBarChart() {



    // append the svg object to the body of the page
    const svg_sb = stackedBarChartContainer
        .classed("svg-container", true)
        .append("svg")
        .attr(
            "viewBox",
            `-${margin_sb.left} -${margin_sb.top} ${width_sb + margin_sb.left + margin_sb.right} ${height_sb + margin_sb.top + margin_sb.bottom}`
        )
        .attr("preserveAspectRatio", "xMinYMin meet")
        // .classed("svg-content-responsive", true)
        .attr("height", "100%")
        .append("g")

    // Add X axis
    x_axis = svg_sb.append("g")
        .attr("transform", "translate(0," + height_sb + ")")

    y = d3.scaleLinear()
        .domain([0, 190000000])
        .range([height_sb, 0]);

    // Not sure if goes here
    svg_sb.append("g")
        .call(d3.axisLeft(y));

    svg_sb.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -10)
        // .attr("y", 0)
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
        .range([0, width_sb])
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