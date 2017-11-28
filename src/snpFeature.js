/* global tnt:true */
/* global d3:true */

// Circle feature
const snpFeature = tnt.board.track.feature()
    .index((d) => d.id);

// Create
const color1 = '#758CAB';
const color2 = '#FF5665';
const offset = 10; // 10 pixels offset
snpFeature.create(function (el) {
    const xScale = snpFeature.scale();
    const track = this;
    const y = track.height();

    const yScale = d3.scale.linear()
        .domain([0, 1])
        // .range([offset, (y - offset)]);
        .range([(y - offset), offset]);

    const g = el
        .append('g');

    // Those where the selected gene is the max
    g.filter((d) => d.score === d.maxScore)
        .append('circle')
        .attr('cx', d => xScale(d.pos))
        .attr('cy', d => yScale(d.score))
        .attr('r', 3)
        .style('stroke', color2)
        .style('stroke-width', '2px')
        .style('fill', color2)
        .style('opacity', '0.8');

    // Those where the selected gene is not the max
    const gs = g.filter((d) => d.score && (d.score !== d.maxScore));
    gs
        .append('line')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos))
        .attr('y1', (d) => yScale(d.score))
        .attr('y2', (d) => yScale(d.maxScore))
        .style('stroke', '#dddddd');

    gs
        .append('circle')
        .attr('cx', (d) => xScale(d.pos))
        .attr('cy', (d) => yScale(d.score))
        .attr('r', 3)
        .style('stroke', color2)
        .style('stroke-width', '2px')
        .style('fill', color2)
        .style('opacity', '0.5');

    gs
        .append('circle')
        .attr('cx', (d) => xScale(d.pos))
        .attr('cy', (d) => yScale(d.maxScore))
        .attr('r', 3)
        .style('stroke', color1)
        .style('stroke-width', '2px')
        .style('fill', color1)
        .style('opacity', '0.5');
});

// Move
snpFeature.move((el) => {
    const xScale = snpFeature.scale();

    el.selectAll('circle')
        .attr('cx', (d) => xScale(d.pos));
    el.select('line')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos));
});

snpFeature.fixed(function (width) {
    const track = this;
    const g = track.g;
    const y = track.height();

    const yScale = d3.scale.linear()
        .domain([0, 1])
        .range([(y - offset), offset]);

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
        .text('Variant-gene score');

    // axis
    const axisSel = g
        .append('g')
        .attr('transform', 'translate(45, 0)');

    const axis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(3);

    axis(axisSel);
});
export default snpFeature;
