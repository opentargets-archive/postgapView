/* global tnt:true */
/* global d3:true */

const diseaseFeature = tnt.board.track.feature()
.index((d) => d.id);

// Create
diseaseFeature.create(function (el) {
    const track = this;
    const xScale = diseaseFeature.scale();
    const xScaleText = d3.scale.linear()
        .domain([0, 1])
        .range(xScale.range());
    const y = track.height();

    const g = el
        .append('g')
        // .attr('transform', d => `translate(${xScaleText(d)},${(y / 2)})`);
        .attr('transform', d => `translate(${xScaleText(d.pos)},5)`);

    g.append('text')
        .classed('disease-label', true)
        // .attr('x', d => xScaleText(d))
        // .attr('y', y / 2)
        .attr('transform', 'rotate(-90)')
        .text(d => d.name);
});

// Move
diseaseFeature.move((el) => {
    // const xScale = diseaseFeature.scale();

    // el.selectAll('circle')
    //     .attr('cx', (d) => xScale(d.pos));
    // el.select('line')
    //     .attr('x1', (d) => xScale(d.pos))
    //     .attr('x2', (d) => xScale(d.pos));
});

export default diseaseFeature;
