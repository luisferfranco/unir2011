graf4 = d3.select('#controles')
anchototal4 = graf4.style('width').slice(0, -2)
altototal4  = anchototal4 * 0.5625
margin = {
  top: 30,
  left: 70,
  right: 15,
  bottom: 20
}
ancho4 = anchototal4 - margin.left - margin.right
alto4  = altototal4 - margin.top - margin.bottom

slider = d3.sliderBottom()

// Variables globales para los select
selPlataforma = d3.select('#selPlataforma')
selGenero     = d3.select('#selGenero')
selFabricante = d3.select('#selFabricante')

// Panel de grafica de ventas totales
svgVenta = d3.select('#ventas')
              .append('svg')
              .attr('width', ancho4)
              .attr('height', alto4)
gVenta = svgVenta.append('g')
              .attr('transform', `translate(${margin.left}, ${margin.top})`)

// Variable global de datos
var data

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
  // graficaCie(dt)
  // graficaScatter(dt)
}

function ventasTotales(data) {
  // console.log(data)
}