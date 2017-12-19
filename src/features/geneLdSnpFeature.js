/* global tnt:true */

// function getPath(from, to1, to2, tPos, y) {
//     const cPoint = (tPos + ((y - tPos) / 2));
//     const path1 = `M${from},${y} C${from},${cPoint} ${to1},${cPoint} ${to1},${tPos}`;
//     const path2 = `L${to2},${tPos}`;
//     const path3 = `C${to2},${cPoint} ${from},${cPoint} ${from},${y}`;
//     const path4 = 'Z';
//     return [path1, path2, path3, path4].join(' ');
// }

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const geneLdSnpFeature = tnt.board.track.feature()
    .distribute(function (transcripts) {
        // const track = this;
        // const display = track.display();
        // const xScale = display.scale();
        // // const slotHeight = display.layout().gene_slot().slot_height;
        // const y = track.height();

        // // const currSlots = {};
        // // transcripts.data().forEach((t) => {
        // //     currSlots[t.id] = t.slot;
        // // });

        // transcripts.selectAll('path')
        //     .transition()
        //     .duration(200)
        //     // .attr('d', (d) => {
        //     //     // var tPos = (d.slot) * slot_height;
        //     //     const tPos = currSlots[d.id] * slotHeight;
        //     //     const from = xScale(d.from);
        //     //     const to = xScale(d.to1);
        //     //     // const to2 = xScale(d.to2);
        //     //     return getPath(from, to1, to2, tPos, y);
        //     // });
        //     .attr('d', (d) => {
        //         const fromX = xScale(d.geneTss);
        //         const toX = xScale(d.ldSnpPos);
        //         const fromY = 0;
        //         const toY = y;
        //         return getLinePath(fromX, fromY, toX, toY);
        //     });
    })
    .create(function (sel) {
        // const track = this;
        // const display = track.display();
        // const xScale = display.scale();
        // // const slotHeight = display.layout().gene_slot().slot_height;
        // const y = track.height();
        // // sel.append('path')
        // //     .classed('snp-connector', true)
        // //     .attr('d', (d) => {
        // //         const fromX = xScale(d.from);
        // //         const toX = xScale(d.to);
        // //         const fromY = 0;
        // //         const toY = y;
        // //         return getLinePath(fromX, fromY, toX, toY);
        // //     })
        // //     .style('stroke-opacity', 0.4)
        // //     .style('stroke', 'coral');

        // // ---

        // // const track = this;
        // // // Same as: var xScale = transcript_feature.scale();
        // // const display = track.display();
        // // const xScale = display.scale();
        // // const slotHeight = display.layout().gene_slot().slot_height;
        // // const y = track.height();

        // const connectorsSel = sel
        //     .filter((t) => t.ldSnps);

        // // connectorsSel
        // //     .data()
        // //     .forEach((d) => {
        // //         d.connectors.forEach((c) => {
        // //             c.slot = d.slot;
        // //         });
        // //     });

        // const con = connectorsSel.selectAll('.gene-ld-snp-connector')
        //     .data((d) => Object.values(d.ldSnps), (d) => d.id);

        // con
        //     .enter()
        //     .append('path')
        //     .attr('class', 'gene-ld-snp-connector')
        //     // .style('stroke', 'red')
        //     .attr('d', (d) => {
        //         const fromX = xScale(d.geneTss);
        //         const toX = xScale(d.ldSnpPos);
        //         const fromY = 0;
        //         const toY = y;
        //         return getLinePath(fromX, fromY, toX, toY);
        //     })
        //     .style('stroke-opacity', 0.4)
        //     .style('stroke', 'coral');
        //     // .style('fill', (d) => {
        //     //     if (d.isBest) {
        //     //         return '#FF5665';
        //     //     }
        //     //     return '#cccccc';
        //     // })
        // //     .style('stroke', 'none')
        // //     .style('opacity', 0.4)
        // //     .attr('d', (d) => {
        // //         const tPos = (d.slot) * slotHeight;
        // //         const from = xScale(d.from);
        // //         const to1 = xScale(d.to1);
        // //         const to2 = xScale(d.to2);
        // //         return getPath(from, to1, to2, tPos, y);
        // //     });

        // con.exit().remove();
    })
    .move(function (sel) {
        // const track = this;
        // const display = track.display();
        // const xScale = display.scale();
        // // const slotHeight = display.layout().gene_slot().slot_height;
        // const y = track.height();

        // // const currSlots = {};
        // // sel.data().forEach((t) => {
        // //     currSlots[t.id] = t.slot;
        // // });

        // sel.selectAll('path')
        //     // .attr('d', (d) => {
        //     //     // var tPos = (d.slot) * slot_height;
        //     //     const tPos = (currSlots[d.id]) * slotHeight;
        //     //     const from = xScale(d.from);
        //     //     const to1 = xScale(d.to1);
        //     //     const to2 = xScale(d.to2);
        //     //     return getLinePath(from, to1, to2, tPos, y);
        //     // });
        //     .attr('d', (d) => {
        //         const fromX = xScale(d.geneTss);
        //         const toX = xScale(d.ldSnpPos);
        //         const fromY = 0;
        //         const toY = y;
        //         return getLinePath(fromX, fromY, toX, toY);
        //     });
    });

export default geneLdSnpFeature;
