// Constants for the SVG size
const width = 1200; // Increase width
const height = 900; // Increase height
const margin = { top: 100, right: 100, bottom: 100, left: 100 }; // Increase margins

// Create the SVG element
const svg = d3.select("#scatterplot-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Read the CSV data and render the scatter plot
d3.csv("firstscene.csv").then(data => {
  // Convert numerical data from string to numbers
  data.forEach(d => {
    d.gdppercapita = parseFloat(d.gdppercapita);
    d.mortalityrateperthousand = parseFloat(d.mortalityrateperthousand);
    d.population = parseFloat(d.population);
  });

  // Create scales for x, y, and circle size
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.mortalityrateperthousand))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.gdppercapita))
    .range([height - margin.bottom, margin.top]);

  const circleSizeScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.population))
    .range([5, 37]); // Increase this range to make the bubbles bigger

  // Create an ordinal scale for income groups to define colors
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(data.map(d => d.incomegroup));

  // Create and append circles to the SVG
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.mortalityrateperthousand))
    .attr("cy", d => yScale(d.gdppercapita))
    .attr("r", d => circleSizeScale(d.population))
    .attr("fill", d => colorScale(d.incomegroup))
    .attr("opacity", 0.7) // Adjust this value to control circle opacity
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Add x and y axes
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format(".2f")).ticks(12)); // Increase the number of ticks

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(d3.format(".2f")).ticks(10)); // Increase the number of ticks

  /////////////////////////////////////////////////

// Add CSS style for annotation text
const style = document.createElement("style");
style.innerHTML = ".annotation-note-content { font-family: Arial, sans-serif; font-size: 13px; fill: gray; }";
document.head.appendChild(style);

// Add constant D3 annotations for the United States and Chad
const annotations = [
  {
    note: {
      title: "United States",
      label: `GDP per Capita: $${data.find(d => d.country === "United States").gdppercapita.toFixed(2)}\nMortality Rate per Thousand: ${data.find(d => d.country === "United States").mortalityrateperthousand}`
    },
    type: d3.annotationLabel,
    x: xScale(data.find(d => d.country === "United States").mortalityrateperthousand),
    y: yScale(data.find(d => d.country === "United States").gdppercapita),
    dx: 70,
    dy: -20,
    color: "gray",
    textColor: "gray", // Change text color to dark grey
    connector: { type: "elbow" },
    noteFontFamily: "Arial", // Set font-family to Arial
    noteFontSize: 10 // Reduce font size
  },
  {
    note: {
      title: "Chad",
      label: `GDP per Capita: $${data.find(d => d.country === "Chad").gdppercapita.toFixed(2)}\nMortality Rate per Thousand: ${data.find(d => d.country === "Chad").mortalityrateperthousand}`
    },
    type: d3.annotationLabel,
    x: xScale(data.find(d => d.country === "Chad").mortalityrateperthousand),
    y: yScale(data.find(d => d.country === "Chad").gdppercapita),
    dx: 20,
    dy: -80,
    color: "gray",
    textColor: "gray", // Change text color to dark grey
    connector: { type: "elbow" },
    noteFontFamily: "Arial", // Set font-family to Arial
    noteFontSize: 10 // Reduce font size
  }
];

const makeAnnotations = d3.annotation()
  .type(d3.annotationLabel)
  .annotations(annotations);

svg.append("g")
  .attr("class", "annotation-group")
  .call(makeAnnotations);

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  ///////////////////////////////////////////////////
    // Function to handle mouseover events
  function handleMouseOver(event, d) {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background-color", "black") // Change background color to black
      .style("color", "white") // Change text color to white
      .style("padding", "6px") // Reduce padding
      .style("border", "1px solid #fff") // Change border color to white
      .style("font-size", "12px") // Reduce font size
      .style("font-family", "Arial") // Set font-family to Arial
      .style("border-radius", "8px"); // Add rounded corners

    tooltip.html(`
      <p><strong>Country:</strong> ${d.country}</p>
      <p><strong>GDP per Capita:</strong> $${d.gdppercapita.toFixed(2)}</p>
      <p><strong>Mortality Rate per Thousand:</strong> ${d.mortalityrateperthousand}</p>
    `);

    // Position the tooltip near the mouse pointer
    const tooltipWidth = parseInt(tooltip.style("width"));
    const tooltipHeight = parseInt(tooltip.style("height"));
    const xPosition = event.pageX - tooltipWidth / 2;
    const yPosition = event.pageY - tooltipHeight - 10;
    tooltip.style("left", `${xPosition}px`).style("top", `${yPosition}px`);

    // Add a black ring around the bubble
    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
  }

  // Function to handle mouseout events
  function handleMouseOut() {
    d3.select(".tooltip").remove();

    // Remove the black ring when not hovering over the bubble
    d3.select(this).attr("stroke", "none");
  }
}).catch(error => {
  console.error("Error loading data:", error);
});
