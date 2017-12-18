/* global tnt:true */
/* global d3:true */

const leadSnpFeature = tnt.board.track.feature()
    .index((d) => d.id);

// Create
const offset = 0; // 10 pixels offset
leadSnpFeature.create(function (el) {
    const xScale = leadSnpFeature.scale();
    const track = this;
    const y = track.height();

    const yScale = d3.scale.linear()
        .domain([0, 1])
        .range([(y - offset), offset]);

    const g = el
        .append('g');

    g.append('line')
        .classed('lead-snp-marker', true)
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos))
        .attr('y1', yScale(0))
        .attr('y2', yScale(1))
        .style('stroke-width', 2)
        .style('stroke', 'green');
});

// Move
leadSnpFeature.move((el) => {
    const xScale = leadSnpFeature.scale();

    el.select('line.lead-snp-marker')
        .attr('x1', (d) => xScale(d.pos))
        .attr('x2', (d) => xScale(d.pos));
});
export default leadSnpFeature;
