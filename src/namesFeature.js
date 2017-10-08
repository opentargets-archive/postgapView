/* global tnt:true */

// Names feature

const namesFeature = tnt.board.track.feature()
    .index((d) => d.id);

// Create
namesFeature.create(function (el) {
    const xScale = namesFeature.scale();
    const track = this;
    const y = track.height();

    const g = el
        .append('g');

    g
        .append('line')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos))
        .attr('y1', 0)
        .attr('y2', 2)
        .style('stroke', 'black')
        .style('stroke-width', '1px');

    g
        .append('text')
        .attr('x', (d) => xScale(d.pos))
        .attr('y', 3)
        .attr('transform', (d) => `rotate(310,${xScale(d.pos)},3)`)
        .style('text-anchor', 'end')
        .style('font-size', '0.6em')
        .style('fill', 'navy')
        .text((d) => d.id);
});

// Move
namesFeature.move((el) => {
    const xScale = namesFeature.scale();

    el.select('g')
        .select('line')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos));

    el.select('text')
        .attr('x', (d) => xScale(d.pos))
        .attr('transform', (d) => `rotate(310,${xScale(d.pos)},3)`);
});

export default namesFeature;
