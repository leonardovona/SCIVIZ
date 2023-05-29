import { EU_members, click } from "./main.js"

const mapContainer = d3.select("#map")

const margin = { top: 150, right: 0, bottom: 80, left: 10 },
    height = 600 - margin.top - margin.bottom;

const width = 1000
// const width = mapContainer.node().getBoundingClientRect().width - - margin.left - margin.right;
// const width_map = 600

var data = new Map()

var colorScale, svg_map, path, projection, tooltip

export function drawMap() {
    svg_map = d3.select("#map")
        .append("svg")
        .attr(
            "viewBox",
            // '0 0 100 100'
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        // .attr("height", "100%")
        // .attr("width", "70%")
        // .attr("preserveAspectRatio", "none")
        .attr("preserveAspectRatio", "xMinYMin meet")
    // .classed("svg-content-responsive", true)

    svg_map.append("text")
        .text("Water scarcity conditions (WEI+)")
        .attr("x", 15)
        .attr("y", -97)
        .attr("font-size", "1.5em")
        .attr("font-weight", "bold")

    colorScale = d3.scaleThreshold()
        .domain([0.01, 5, 10, 20, 40, 200])
        .range(d3.schemeReds[6]);


    // Create a function that takes a dataset as input and update the plot:

    // Map and projection
    path = d3.geoPath();
    projection = d3.geoMercator()
        .scale(420)
        .center([10, 55])
        .translate([width / 2, height / 2]);

    // Data and color scale

    // var legend = d3.legendColor()
    //     .scale(colorScale);

    // svg_map.append("g")
    //     .attr("transform", "translate(40,350)")
    //     .call(legend);

    // create a list of keys
    var keys = ["< 5%", "5 - 10%", "10 - 20%", "20 - 40%", "> 40%"]

    // Usually you have a color scale in your chart already

    // Add one dot in the legend for each name.
    svg_map.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 40)
        .attr("cy", function (d, i) { return 280 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function (d) { 
            if(d[0] == '<')
                return colorScale(0.01)
            if(d[0] == '>')
                return colorScale(50)
            return colorScale(parseInt(d.slice(0,2)) + 0.1) 
        })
        

    // Add one dot in the legend for each name.
    svg_map.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 60)
        .attr("y", function (d, i) { return 280 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { 
            if(d[0] == '<')
                return colorScale(0.01)
            if(d[0] == '>')
                return colorScale(50)
            return colorScale(parseInt(d.slice(0,2)) + 0.1) 
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
                    d3.selectAll(".Country")
                        .transition()
                        .duration(200)
                        .style("opacity", 1)
                        .style("stroke", "transparent")
                    tooltip.transition().duration(300)
                        .style("opacity", 0)
                }
            }

            // Draw the map
            svg_map.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "transparent")
                .attr("class", "Country" )
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
            return colorScale(d.total);
        })
}