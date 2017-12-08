/* global tnt:true */
/* global d3:true */

const snpMarker = tnt.board.track.feature()
.index((d) => d.id);

// Create
const color1 = '#758CAB';
const color2 = '#FF5665';
const offset = 10; // 10 pixels offset
snpMarker.create(function (el) {
    // console.log(el)
const xScale = snpMarker.scale();
const track = this;
const y = track.height();

const yScale = d3.scale.linear()
    .domain([0, 1])
    // .range([offset, (y - offset)]);
    .range([(y - offset), offset]);

const g = el
    .append('g');

g.append('line')
    .classed('ld-snp-marker', true)
    .attr('x1', (d) => xScale(d.pos))
    .attr('x2', (d) => xScale(d.pos))
    .attr('y1', (d) => yScale(0))
    .attr('y2', (d) => yScale(1))
    .style('stroke-width', 2)
    .style('stroke', 'green');
});

// Move
snpMarker.move((el) => {
const xScale = snpMarker.scale();

el.select('line.ld-snp-marker')
    .attr('x1', (d) => xScale(d.pos))
    .attr('x2', (d) => xScale(d.pos));
});
export default snpMarker;
