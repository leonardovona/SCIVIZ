const mapContainer = d3.select("#map")
const width_map = mapContainer.node().getBoundingClientRect().width
// const width_map = 600
const height_map = 550

var svg_map = d3.select("#map")
    .append("svg")
    .attr(
        "viewBox",
        `0 0 ${width_map} ${height_map}`
    )
    .attr("height", "100%")
    // .attr("preserveAspectRatio", "none")
    .attr("preserveAspectRatio", "xMinYMin meet")
    // .classed("svg-content-responsive", true)

var colorScale = d3.scaleThreshold()
    .domain([0.01, 1, 2, 4, 8, 16, 32])
    .range(d3.schemeReds[7]);

const data = new Map()
// Create a function that takes a dataset as input and update the plot:

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(420)
    .center([13, 55])
    .translate([width_map / 2, height_map / 2]);

// Data and color scale


var tooltip = d3.select("#map")
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
            .attr("class", function (d) { return "Country" })
            .style("opacity", 1)
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave)

        handle_update("2019")


    })

function handle_update(year) {
    d3.selectAll(".Country")
        .transition()
        .duration(1000)
        .attr("fill", function (d) {
            country = data.get(d.properties.ID)
            if (country !== undefined) {
                d.total = country[year]
            } else {
                d.total = 0
            }
            return colorScale(d.total);
        })
}