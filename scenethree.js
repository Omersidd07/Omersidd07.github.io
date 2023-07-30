//loadingdata
d3.csv("thirdscene.csv").then(function(data) {
  
  data.forEach(function(d) {
    d3.range(2000, 2023).forEach(function(year) {
      d[year] = +d[year];
    });
  });


  var countries = [...new Set(data.map(d => d.country))];


  var countrySelector = d3.select("#country-selector");
  countrySelector.selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .text(d => d);

  var selectedCountry = countries[0];

  var margin = {top: 50, right: 50, bottom: 30, left: 50};
var width = 1200 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

  var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top+10) + ")");


  var xScale = d3.scaleLinear()
    .domain([2000, 2022])
    .range([0, width]);

  var yScale = d3.scaleLinear()
    .domain([0, 100]) 
    .range([height, 0]);

  var line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.percent));


   
var xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.format("d"));



svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);


var yAxis = d3.axisLeft(yScale)
  .tickFormat(d => d + "%");

svg.append("g")
  .attr("class", "y-axis")
  .call(yAxis);


  ///////////////////////LABELS
//   // Create the y-axis label
// svg.append("text")
//   .attr("class", "axis-label")
//   .style("font-family", "Arial")
//   .style("fill", "black")
//   .attr("transform", "rotate(-90)")
//   .attr("x", (-height / 2))
//   .attr("y", (-margin.left + 20)-3)
//   .style("text-anchor", "middle")
//   .text("Percentage of People w/ Basic Sanitation Services");

// // Create the x-axis label
// svg.append("text")
// .attr("class", "annotation")
//   .style("font-family", "Arial")
//   .style("fill", "black")
//   .attr("class", "axis-label")
//   .attr("x", width / 2)
//   .attr("y", height + margin.bottom - 10)
//   .style("text-anchor", "middle")
//   .text("Year (2000-2022)");



  /////////////////////////



  
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function updateChart(selectedCountry) {
  var filteredData = data.filter(d => d.country === selectedCountry);

  /////////////////////LINE CHART
  var countryLine = svg.selectAll(".country-line")
    .data([filteredData], d => d[0].country);

  countryLine.enter()
    .append("path")
    .attr("class", "country-line")
    .attr("fill", "none")
    .attr("stroke", d => colorScale(d[0].region)) 
    .attr("stroke-width", 2)
    .merge(countryLine)
    .transition()
    .duration(1000) 
    .attrTween("d", function (d) {
      var previousLine = d3.select(this).attr("d");
      var currentData = d3.range(2000, 2023).map(year => ({ year: year, percent: d[0][year] }));
      var currentLine = line(currentData);

      
      if (!previousLine) {
        return d3.interpolateString("", currentLine);
      }

      return d3.interpolatePath(previousLine, currentLine);
    });

  countryLine.exit().remove();

  /////////////////////dots

  
  var dots = svg.selectAll(".data-point")
    .data(filteredData.flatMap(d => d3.range(2000, 2023).map(year => ({ year: year, percent: d[year], region: d.region }))), d => d.year);

  
  dots.enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("r", 4)
    .merge(dots) 
    .transition()
    .duration(1500) 
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.percent))
    .attr("fill", d => colorScale(d.region)); 

  
  dots.exit().remove();

/////////////////////ANNOTATION


var annotation = svg.selectAll(".annotation")
  .data([filteredData[0]]);



annotation.enter()
  .append("text")
  .attr("class", "annotation")
  .style("font-family", "Arial")
  .style("fill", "gray")
  .attr("text-anchor", "end")
  .merge(annotation)
  .text(d => `Country: ${d.country}`)
  .attr("x", 900) 
  .attr("dy", "1.2em") 
  .append("tspan")
  .text(d => `2022: ${d[2022].toFixed(2)}% of People w/`)
  .attr("x", 1100) 
  .attr("dy", "1.2em") 
  .append("tspan")
  .text(d => `Basic Sanitization Services`)
  .attr("x", 1100) 
  .attr("dy", "1.2em") 
  .append("tspan")
  .text(d => `Income Group: ${d.incomegroup}`)
  .attr("x", 1100) 
  .attr("dy", "1.2em"); 
  
  





var lastDataPoint = filteredData[0][2022];
var xPosition = xScale(2022)+200;
var yPosition = yScale(lastDataPoint)+100;



if (xPosition > width - 200) {
  xPosition -= 200;
}


if (yPosition > height - 100) {
  yPosition -= 100;
}

if (lastDataPoint < 20) {

  yPosition -= 180;
}


svg.select(".annotation")
  .attr("x", xPosition)
  .attr("y", yPosition);




annotation.exit().remove();

   


}



  svg.select(".x-axis")
    .call(xAxis);

  svg.select(".y-axis")
    .call(yAxis);

  updateChart(selectedCountry);

  countrySelector.on("change", function() {
    selectedCountry = this.value;
    updateChart(selectedCountry);
  });
});
