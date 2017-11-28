/* global tnt:true */
/* global d3:true */

// cluster feature
const clusterFeature = tnt.board.track.feature()
    .layout(tnt.board.track.layout.genome())
    .index((d) => d.id);

let color = () => '#ddeeff';
// create
clusterFeature.create(function (el) {
    const xScale = clusterFeature.scale();
    // const track = this;
    el
        .append('rect')
        .attr('x', (d) => xScale(d.start))
        .attr('y', (d) => clusterFeature.layout().gene_slot().slot_height * d.slot)
        .attr('width', (d) => xScale(d.end) - xScale(d.start))
        .attr('height', clusterFeature.layout().gene_slot().gene_height)
        .attr('fill', (d) => color(d))
        .style('opacity', 0.5);

    el
        .append('text')
        .attr('class', 'tnt_name')
        .attr('x', (d) => xScale(d.start))
        .attr('y', (d) => (clusterFeature.layout().gene_slot().slot_height * d.slot) + 25)
        .attr('fill', (d) => color(d))
        .text((d) => d.display_label);

    el
        .each(function (d) {
            // so the individual snps if any
            // (ie, if they have not been filtered out in the data step
            if (d.snps) {
                // const g = d3.select(this);
                // const pins = g.selectAll('.pins')
                //     .data(Object.keys(d.oSnps))
                //     .enter()
                //     .append('g')
                //     .attr('class', 'pins');
                // pins
                d3.select(this)
                    .selectAll('.snps')
                    .data(d.snps, (s) => s.rsId)
                    .enter()
                    .append('line')
                    .attr('class', 'snps')
                    .attr('x1', (s) => xScale(s.pos))
                    .attr('x2', (s) => xScale(s.pos))
                    .attr('y1', clusterFeature.layout().gene_slot().slot_height * d.slot)
                    .attr('y2', () => {
                        const slot = clusterFeature.layout().gene_slot();
                        const slotHeight = slot.slot_height;
                        const geneHeight = slot.gene_height;

                        return (slotHeight * d.slot) + geneHeight;
                    })
                    .style('stroke', 'black');
            }
        });
});

// distribute
clusterFeature.distribute((clusters) => {
    // const track = this;
    clusters
        .select('rect')
        .transition()
        .duration(500)
        .attr('y', (d) => clusterFeature.layout().gene_slot().slot_height * d.slot)
        .attr('height', clusterFeature.layout().gene_slot().gene_height);
});

clusterFeature.move((cluster) => {
    const xScale = clusterFeature.scale();

    cluster.select('rect')
        .attr('x', (d) => xScale(d.start))
        .attr('width', (d) => xScale(d.end) - xScale(d.start));

    cluster.select('text')
        .attr('x', (d) => xScale(d.start));


    cluster.selectAll('line')
        .attr('x1', (s) => xScale(s.pos))
        .attr('x2', (s) => xScale(s.pos));
});

clusterFeature.color = function (f) {
    color = f;
    return this;
};

export default clusterFeature;