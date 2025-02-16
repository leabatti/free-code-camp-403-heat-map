// Fetch Data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((fetchedData) => {
  const data = fetchedData.monthlyVariance;

  // Chart Dimensions
  const width = 1200;
  const height = 400;
  const padding = 60;

  // Create SVG
  const svg = d3.select("#chart").attr("width", width).attr("height", height);

  // Create Scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleBand()
    .domain(d3.range(1, 13))
    .range([padding, height - padding])
    .paddingInner(0.05);

  const colorScale = d3
    .scaleSequential(d3.interpolateRdBu)
    .domain(d3.extent(data, (d) => d.variance));

  // Create Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
    const date = new Date(0);
    date.setUTCMonth(d);
    return d3.timeFormat("%B")(date);
  });

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  // Heat Map Cells
  svg
    .selectAll(".cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => fetchedData.baseTemperature + d.variance)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr(
      "width",
      (width - 2 * padding) /
        (d3.max(data, (d) => d.year) - d3.min(data, (d) => d.year))
    )
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.variance))
    .on("mouseover", showTooltip)
    .on("mouseout", hideTooltip);

  // Create Tooltip
  const tooltip = d3.select("#tooltip");

  function showTooltip(event, d) {
    tooltip
      .style("display", "block")
      .style("left", event.pageX - 70 + "px")
      .style("top", event.pageY - 40 + "px")
      .attr("data-year", d.year)
      .html(
        `${d3.timeFormat("%B")(new Date(d.year, d.month - 1))} ${
          d.year
        }<br>Temperature: ${
          fetchedData.baseTemperature + d.variance.toFixed(2)
        }°C<br>Variance: ${d.variance.toFixed(2)}°C`
      );
  }

  function hideTooltip() {
    tooltip.style("display", "none");
  }

  // Legend
  const legendColors = colorScale.ticks(5).map(colorScale);
  const legend = d3.select("#legend");

  legend
    .selectAll(".legend-cell")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("class", "legend-cell")
    .style("background-color", (d) => d)
    .each(function (d, i) {
      d3.select(this)
        .append("span")
        .attr("class", "legend-label")
        .text(
          i === 0
            ? "< " +
                d3
                  .min(data, (d) => fetchedData.baseTemperature + d.variance)
                  .toFixed(2) +
                "°C"
            : i === legendColors.length - 1
            ? "> " +
              d3
                .max(data, (d) => fetchedData.baseTemperature + d.variance)
                .toFixed(2) +
              "°C"
            : (
                d3.min(data, (d) => fetchedData.baseTemperature + d.variance) +
                i *
                  ((d3.max(
                    data,
                    (d) => fetchedData.baseTemperature + d.variance
                  ) -
                    d3.min(
                      data,
                      (d) => fetchedData.baseTemperature + d.variance
                    )) /
                    (legendColors.length - 1))
              ).toFixed(2) + "°C"
        );
    });
});
