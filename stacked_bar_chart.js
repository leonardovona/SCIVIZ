//Stacked bar chart

// set the dimensions and margins of the graph
const margin_sb = { top: 10, right: 30, bottom: 20, left: 70 },
    width_sb = 600 - margin_sb.left - margin_sb.right,
    height_sb = 400 - margin_sb.top - margin_sb.bottom;

// append the svg object to the body of the page
const svg_sb = d3
    .select("#stackedBarChart")
    .classed("svg-container", true)
    .append("svg")
    .attr("class", "chart")
    .attr("height", "50%")
    .attr("width", "50%")
    .attr(
        "viewBox",
        `0 0 ${width_sb + margin_sb.left + margin_sb.right} ${height_sb + margin_sb.top + margin_sb.bottom}`
    )
    .attr("preserveAspectRatio", "xMinYMin meet")
    .classed("svg-content-responsive", true)
    .append("g")

// Add X axis
x_axis = svg_sb.append("g")
    .attr("transform", "translate(0," + height_sb + ")")

y = d3.scaleLinear()
    .domain([0, 170000000])
    .range([height_sb, 0]);

// Not sure if goes here
svg_sb.append("g")
    .call(d3.axisLeft(y));

var bars = svg_sb.append("g").attr("class", "bars");

var groups;
var pollutants_data;
d3.csv("./resources/2007_water_pollutants.csv").then(function (data) {
    pollutants_data = data;

    // List of subgroups = header of the csv files = soil condition here
    subgroups = pollutants_data.columns.slice(1)

    // color palette = one color per subgroup
    color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#834aaf'])

    // console.log(stackedData)
    update_sb()
})

function update_sb(pollutant = "all") {
    pollutants_data.sort(function (b, a) {
        if (pollutant == "all") {
            a_nitrogen = parseFloat(a.Nitrogen) || 0;
            a_phosphorus = parseFloat(a.Phosphorus) || 0;
            a_toc = parseFloat(a.TOC) || 0;
            a_heavymetals = parseFloat(a['Heavy metals (Cd, Hg, Ni, Pb)']) || 0;

            b_nitrogen = parseFloat(b.Nitrogen) || 0;
            b_phosphorus = parseFloat(b.Phosphorus) || 0;
            b_toc = parseFloat(b.TOC) || 0;
            b_heavymetals = parseFloat(b['Heavy metals (Cd, Hg, Ni, Pb)']) || 0;

            return (a_nitrogen + a_phosphorus + a_toc + a_heavymetals) - (b_nitrogen + b_phosphorus + b_toc + b_heavymetals)
        } else {
            return parseFloat(a[pollutant]) - parseFloat(b[pollutant])
        }
    })

    groups = pollutants_data.map(d => (d.countryName));

    x = d3.scaleBand()
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
            if(pollutant == "all") {
                return d3.stackOrderDescending(series);
            } else {
                let n = series.length;
                const o = new Array(n);
                let i = 0;
                while(i < n && series[i].key != pollutant){
                    i++;
                }
                o[0] = i;
                let j = 0, k = 1;
                while(j < n){
                    if(j != i) {
                        o[k++] = j;
                    }
                    j++;
                }
                return o;
            }
        })
        (pollutants_data)


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