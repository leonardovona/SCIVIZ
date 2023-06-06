import { EU_members, click, selectedCountry } from "./main.js"

const margin = { top: 80, right: 0, bottom: 80, left: 10 },
    height = 600 - margin.top - margin.bottom;

const width = 1200

var data = new Map()

var color, svg, path, projection, tooltip

export function drawMap() {
    svg = d3.select("#map")
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("height", "88%")
        .attr("width", "100%")
        .classed("svg-content", true)

    svg.append("text")
        .text("Water scarcity conditions (WEI+)")
        .attr("x", 15)
        .attr("y", -30)
        .attr("font-size", "1.5em")
        .attr("font-weight", "bold")

    color = d3.scaleThreshold()
        .domain([0.01, 5, 10, 20, 40, 200])
        .range(['#EBEDEF',"#fcae91","#fb6a4a","#de2d26","#a50f15"])
        // .range(d3.schemeReds[5]);
        // .range(['#f8f1ff', '#d1e5f0', '#fddbc7', '#ef8a62', '#b2182b']) // reverse scheme RdBu

    // Map and projection
    path = d3.geoPath();
    projection = d3.geoMercator()
        .scale(420)
        .center([10, 55])
        .translate([width / 2, height / 2]);

    var keys = ["< 5%", "5 - 10%", "10 - 20%", "20 - 40%", "> 40%"]

    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 40)
        .attr("cy", function (d, i) { return 320 + i * 25 })
        .attr("r", 7)
        .style("fill", function (d) {
            if (d[0] == '<')
                return color(0.01)
            if (d[0] == '>')
                return color(50)
            return color(parseInt(d.slice(0, 2)) + 0.1)
        })

    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 60)
        .attr("y", function (d, i) { return 320 + i * 25 })
        .style("fill", function (d) {
            if (d[0] == '<')
                return color(0.01)
            if (d[0] == '>')
                return color(50)
            return color(parseInt(d.slice(0, 2)) + 0.1)
        })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    tooltip = d3.select("#map")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")

    // Load external data and boot
    Promise.all([
        d3.json("./resources/europe.geojson"),
        d3.csv("./resources/wei.csv")]).then(function (loadData) {
            let topo = loadData[0]

            let wei = loadData[1]

            wei.forEach(function (d) {
                data.set(d.ID, d)
            })

            let mouseOver = function (d) {
                if (EU_members.includes(d.srcElement.__data__.properties.ID)) {
                    d3.selectAll(".Country")
                        .transition()
                        .duration(200)
                        .style("opacity", .5)
                        .style("stroke", "transparent")
                    if (selectedCountry != null) {
                        d3.select(selectedCountry)
                            .transition()
                            .duration(200)
                            .style("opacity", 1)
                            .style("stroke", "black")
                    }
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", 1)
                        .style("stroke", "black")
                    tooltip
                        .transition()
                        .duration(300)
                        .style("opacity", 1)

                }
            }

            let mouseMove = function (d) {
                if (EU_members.includes(d.srcElement.__data__.properties.ID)) {
                    tooltip
                        .html(d.srcElement.__data__.properties.NAME + ": " + d.srcElement.__data__.total)
                        .style("left", (d.clientX + 20) + "px")
                        .style("top", (d.clientY) + "px")
                }
            }

            let mouseLeave = function (d) {
                if (EU_members.includes(d.srcElement.__data__.properties.ID)) {
                    if (selectedCountry == null) {
                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", 1)
                            .style("stroke", "transparent")
                    } else {
                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", .5)
                            .style("stroke", "transparent")
                        d3.select(selectedCountry)
                            .transition()
                            .duration(200)
                            .style("opacity", 1)
                            .style("stroke", "black")
                    }
                    tooltip.transition().duration(300)
                        .style("opacity", 0)

                }
            }

            // Draw the map
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "transparent")
                .attr("class", "Country")
                .style("opacity", 1)
                .on("mouseover", mouseOver)
                .on("mousemove", mouseMove)
                .on("mouseleave", mouseLeave)
                .on("click", click)

            updateMap("2019")


        })
}

export function updateMap(year) {
    d3.selectAll(".Country")
        .transition()
        .duration(1000)
        .attr("fill", function (d) {
            const country = data.get(d.properties.ID)
            if (country !== undefined) {
                d.total = country[year]
            } else {
                d.total = 0
            }
            return color(d.total);
        })
}