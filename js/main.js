import { drawMap, updateMap } from './map.js';
import { drawStackedBarChart, updateStackedBarChart } from './stackedBarChart.js';
import { drawGroupedBarChart, updateGroupedBarChart } from './groupedBarChart.js';
import { drawLineChart, updateLineChart } from './lineChart.js';

export const EU_members = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES",
    "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"]

export function click(d) {
    if (EU_members.includes(d.srcElement.__data__.properties.ID)) {
        document.getElementById("country").value = d.srcElement.__data__.properties.NAME
        updateLineChart({ country: d.srcElement.__data__.properties.ID })
        updateGroupedBarChart({ country: d.srcElement.__data__.properties.ID })
    }
}

drawMap();
drawGroupedBarChart();

drawLineChart();

drawStackedBarChart();

const value = document.querySelector("#year")
const input = document.querySelector("#year_input")
value.textContent = input.value
input.addEventListener("input", (event) => {
    value.textContent = event.target.value
    updateMap(event.target.value)
    updateStackedBarChart({ year: event.target.value })
})