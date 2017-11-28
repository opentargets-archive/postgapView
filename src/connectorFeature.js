/* global tnt:true */

function getPath(from, to1, to2, tPos, y) {
    const cPoint = (tPos + ((y - tPos) / 2));
    const path1 = `M${from},${y} C${from},${cPoint} ${to1},${cPoint} ${to1},${tPos}`;
    const path2 = `L${to2},${tPos}`;
    const path3 = `C${to2},${cPoint} ${from},${cPoint} ${from},${y}`;
    const path4 = 'Z';
    return [path1, path2, path3, path4].join(' ');
}

const connectorFeature = tnt.board.track.feature()
    .distribute(function (transcripts) {
        console.log('connector transcripts... ', transcripts.data());
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const slotHeight = display.layout().gene_slot().slot_height;
        const y = track.height();

        const currSlots = {};
        transcripts.data().forEach((t) => {
            currSlots[t.id] = t.slot;
        });

        transcripts.selectAll('path')
            .transition()
            .duration(200)
            .attr('d', (d) => {
                // var tPos = (d.slot) * slot_height;
                const tPos = currSlots[d.id] * slotHeight;
                const from = xScale(d.from);
                const to1 = xScale(d.to1);
                const to2 = xScale(d.to2);
                return getPath(from, to1, to2, tPos, y);
            });
    })
    .create(function (sel) {
        console.log('connector create... ', sel.data());
        const track = this;
        // Same as: var xScale = transcript_feature.scale();
        const display = track.display();
        const xScale = display.scale();
        const slotHeight = display.layout().gene_slot().slot_height;
        const y = track.height();

        const connectorsSel = sel
            .filter((t) => t.connectors && t.connectors.length);

        connectorsSel
            .data()
            .forEach((d) => {
                d.connectors.forEach((c) => {
                    c.slot = d.slot;
                });
            });

        connectorsSel.selectAll('.connector')
            .data((d) => d.connectors, (d) => `${d.from}-${d.id}`)
            .enter()
            .append('path')
            .attr('class', 'connector')
            .style('fill', '#cccccc')
            .style('stroke', 'none')
            .style('opacity', 0.5)
            .attr('d', (d) => {
                const tPos = (d.slot) * slotHeight;
                const from = xScale(d.from);
                const to1 = xScale(d.to1);
                const to2 = xScale(d.to2);
                return getPath(from, to1, to2, tPos, y);
            });
    })
    .move(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const slotHeight = display.layout().gene_slot().slot_height;
        const y = track.height();

        const currSlots = {};
        sel.data().forEach((t) => {
            currSlots[t.id] = t.slot;
        });

        sel.selectAll('.connector')
            .attr('d', (d) => {
                // var tPos = (d.slot) * slot_height;
                const tPos = (currSlots[d.id]) * slotHeight;
                const from = xScale(d.from);
                const to1 = xScale(d.to1);
                const to2 = xScale(d.to2);
                return getPath(from, to1, to2, tPos, y);
            });
    });

export default connectorFeature;