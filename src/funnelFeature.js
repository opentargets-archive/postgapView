/* global tnt:true */

// Funnel feature
const funnelFeature = tnt.board.track.feature()
    .index((d) => `${d.from}-${d.to}`);

// Create
funnelFeature.create(function (el) {
    const xScale = funnelFeature.scale();
    const track = this;
    const y = track.height();

    const g = el
        .append('g');
    g
        .append('polygon')
        .attr('class', 'left')
        .attr('points', (d) => `0,0 ${xScale(d.from)},0 0,${y}`)
        .style('fill', '#aaaaaa')
        .style('stroke', '#aaaaaa')
        .style('stroke-width', 1);

    g
        .append('polygon')
        .attr('class', 'right')
        .attr('points', (d) => `${xScale(d.to)},0 ${xScale.range()[1]},0 ${xScale.range()[1]},${y}`)
        .style('fill', '#aaaaaa')
        .style('stroke', '#aaaaaa')
        .style('stroke-width', 1);
});

// Move
funnelFeature.move(function (el) {
    const track = this;
    const y = track.height();
    const xScale = funnelFeature.scale();

    el.select('g').select('polygon.right')
        .attr('points', (d) => `0,0 ${xScale(d.from)},0 0,${y}`)
    el.select('g').select('polygon.left')
        .attr('points', (d) => `${xScale(d.to)},0 ${xScale.range()[1]},0 ${xScale.range()[1]},${y}`)
});

export default funnelFeature;
