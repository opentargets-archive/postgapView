/* global tnt:true */
/* global d3:true */

const snpFeature = tnt.board.track.feature()
    .index((d) => d.id);

// Create
const offset = 0; // 10 pixels offset
snpFeature.create(function (el) {
    const xScale = snpFeature.scale();
    const track = this;
    const y = track.height();

    const yScale = d3.scale.linear()
        .domain([0, 1])
        .range([(y - offset), offset]);

    const g = el
        .append('g');

    g.append('line')
        .classed('ld-snp-marker', true)
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos))
        .attr('y1', yScale(0))
        .attr('y2', yScale(1))
        .style('stroke-width', 2)
        .style('stroke', 'green');
});

// Move
snpFeature.move((el) => {
    const xScale = snpFeature.scale();

    el.select('line.ld-snp-marker')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos));
});
export default snpFeature;
