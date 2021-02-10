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
    console.log(data)

    x.domain(d3.extent(data, d => d.Date))
    // Esto es equivalente a...
    // x.domain([d3.min(data, d => d.Date),
    //           d3.max(data, d => d.Date)])

    // y.domain(d3.extent(data, d => d.Close))
    y.domain([
      d3.min(data, d => d.Close) * 0.95,
      d3.max(data, d => d.Close) * 1.05
    ])

    // Ejes
    xAxis.transition()
          .duration(500)
          .call(xAxisCall.scale(x))
    yAxis.transition()
          .duration(500)
          .call(yAxisCall.scale(y))

    render(data, symbol)
  })
}

function render(data, symbol) {
  linea.attr('fill', 'none')
        .attr('stroke-width', 3)
        .transition()
        .duration(500)
        .attr('stroke', color(symbol))
        .attr('d', lineaGen(data))
}

load()

function cambio() {
  load(d3.select('#stock').node().value)
}