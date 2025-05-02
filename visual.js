const barSvg = d3.select("#bar-chart"),
      mapSvg = d3.select("#map-chart"),
      width = 800,
      height = 400;

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson")
  .then(res => res.json())
  .then(data => {
    const features = data.features.map(f => ({
      mag: +f.properties.mag,
      place: f.properties.place,
      time: new Date(f.properties.time),
      coords: f.geometry.coordinates
    }));

    // 1. Bar Chart
    const bins = d3.bin()
      .domain(d3.extent(features, d => d.mag))
      .thresholds([4.5, 5, 5.5, 6, 6.5, 7])
      (features.map(d => d.mag));

    const xBar = d3.scaleBand()
      .domain(bins.map(b => `${b.x0}-${b.x1}`))
      .range([50, width - 50])
      .padding(0.1);

    const yBar = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height - 50, 50]);

    barSvg.attr("viewBox", `0 0 ${width} ${height}`);

    barSvg.append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(xBar));

    barSvg.append("g")
      .attr("transform", `translate(50,0)`)
      .call(d3.axisLeft(yBar));

    barSvg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => xBar(`${d.x0}-${d.x1}`))
      .attr("y", d => yBar(d.length))
      .attr("width", xBar.bandwidth())
      .attr("height", d => height - 50 - yBar(d.length))
      .attr("fill", "#69b3a2");

    // 2. Map Chart
    const longitudes = features.map(d => d.coords[0]);
    const latitudes = features.map(d => d.coords[1]);

    const xMap = d3.scaleLinear()
      .domain(d3.extent(longitudes)).nice()
      .range([50, width - 50]);

    const yMap = d3.scaleLinear()
      .domain(d3.extent(latitudes)).nice()
      .range([height - 50, 50]);

    mapSvg.attr("viewBox", `0 0 ${width} ${height}`);

    mapSvg.append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(xMap));

    mapSvg.append("g")
      .attr("transform", `translate(50,0)`)
      .call(d3.axisLeft(yMap));

    mapSvg.selectAll("circle")
      .data(features)
      .enter()
      .append("circle")
      .attr("cx", d => xMap(d.coords[0]))
      .attr("cy", d => yMap(d.coords[1]))
      .attr("r", d => d.mag)
      .attr("fill", "crimson")
      .attr("opacity", 0.6);

    // 3. Table
    const tbody = d3.select("#quake-table tbody");

    features.slice(0, 20).forEach(d => {
      tbody.append("tr")
        .html(`<td>${d.place}</td><td>${d.mag.toFixed(1)}</td><td>${d3.timeFormat("%Y-%m-%d %H:%M")(d.time)}</td>`);
    });
  });