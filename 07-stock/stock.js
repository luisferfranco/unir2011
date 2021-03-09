// Gráficas de Stocks
//

graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
margins = {
  top: 30,
  left: 70,
  right: 15,
  bottom: 20
}
ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// Area total de visualización
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

// Contenedor "interno" donde van a estar los gráficos
g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

svg.append("rect")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        // .attr("class", "overlay")
        .attr('fill', 'black')
        .attr('fill-opacity', 0.25)
        .attr("width", ancho)
        .attr("height", alto)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", e => mousemove(e))

focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none")

focus.append("line")
        .attr("class", "y-hover-line hover-line")
focus.append("line")
        .attr("class", "x-hover-line hover-line")

focus.append("circle")
        .attr("r", 7.5)

focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

// Escaladores
x = d3.scaleTime().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
color = d3.scaleOrdinal()
          .domain(['amzn', 'tsla', 'nflx'])
          .range(['#bb0000', '#00bb00', '#0000bb'])

// Ejes
xAxisCall = d3.axisBottom()
xAxis = g.append('g')
          .attr('class', 'ejes')
          .attr('transform', `translate(0, ${alto})`)
yAxisCall = d3.axisLeft()
yAxis = g.append('g')
          .attr('class', 'ejes')

// Generador de líneas
lineaGen = d3.line()
              .x(d => x(d.Date))
              .y(d => y(d.Close))
linea = g.append('path')

var data

var slider = d3
  .sliderHorizontal()
  .fill('#2196f3')
  .displayValue(false)

// parser para fechas
//
// documentación de formato:
// https://d3-wiki.readthedocs.io/zh_CN/master/Time-Formatting/
//
// Documentación de la librería de D3:
// https://github.com/d3/d3-time-format
parser = d3.timeParse(d3.timeParse('%Y-%m-%d'))

function load(symbol='amzn') {
  d3.csv(`${symbol}.csv`).then(data => {
    data.forEach(d => {
      d.Close = +d.Close
      d.Date = parser(d.Date)
    })

    minx = d3.min(data, d => d.Date)
    maxx = d3.max(data, d => d.Date)

    this.data = data

    slider
      .min(minx)
      .max(maxx)
      .step(1)
      .width(300)
      .default([minx, maxx])
      .on('onchange', (val) => {
        render(data, symbol)
      })

    d3.select('#slider-svg').remove()
    d3.select('#slider')
      .append('svg')
      .attr('id', 'slider-svg')
      .attr('width', 500)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(slider)

    render(data, symbol)
  })
}

function render(data, symbol) {

  data = d3.filter(data, d => {
    return d.Date >= slider.value()[0] && d.Date <= slider.value()[1]
  })

  x.domain(d3.extent(data, d => d.Date))
  y.domain([
    d3.min(data, d => d.Close) * 0.95,
    d3.max(data, d => d.Close) * 1.05
  ])

  linea.attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('stroke', color(symbol))
        .attr('d', lineaGen(data))

  // Ejes
  xAxis.call(xAxisCall.scale(x))
  yAxis.call(yAxisCall.scale(y))

}

load()

function cambio() {
  load(d3.select('#stock').node().value)
}

function mousemove(e) {
  // console.log(`${d3.pointer(e)}`)

  // Este artículo explica bien que es un bisector y la
  // filosofía tras el:
  // https://stackoverflow.com/questions/26882631/d3-what-is-a-bisector

  x0 = x.invert(d3.pointer(e)[0])

  bisectDate = d3.bisector((d) => d.Date).left
  i = bisectDate(data, x0, 1)
  console.log(`${x0} = ${i}`)

  d0 = data[i - 1],
  d1 = data[i],
  d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

  focus.attr("transform", "translate(" + x(d.Date) + "," + y(d.Close) + ")");
  focus.select("text").text(function() { return d.Close; });
  focus.select(".x-hover-line").attr("x2", -x(d.Date))
  focus.select(".y-hover-line").attr("y2", alto - y(d.Close))
}