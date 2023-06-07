/*
Leonardo Vona
SCIVIZ Project 22/23

Map visualizing the water scarcity conditions in the EU countries
*/

import { EU_members, click, selectedCountry } from "./main.js"

// set the dimensions and margins of the map
const margin = { top: 80, right: 0, bottom: 80, left: 10 },
    height = 600 - margin.top - margin.bottom,
    width = 1200;

var data = new Map() // data to be visualized

var color, // color scale
    svg, // svg object containing the chart
    path, projection, // map elements
    tooltip; // tooltip object visualizing the WEI+ value

export function drawMap() {
    // append the svg object
    svg = d3.select("#map")
        .append("svg")
        .attr(
            "viewBox",
            `-${margin.left} -${margin.top} ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )   // The viewbox attribute allows to stretch the svg to the div size making it responsive
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("height", "88%") // The height and width attributes limit the svg size to the one of the div container
        .attr("width", "100%")
        .classed("svg-content", true)

    // Add title
    svg.append("text")
        .text("Water scarcity conditions (WEI+)")
        .attr("x", 15)
        .attr("y", -30)
        .attr("font-size", "1.5em")
        .attr("font-weight", "bold")

    // Create color scale
    color = d3.scaleThreshold()
        .domain([0.01, 5, 10, 20, 40, 200])
        .range(['#EBEDEF',"#fcae91","#fb6a4a","#de2d26","#a50f15"])

    // Map and projection
    path = d3.geoPath();
    projection = d3.geoMercator()
        .scale(420)
        .center([10, 55])
        .translate([width / 2, height / 2]);
    
    // Legend values
    var keys = ["< 5%", "5 - 10%", "10 - 20%", "20 - 40%", "> 40%"]
    
    // Add legend dots
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
    
    // Add legend labels
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

    // Add tooltip
    tooltip = d3.select("#map")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")

    // Load external data
    Promise.all([
        d3.json("./resources/europe.geojson"),
        d3.csv("./resources/wei.csv")]).then(function (loadData) {
            // Map topology data
            let topo = loadData[0]

            // WEI+ data
            let wei = loadData[1]


            wei.forEach(function (d) {
                data.set(d.ID, d)
            })

            // Event handler for mouse over a country
            let mouseOver = function (d) {
                // If the country is an EU member highlight it and show the tooltip
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

            // Event handler for mouse movement
            let mouseMove = function (d) {
                // If the country is an EU member update values to the tooltip
                if (EU_members.includes(d.srcElement.__data__.properties.ID)) {
                    tooltip
                        .html(d.srcElement.__data__.properties.NAME + ": " + d.srcElement.__data__.total)
                        .style("left", (d.clientX + 20) + "px")
                        .style("top", (d.clientY) + "px")
                }
            }

            // Event handler for mouse leaving a country
            let mouseLeave = function (d) {
                // If the country is an EU member remove the highlight and hide the tooltip
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
                // Add event handlers
                .on("mouseover", mouseOver)
                .on("mousemove", mouseMove)
                .on("mouseleave", mouseLeave)
                .on("click", click)

            updateMap("2019")
        })
}

export function updateMap(year) {
    // Update the map with the new year values
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