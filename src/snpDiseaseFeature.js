/* global tnt:true */
/* global d3:true */

// Circle feature
const snpDiseaseFeature = tnt.board.track.feature()
    .index((d) => d.id);

// Create
const color = '#FF5665';
const offset = 10; // 10 pixels offset
snpDiseaseFeature.create(function (el) {
    const xScale = snpDiseaseFeature.scale();
    const track = this;
    const y = track.height();

    const yScale = d3.scale.log()
        .domain([1, 1e-20])
        .range([(y - offset), offset])
        .clamp(true);

    el
        .append('circle')
        .attr('cx', d => xScale(d.pos))
        .attr('cy', d => {
            return yScale(d.pvalue);
        })
        .attr('r', 3)
        .style('stroke', color)
        .style('stroke-width', '2px')
        .style('fill', color)
        .style('opacity', '0.8');
});

// Move
snpDiseaseFeature.move((el) => {
    const xScale = snpDiseaseFeature.scale();

    el.selectAll('circle')
        .attr('cx', (d) => xScale(d.pos));
    el.select('line')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos));
});

snpDiseaseFeature.fixed(function (width) {
    const track = this;
    const g = track.g;
    const y = track.height();

    const yScale = d3.scale.log()
        .domain([1, 1e-20])
        .range([(y - offset), offset])
        .clamp(true);

    // baseline
    g
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y - offset)
        .attr('y2', y - offset)
        .style('stroke', '#dddddd');

    // axis label
    g
        .append('g')
        .attr('transform', `translate(5, ${y / 2})rotate(-90)`)
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', '#333333')
        .style('font-size', '0.6em')
        .style('text-anchor', 'middle')
        .text('Variant-disease score');

    // axis
    const axisSel = g
        .append('g')
        .attr('transform', 'translate(45, 0)');

    const axis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickValues([1, 1e-10, 1e-20]);
        // .ticks(3);

    axis(axisSel);
});
export default snpDiseaseFeature;
