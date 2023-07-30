// scenefour.js
document.addEventListener('DOMContentLoaded', function () {
  // Loaddata
  Promise.all([
    d3.csv('fourthscene.csv'),
    d3.json('countries-50m.json')
  ]).then(([data, worldData]) => {
    
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(data.map(d => d.region));

    
    const svg = d3.select('#scatterplot-container')
      .append('svg')
      .attr('width', 1300)
      .attr('height', 900);

    const projection = d3.geoMercator()
      .scale(160)
      .translate([(svg.attr('width') / 2), (svg.attr('height') / 1.4)-60]);

    const path = d3.geoPath().projection(projection);

    const countries = topojson.feature(worldData, worldData.objects.countries).features;

    
    const countriesWithData = countries.map(country => {
      const countryData = data.find(d => d.country === country.properties.name);
      return {
        ...country,
        ...countryData
      };
    });

    // Draw map
    svg.selectAll('.country')
  .data(countriesWithData)
  .enter()
  .append('path')
  .attr('class', 'country')
  .attr('d', path)
  .style('fill', d => d.region ? colorScale(d.region) : 'black') // Color code based on "region" column
  .on('mouseover', function (event, d) {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background-color", "black")
      .style("color", "white")
      .style("padding", "6px")
      .style("border", "1px solid #fff")
      .style("font-size", "12px")
      .style("font-family", "Arial")
      .style("border-radius", "8px");

    tooltip.html(`
      <p><strong>Country:</strong> ${d.country}</p>
      <p><strong>Income Group:</strong> ${d.incomegroup || 'Information not available'}</p>
      <p><strong>Infant Mortality Rate (per 1,000 births):</strong> ${d.rateperthousand || 'Information not available'}</p>
    `);

    // Tooltip position
    const tooltipWidth = parseInt(tooltip.style("width"));
    const tooltipHeight = parseInt(tooltip.style("height"));
    const xPosition = event.pageX - tooltipWidth / 2;
    const yPosition = event.pageY - tooltipHeight - 50;
    tooltip.style("left", `${xPosition}px`).style("top", `${yPosition}px`);
  })
  .on('mouseout', function () {
    d3.selectAll('.tooltip').remove(); 
  });


///////////////////////////////LEGEND
    const legendWidth = 140;
    const legendHeight = 150;
    const legendX = 1000;
    const legendY = 30;

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX},${legendY})`);

    const legendRectSize = 18;
    const legendSpacing = 4;

    const legendItems = legend.selectAll('.legend-item')
      .data(colorScale.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing)})`);

    legendItems.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', colorScale);

    legendItems.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(d => d)
      .style('font-size', '12px')
      .style('fill', 'black');



  });
});
