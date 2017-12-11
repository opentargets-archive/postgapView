/* global tnt:true */
/* global d3:true */

const diseaseFeature = tnt.board.track.feature()
.index((d) => d);

// Create
diseaseFeature.create(function (el) {
    const track = this;
    const xScale = diseaseFeature.scale();
    const xScaleText = d3.scale.ordinal()
        .domain(el.data())
        .rangePoints(xScale.range());
    const y = track.height();

    const g = el
        .append('g')
        .attr('transform', d => `translate(${xScaleText(d)},${(y / 2)})`);

    g.append('text')
        .classed('disease-label', true)
        // .attr('x', d => xScaleText(d))
        // .attr('y', y / 2)
        .attr('transform', 'rotate(45)')
        .text(d => d);
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
