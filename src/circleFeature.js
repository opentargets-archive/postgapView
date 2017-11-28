/* global tnt:true */
/* global d3:true */

// Circle feature
const circleFeature = tnt.board.track.feature()
    .index((d) => d.id);

// Create
let color = () => '#dddddd';
circleFeature.create(function (el) {
    const xScale = circleFeature.scale();
    const track = this;
    const y = track.height();

    const circleScale = d3.scale.linear()
        .domain([0, 1])
        .range([0, (y / 2)]);

    const g = el
        .append('g');

    g
        .append('circle')
        .attr('cx', (d) => xScale(d.pos))
        .attr('cy', y / 2)
        .attr('r', (d) => circleScale(d.score))
        .style('stroke', '#333333')
        .style('stroke-width', '1px')
        .style('fill', (d) => color(d))
        .style('opacity', '0.6');
});
circleFeature.color = function (f) {
    color = f;
    return this;
};

// Move
circleFeature.move((el) => {
    const xScale = circleFeature.scale();

    el.select('g')
        .select('circle')
        .attr('cx', (d) => {
            return xScale(d.pos);
        });
});

export default circleFeature;
