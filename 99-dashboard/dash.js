graf4 = d3.select('#controles')
graf12 = d3.select('#scatter')

anchototal4 = graf4.style('width').slice(0, -2)
altototal4  = anchototal4 * 0.5625

anchototal12 = graf12.style('width').slice(0, -2)
altototal12  = anchototal12 * 0.5625

margin = {
  top: 10,
  left: 25,
  right: 50,
  bottom: 10
}
ancho4 = anchototal4 - margin.left - margin.right
alto4  = altototal4 - margin.top - margin.bottom
ancho12 = anchototal12 - margin.left - margin.right
alto12  = altototal12 - margin.top - margin.bottom

slider = d3.sliderBottom()

// Variables globales para los select
selPlataforma = d3.select('#selPlataforma')
selGenero     = d3.select('#selGenero')
selFabricante = d3.select('#selFabricante')

// Panel de grafica de ventas totales
svgVenta = d3.select('#ventas')
              .append('svg')
              .attr('width', anchototal4)
              .attr('height', altototal4)
gVenta = svgVenta.append('g')
              .attr('id', '#gventas')
              .attr('transform', `translate(${margin.left}, ${margin.top})`)
xVenta = d3.scaleLinear().range([0, ancho4])
yVenta = d3.scaleLinear().range([alto4, 0])

generadorVenta = d3.line()
                  .x(d => xVenta(d))
                  .y(d => yVenta(d))

linea = gVenta.append('path')

xAxisVenta = gVenta.append('g')
                .attr('class', 'grid')
                .attr('transform', `translate(0, ${alto4})`)
yAxisVenta = gVenta.append('g')
                .attr('class', 'grid')

xAxisCall = d3.axisBottom().ticks(5).tickSize(-alto4)
yAxisCall = d3.axisLeft().ticks(5).tickSize(-ancho4)

svgPie = d3.select('#pie')
              .append('svg')
              .attr('width', anchototal4)
              .attr('height', altototal4)
gPie = svgPie.append('g')
              .attr('id', '#gpie')
              .attr('transform', `translate(${ancho4/2}, ${alto4/2})`)
color = d3.scaleOrdinal(d3.schemeCategory10)

// Tercera Gráfica
svgCrit = d3
            .select('#scatter')
            .append('svg')
            .attr('width', anchototal12)
            .attr('height', altototal12)
gCrit = svgCrit
            .append('g')
            .attr('transform', `translate(${ margin.left * 2 }, ${ margin.top })`)

xCrit = d3.scaleLinear().range([0, ancho12]).domain([0, 100])
yCrit = d3.scaleLinear().range([alto12, 0]).domain([0, 100])
rCrit = d3.scaleLinear().range([2, 50])

xAxisCrit = gCrit
          .append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0, ${alto12})`)
yAxisCrit = gCrit.append('g')
          .attr('class', 'grid')

// Calls para los ejes, se pueden usar con otras gráficas
xAxisCall = d3.axisBottom()
  .ticks(5)
  .tickSize(-alto4)
  .tickFormat(d => d.toString())
yAxisCall = d3.axisLeft()
  .ticks(5)
  .tickSize(-ancho4)

xAxisCallCrit = d3.axisBottom().ticks(5).tickSize(-alto12)
yAxisCallCrit = d3.axisLeft().ticks(5).tickSize(-ancho12)

xAxisCrit.call(xAxisCallCrit.scale(xCrit))
yAxisCrit.call(yAxisCallCrit.scale(yCrit))


// Variable global de datos
var data
var cats

d3.csv('video.csv').then(data => {
  data.forEach(d => {
    d.ano = +d.ano
    d.score_criticos = +d.score_criticos
    d.score_usuarios = +d.score_usuarios
    d.ventas_europa = +d.ventas_europa
    d.ventas_globales = +d.ventas_globales
    d.ventas_japon = +d.ventas_japon
    d.ventas_otro = +d.ventas_otro
    d.ventas_usa = +d.ventas_usa
  })
  // console.log(data)

  cats = Array.from(d3.map(data, function(d){ return d.genero }))

  // Filtrado y orden
  {
    data = d3.filter(data, d => d.ano > 0)
    data = d3.filter(data, d => {
      return (d.score_criticos > 0) && (d.score_usuarios > 0)
    })
    data = data.sort((a, b) => d3.ascending(a.ano, b.ano))
  }

  // Llenar los select
  {
    plataformas = new Set(d3.map(data, d => d.plataforma))
    plataformas.forEach(p => {
      selPlataforma
        .append('option')
        .attr('value', p)
        .text(p)
    })
  }

  // Inicialización del slider
  {
    anomin = d3.min(data, d => d.ano)
    anomax = d3.max(data, d => d.ano)

    slider
      .min(anomin)
      .max(anomax)
      .step(1)
      .width(ancho4)
      // .tickFormat(d3.timeFormat('%Y'))
      .tickValues([1985, 2000, 2016])
      .displayValue([true, true])
      .default([anomin, anomax])
      .on('onchange', val => {
        render()
      });

    d3.select('#slider')
      .append('svg')
      .attr('width', '100%')
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(slider);
  }

  this.data = data

  render()
})

function render() {
  dt = d3.filter(data, d => {
    return (d.ano >= slider.value()[0]) && (d.ano <= slider.value()[1])
  })
  plat = selPlataforma.node().value
  if (plat != 'todas') {
    dt = d3.filter(dt, d => d.plataforma == plat)
  }

  // console.log('Antes de filtrar: ' + data.length)
  // console.log('Despues de filtrar: ' + dt.length)

  ventasTotales(dt)
  graficaPie(dt)
  graficaScatter(dt)
}

function ventasTotales(data) {
  // console.log(data)

  // SELECT sum(ventas_globales) AS v FROM datos GROUP BY ano

  ventas = Array.from(d3.rollup(data, v => d3.sum(v, d => d.ventas_globales), d=>d.ano))

  // console.log(ventas)

  xVenta.domain(d3.extent(ventas, d => {
    return d[0]
  }))
  yVenta.domain([0, d3.max(ventas, d => d[1])])

  generadorVenta.x(d => d[0]).y(d => d[1])

  linea.attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('stroke', '#c00')
        .attr('d', generadorVenta(ventas))

  xAxisVenta.call(xAxisCall.scale(xVenta))
  yAxisVenta.call(yAxisCall.scale(yVenta))
}

function graficaPie(data) {
  ventas = d3.rollup(data, v => {
    return {
      usa: d3.sum(v, d => d.ventas_usa),
      europa: d3.sum(v, d => d.ventas_europa),
      japon: d3.sum(v, d => d.ventas_japon),
      otros: d3.sum(v, d => d.ventas_otros),
    }
  })
  // console.log(ventas)

  pie = d3.pie().value(d => d)
  arc = d3.arc()
        .innerRadius(0)
        .outerRadius(alto4 / 2)
  part = gPie.selectAll('.part')
        .data(pie(Object.values(ventas)))
        .enter()
        .append('g')
  part
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))

}

function graficaScatter(data) {
  rCrit.domain([d3.min(data, d => d.ventas_globales),
                d3.max(data, d => d.ventas_globales)])

  p = gCrit.selectAll('circle')
            .data(data, d => d.juego)

  p.enter()
    .append('circle')
      .attr('cx', d => xCrit(d.score_criticos))
      .attr('cy', d => yCrit(d.score_usuarios))
      .attr('r', 0)
    .merge(p)
      .transition().duration(500)
        .attr('cx', d => xCrit(d.score_criticos))
        .attr('cy', d => yCrit(d.score_usuarios))
        .attr('r', d => rCrit(d.ventas_globales))
        .attr('fill', d => color(cats.indexOf(d.genero)))
        .attr('stroke', '#ccc')
        .attr('fill-opacity', '0.5')

  p.exit()
        .transition().duration(500)
        .attr('r', 0)
        .remove()
}