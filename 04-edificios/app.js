// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 10, left: 15, right: 15, bottom: 120 }

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// II. Variables globales
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

g = svg.append('g')
        .style('transform', `translate(${ margins.left }px, ${ margins.top }px)`)
        .style('width', ancho + 'px')
        .style('height', alto + 'px')

y = d3.scaleLinear()
          .range([alto, 0])

dataArray = []

// III. render (update o dibujo)
function render(data) {
  // function(d, i) { return d }
  // (d, i) => d
  bars = g.selectAll('rect')
            .data(data)

  bars.enter()
      .append('rect')
      .style('width', '50px')
      .style('height', d => (alto - y(d.oficial)) + 'px')
      .style('x', (d, i) => (50 + i * 70) + 'px')
      .style('y', d => (y(d.oficial)) + 'px')
      .style('fill', d => d.color)
}

// IV. Carga de datos
d3.csv('edificios.csv')
.then(function(data) {
  data.forEach(d => {
    d.oficial = +d.oficial
    d.ano = +d.ano
    d.antena = +d.antena
    d.piso = +d.piso
    d.ultimopiso = +d.ultimopiso
    d.puesto = +d.puesto
  })

  this.dataArray = data

  // Calcular la altura más alta dentro de
  // los datos (columna "oficial")
  maxy = d3.max(data, d => d.oficial)

  // Creamos una función para calcular la altura
  // de las barras y que quepan en nuestro canvas
  y.domain([0, maxy])

  // V. Despliegue
  render(dataArray)
})
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

