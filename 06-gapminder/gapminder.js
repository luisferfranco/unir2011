// Clon de Gapminder
//
//

graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
margins = {
  top: 30,
  left: 50,
  right: 15,
  bottom: 120
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

fontsize = alto * 0.65
yearDisplay = g.append('text')
                .attr('x', ancho / 2)
                .attr('y', alto / 2 + fontsize/2)
                .attr('text-anchor', 'middle')
                .attr('font-family', 'Roboto')
                .attr('font-size', `${fontsize}px`)
                .attr('fill', '#cccccc')
                .text('1800')

g.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', ancho)
  .attr('height', alto)
  .attr('stroke', 'black')
  .attr('fill', 'none')

// Escaladores
x = d3.scaleLinear().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
r = d3.scaleLinear().range([10, 100])

color = d3.scaleOrdinal().range(d3.schemeAccent)

// Variables Globales
datos = []
years = []
iyear = 0
maxy  = 0
miny  = 50000

d3.csv('gapminder.csv').then((data) => {
  data.forEach((d) => {
    d.income     = +d.income
    d.life_exp   = +d.life_exp
    d.population = +d.population
    d.year       = +d.year

    // if (d.year > maxy) maxy = d.year
    // if (d.year < miny) miny = d.year
  })

  console.log(`miny=${miny} maxy=${maxy}`)

  years = Array.from(new Set(d3.map(data, d => d.year)))

  data = data.filter((d) => {
    return (d.income > 0) && (d.life_exp > 0)
  })
  // data = data.filter((d) => (d.income > 0) && (d.life_exp > 0))

  datos = data

  // El dominio para el escalador ordinal
  color.domain(d3.map(data, d => d.continent))

  x.domain([d3.min(data, d => d.income),
            d3.max(data, d => d.income)])
  y.domain([d3.min(data, d => d.life_exp),
            d3.max(data, d => d.life_exp)])
  r.domain([d3.min(data, d => d.population),
            d3.max(data, d => d.population)])

  frame()
})

function frame() {
  iyear = years[7]
  data = d3.filter(datos, d => d.year == iyear)

  render(data)
}

function render(data) {
  yearDisplay.text(iyear)

  p = g.selectAll('circle')
        .data(data)

  p.enter()
    .append('circle')
    .attr('cx', d => x(d.income))
    .attr('cy', d => y(d.life_exp))
    .attr('r', d => r(d.population))
    .attr('fill', d => color(d.continent))
}