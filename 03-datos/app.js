// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 0, left: 0, right: 0, bottom: 0 }

// II. Variables globales
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

dataArray = [10, 20, 23, 12, 18, 25, 32, 28]

// III. render (update o dibujo)
function render(data) {

  bars = svg.selectAll('rect')
            .data(data)

  bars.enter()
      .append('rect')
      .style('width', 50)
      .style('height', d => d * 5 )
      .style('x', (d, i) => 50 + i * 70)
      .style('y', 0)

  // function(d, i) { return d }
  // (d, i) => d

}

// IV. Carga de datos


// V. Despliegue
render(dataArray)