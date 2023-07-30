// SVG size
const width = 1200; //width
const height = 900; //height
const margin = { top: 100, right: 170, bottom: 100, left: 110 }; //margins
const svg = d3.select("#scatterplot-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.csv("secondscene.csv").then(data => {
 
  data.forEach(d => {
    d.population = +d.population;
    d.malariaperthousand = +d.malariaperthousand;
  });

  // Filter out outliers like China and India for x-axis range
  const filteredData = data.filter(d => d.country !== "China" && d.country !== "India");

  // Scales for x, y, and circle size
  const xScale = d3.scaleLog() // Change to logarithmic scale
    .domain(d3.extent(filteredData, d => d.population))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.malariaperthousand))
    .range([height - margin.bottom, margin.top]);

  const circleSizeScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.population))
    .range([5, 37]); // BUBBLE SIZE

  
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(data.map(d => d.region));

  
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.population))
    .attr("cy", d => yScale(d.malariaperthousand))
    .attr("r", d => circleSizeScale(d.population))
    .attr("fill", d => colorScale(d.region))
    .attr("opacity", 0.7)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Labels
  // y-label
  svg.append("text")
    .attr("x", -(height / 2))
    .attr("y", (margin.left / 2) - 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-size", "14px")
    .text("Malaria Incidences (per 1,000 people)");

  // x-label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 2)
    .attr("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-size", "14px")
    .text("Population");

  // X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(8).tickPadding(9)) // Adjust the number of ticks
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", 40)
    .attr("text-anchor", "end")
    .style("font-family", "Arial")
    .style("font-size", "12px")
    .text("Population");

  // Y axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(d => `${d}`).ticks(8)) // Adjust the number of ticks
    .append("text")
    .attr("x", -margin.left)
    .attr("y", -60)
    .attr("text-anchor", "start")
    .style("font-family", "Arial")
    .style("font-size", "12px")
    .text("Malaria Incidences (per 1,000 people)");

  // Legend
  const legendMargin = { top: 110, right: 800 };
  const legendWidth = 200;
  const legendHeight = 200;

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - legendWidth - legendMargin.right}, ${legendMargin.top})`);

  const legendItems = legend.selectAll(".legend-item")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => colorScale(d));

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-family", "Arial")
    .style("font-size", "12px")
    .text(d => d);

  // D3 Annotations
  // CSS
  const style = document.createElement("style");
  style.innerHTML = ".annotation-note-content { font-family: Arial, sans-serif; font-size: 13px; fill: gray; }";
  document.head.appendChild(style);

  // US
  const annotations = [
    {
      note: {
        title: "United States",
        label: `Income Group: ${data.find(d => d.country === "United States").incomegroup},\n Malaria Incidences (per 1,000 people): ${Math.ceil(data.find(d => d.country === "United States").malariaperthousand)},\n Population: ${data.find(d => d.country === "United States").population}`
      },
      type: d3.annotationLabel,
      x: xScale(data.find(d => d.country === "United States").population),
      y: yScale(data.find(d => d.country === "United States").malariaperthousand),
      dx: 20,
      dy: -90,
      color: "gray",
      textColor: "gray",
      connector: { type: "elbow" },
      noteFontFamily: "Arial",
      noteFontSize: 10
    },
    // Chad
    {
      note: {
        title: "Chad",
        label: `Income Group: ${data.find(d => d.country === "Chad").incomegroup},\n Malaria Incidences (per 1,000 people): ${Math.ceil(data.find(d => d.country === "Chad").malariaperthousand)},\n Population: ${data.find(d => d.country === "Chad").population}`
      },
      type: d3.annotationLabel,
      x: xScale(data.find(d => d.country === "Chad").population),
      y: yScale(data.find(d => d.country === "Chad").malariaperthousand),
      dx: 150,
      dy: -5,
      color: "gray",
      textColor: "gray",
      connector: { type: "elbow" },
      noteFontFamily: "Arial",
      noteFontSize: 10
    }
  ];

  const makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(annotations);

  svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);

  // Handle mouseover events
  function handleMouseOver(event, d) {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background-color", "black") // Background color
      .style("color", "white") // Text color
      .style("padding", "6px") // Padding
      .style("border", "1px solid #fff") // Border color
      .style("font-size", "12px") // Font size
      .style("font-family", "Arial") // Font family
      .style("border-radius", "8px"); // Corners

    tooltip.html(`
      <p><strong>Country:</strong> ${d.country}</p>
      <p><strong>Income Group:</strong> ${d.incomegroup}</p>
     <p><strong>Malaria Incidences (per 1,000 people):</strong> ${Math.ceil(d.malariaperthousand)}</p>
      <p><strong>Population:</strong> ${d.population}</p>
    `);

    // Tooltip position
    const tooltipWidth = parseInt(tooltip.style("width"));
    const tooltipHeight = parseInt(tooltip.style("height"));
    const xPosition = (event.pageX - tooltipWidth / 2);
    const yPosition = event.pageY - tooltipHeight-50;
    tooltip.style("left", `${xPosition}px`).style("top", `${yPosition}px`);

    // Black ring border
    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
  }

  // Handle mouseout events
  function handleMouseOut() {
    d3.select(".tooltip").remove();

    // Remove black ring when not hovering
    d3.select(this).attr("stroke", "none");
  }
}).catch(error => {
  console.error("Error loading data:", error);
});