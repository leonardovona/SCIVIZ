/*
Leonardo Vona
SCIVIZ Project 22/23

Main js file
*/

import { drawMap, updateMap } from './map.js';
import { drawStackedBarChart, updateStackedBarChart } from './stackedBarChart.js';
import { drawGroupedBarChart, updateGroupedBarChart } from './groupedBarChart.js';
import { drawLineChart, updateLineChart } from './lineChart.js';

export var selectedCountry = null // null = EU

// EU countries IDs
export const EU_members = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES",
    "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"]

// Event listener for the map
export function click(d) {
    if (EU_members.includes(d.srcElement.__data__.properties.ID)) { // if the clicked country is an EU member
        if (selectedCountry == d.srcElement) { // if the clicked country is the selected one reset to EU
            document.getElementById("country").value = "EU"
            updateLineChart({ country: "EU" })
            updateGroupedBarChart({ country: "EU" })
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "transparent")
            selectedCountry = null
        } else { // if the clicked country is not the selected one change the selected country and update
            document.getElementById("country").value = d.srcElement.__data__.properties.NAME
            updateLineChart({ country: d.srcElement.__data__.properties.ID })
            updateGroupedBarChart({ country: d.srcElement.__data__.properties.ID })
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 0.5)
                .style("stroke", "transparent")
            d3.select(d.srcElement)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
            selectedCountry = d.srcElement
        }       
    }
}

drawMap(); // draw the map
drawGroupedBarChart(); // draw the grouped bar chart
drawLineChart(); // draw the line chart
drawStackedBarChart(); // draw the stacked bar chart

// Event listener for the year slider
const value = document.querySelector("#year")
const input = document.querySelector("#year_input")
value.textContent = input.value
input.addEventListener("input", (event) => {
    value.textContent = event.target.value // update the displayed value
    updateMap(event.target.value)        // update the map
    updateStackedBarChart({ year: event.target.value }) // update the stacked bar chart
})