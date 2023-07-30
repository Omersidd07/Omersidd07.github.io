//SVG size
const width = 1200; //width
const height = 900; //height
const margin = { top: 100, right: 100, bottom: 100, left: 150 }; //margins


const svg = d3.select("#scatterplot-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);


d3.csv("firstscene.csv").then(data => {
  // Convert data from string to numbers
  data.forEach(d => {
    d.gdppercapita = parseFloat(d.gdppercapita);
    d.mortalityrateperthousand = parseFloat(d.mortalityrateperthousand);
    d.population = parseFloat(d.population);
  });

  //scales for x, y, and circle size
const xScale = d3.scaleLog() // Use d3.scaleLog() for a logarithmic scale
  .domain(d3.extent(data, d => d.gdppercapita))
  .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.mortalityrateperthousand))
  .range([height - margin.bottom, margin.top]);

const circleSizeScale = d3.scaleSqrt()
  .domain(d3.extent(data, d => d.population))
  .range([5, 37]); // BUBBLE SIZE

  //create ordinal scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(data.map(d => d.region));

  //create/ append circles
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.gdppercapita))
    .attr("cy", d => yScale(d.mortalityrateperthousand))
    .attr("r", d => circleSizeScale(d.population))
    .attr("fill", d => colorScale(d.region))
    .attr("opacity", 0.7) // Adjust this value to control circle opacity
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

    ///////////////////////////////labels
// Y-label
svg.append("text")
  .attr("x", -(height / 2))
  .attr("y", margin.left / 2 - 10)
  .attr("transform", "rotate(-90)")
  .attr("text-anchor", "middle")
  .style("font-family", "Arial")
  .style("font-size", "14px")
  .text("Infant Mortality Rate (per 1,000 live births)");

// X-label
svg.append("text")
  .attr("x", width / 2)
  .attr("y", height - margin.bottom / 2)
  .attr("text-anchor", "middle")
  .style("font-family", "Arial")
  .style("font-size", "14px")
  .text("GDP per Capita");

/////////////////////////////////

// X axis
svg.append("g")
  .attr("transform", `translate(0, ${height - margin.bottom})`)
  .call(d3.axisBottom(xScale)
    .tickFormat(d => `$${d3.format(".2s")(d)}`) // Add dollar signs and use scientific notation for tick labels
    .ticks(5) // Specify the desired number of ticks (e.g., 5)
    .tickValues([500, 1000, 5000, 10000, 50000, 100000, 200000])) // Specify custom tick values
  .append("text")
  .attr("x", width - margin.right)
  .attr("y", 40)
  .attr("text-anchor", "end")
  .style("font-family", "Arial")
  .style("font-size", "12px")
  .text("GDP per Capita");


// Y axis
svg.append("g")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(d3.axisLeft(yScale).tickFormat(d3.format(".2f")).ticks(10))
  .append("text")
  .attr("x", -margin.left)
  .attr("y", -60)
  .attr("text-anchor", "start")
  .style("font-family", "Arial")
  .style("font-size", "12px")
  .text("Infant Mortality Rate (per 1,000 live births)");

  ////////////////////////////////////////////////Legend
const legendMargin = { top: 110, right: 120 };
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

  /////////////////////////////////////////////////////


  /////////////////////////////////////////////////D3 Annotations

// ... (previous code)

// CSS
const style = document.createElement("style");
style.innerHTML = ".annotation-note-content { font-family: Arial, sans-serif; font-size: 13px; fill: gray; }";
document.head.appendChild(style);

// Annotations
const annotations = [
  {
    note: {
      title: "United States",
      label: `GDP per Capita: $${data.find(d => d.country === "United States").gdppercapita.toFixed(2)}\nInfant Mortality Rate (per 1,000 live births): ${data.find(d => d.country === "United States").mortalityrateperthousand}`
    },
    type: d3.annotationLabel,
    x: xScale(data.find(d => d.country === "United States").gdppercapita),
    y: yScale(data.find(d => d.country === "United States").mortalityrateperthousand),
    dx: 20,
    dy: -30,
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
      label: `GDP per Capita: $${data.find(d => d.country === "Chad").gdppercapita.toFixed(2)}\nInfant Mortality Rate (per 1,000 live births):${data.find(d => d.country === "Chad").mortalityrateperthousand}`
    },
    type: d3.annotationLabel,
    x: xScale(data.find(d => d.country === "Chad").gdppercapita),
    y: yScale(data.find(d => d.country === "Chad").mortalityrateperthousand),
    dx: 60,
    dy: -70,
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


  

  /////////////////////////////////////////////////////

    //handle mouseover events
  function handleMouseOver(event, d) {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background-color", "black") //background color
      .style("color", "white") //text color
      .style("padding", "6px") //padding
      .style("border", "1px solid #fff") // border color
      .style("font-size", "12px") // Font size
      .style("font-family", "Arial") // Font family
      .style("border-radius", "8px"); // Corners

    tooltip.html(`
      <p><strong>Country:</strong> ${d.country}</p>
      <p><strong>Income Group:</strong> ${d.incomegroup}</p>
      <p><strong>GDP per Capita:</strong> $${d.gdppercapita.toFixed(2)}</p>
      <p><strong>Mortality Rate per Thousand:</strong> ${d.mortalityrateperthousand}</p>
    `);

    // tool tip
    const tooltipWidth = parseInt(tooltip.style("width"));
    const tooltipHeight = parseInt(tooltip.style("height"));
    const xPosition = (event.pageX - tooltipWidth / 2);
    const yPosition = event.pageY - tooltipHeight-50;
    tooltip.style("left", `${xPosition}px`).style("top", `${yPosition}px`);

    // black ring border
    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
  }

  //handle mouseout events
  function handleMouseOut() {
    d3.select(".tooltip").remove();

    // Remove black ring when not hovering
    d3.select(this).attr("stroke", "none");
  }
}).catch(error => {
  console.error("Error loading data:", error);
});