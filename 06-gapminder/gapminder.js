// Clon de Gapminder
//
//

graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
margins = {
  top: 30,
  left: 20,
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

g.append('clipPath')
  .attr('id', 'clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', ancho)
    .attr('height', alto)

tip = g.append('g')
        .attr('id', 'tip')
        .attr('display', 'none')
        .attr('transform', `translate(${ancho/2}, ${alto/2})`)

tip.append('rect')
    .attr('width', 170)
    .attr('height', 30)
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .attr('clip-path', 'url(#clip)')

tip.append('text')
    .attr('id', '_pais')
    .attr('x', 75)
    .attr('y', 20)
    .attr('stroke', 'black')
    .attr('text-anchor', 'middle')
    .text('China')
    .attr('clip-path', 'url(#clip)')

tip.append('rect')
    .attr('y', 30)
    .attr('width', 170)
    .attr('height', 35)
    .attr('fill', '#666666')
    .attr('stroke', 'black')
    .attr('clip-path', 'url(#clip)')

tip.append('text')
    .attr('id', '_poblacion')
    .attr('x', 5)
    .attr('y', 50)
    .attr('stroke', '#ffcc00')
    .text('Población: 1,000,000')
    .attr('clip-path', 'url(#clip)')



// Escaladores
x = d3.scaleLog().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
r = d3.scaleLinear().range([10, 100])

color = d3.scaleOrdinal().range(['#f94144', '#f8961e', '#90be6d', '#577590'])

// Variables Globales
datos = []
years = []
iyear = 0
maxy  = 0
miny  = 50000
continente = 'todos'
corriendo  = true

var interval

contSelect = d3.select('#continente')
botonPausa = d3.select('#pausa')
slider     = d3.select('#slider');

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

  slider.attr('min', 0)
        .attr('max', years.length - 1)
  slider.node().value = 0

  // El dominio para el escalador ordinal
  color.domain(d3.map(data, d => d.continent))

  x.domain([d3.min(data, d => d.income),
            d3.max(data, d => d.income)])
  y.domain([d3.min(data, d => d.life_exp),
            d3.max(data, d => d.life_exp)])
  r.domain([d3.min(data, d => d.population),
            d3.max(data, d => d.population)])

  // Ejes
  xAxis = d3.axisBottom(x)
            .ticks(10)
            .tickFormat(d => d3.format(',d')(d))
  xAxisG = d3.axisBottom(x)
            .ticks(10)
            .tickFormat('')
            .tickSize(-alto)

  yAxis = d3.axisLeft(y)
            .ticks(10)
  yAxisG = d3.axisLeft(y)
            .ticks(10)
            .tickFormat('')
            .tickSize(-ancho)

  g.append('g')
    .call(xAxis)
    .attr('transform', `translate(0,${alto})`)
  g.append('g')
    .call(yAxis)

  g.append('g')
    .attr('class', 'ejes')
    .call(xAxisG)
    .attr('transform', `translate(0,${alto})`)
  g.append('g')
    .attr('class', 'ejes')
    .call(yAxisG)

  contSelect.append('option')
              .attr('value', 'todos')
              .text('Todos')
  color.domain().forEach(d => {
    contSelect.append('option')
                .attr('value', d)
                .text(d)
  })

  // Leyenda
  g.append('rect')
    .attr('x', ancho - 210)
    .attr('y', alto - 160)
    .attr('width', 200)
    .attr('height', 150)
    .attr('stroke', 'black')
    .attr('fill', '#dedede')

  color.domain().forEach((d, i) => {
    g.append('rect')
      .attr('x', ancho - 200)
      .attr('y', alto - 150 + i*35)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', color(d))

    g.append('text')
      .attr('x', ancho - 175)
      .attr('y', alto - 135 + i*35)
      .attr('fill', 'black')
      .text(d[0].toUpperCase() + d.slice(1))
  })


  frame()
  interval = d3.interval(() => delta(1), 300)
})

function frame() {
  year = years[iyear]
  data = d3.filter(datos, d => d.year == year)
  data = d3.filter(data, d => {
    if (continente == 'todos')
      return true
    else
      return d.continent == continente
  })

  slider.node().value = iyear
  render(data)
}

function render(data) {
  yearDisplay.text(years[iyear])

  p = g.selectAll('circle')
        .data(data, d => d.country)

  p.enter()
    .append('circle')
      .attr('r', 0)
      .attr('cx', d => x(d.income))
      .attr('cy', d => y(d.life_exp))
      .attr('fill', '#005500')
      .attr('clip-path', 'url(#clip)')
      .attr('stroke', '#333333')
      .attr('fill-opacity', 0.75)
      .on('mouseover', (event, d) => showtip(event, d, true))
      .on('mouseout', (event, d) => showtip(event, d, false))
    .merge(p)
      .transition().duration(300)
      .attr('cx', d => x(d.income))
      .attr('cy', d => y(d.life_exp))
      .attr('r', d => r(d.population))
      .attr('fill', d => color(d.continent))

  p.exit()
    .transition().duration(300)
    .attr('r', 0)
    .attr('fill', '#ff0000')
    .remove()
}

// function atras() {
//   iyear--
//   if (iyear < 0) iyear = 0
//   frame()
// }

// function adelante() {
//   iyear++
//   if (iyear == years.lenght) iyear = years.lenght
//   frame()
// }

// Refactoring de las funciones de arriba
// DRY Don't Repeat Yourself

function delta(d) {
  iyear += d
  console.log(iyear)

  if (iyear < 0) iyear = years.length-1
  if (iyear > years.length-1) iyear = 0
  frame()
}

contSelect.on('change', () => {
  continente = contSelect.node().value
  frame()
})

botonPausa.on('click', () => {
  corriendo = !corriendo
  if (corriendo) {
    botonPausa
      .classed('btn-danger', true)
      .classed('btn-success', false)
      .html('<i class="fas fa-pause-circle"></i>')
      interval = d3.interval(() => delta(1), 300)
  } else {
    botonPausa
      .classed('btn-danger', false)
      .classed('btn-success', true)
      .html('<i class="fas fa-play-circle"></i>')
    interval.stop()
  }
})

slider.on('input', () => {
  // d3.select('#sliderv').text(slider.node().value)
  iyear = +slider.node().value
  frame()
})

slider.on('mousedown', () => {
  if (corriendo) interval.stop()
})

slider.on('mouseup', () => {
  if (corriendo) interval = d3.interval(() => delta(1), 300)
})

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function showtip(e, d, mostrar) {

  d3.select('#tip').moveToFront()

  if (mostrar) {
    d3.select('#tip').attr('display', null)
    d3.select('#_pais').text(d.country)
    d3.select('#_poblacion').text(d.population)
    d3.select('#tip')
      .attr('transform', `translate(${x(d.income)}, ${y(d.life_exp)})`)
  } else {
    d3.select('#tip').attr('display', 'none')
  }
}