/* global tnt:true */

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const lineConnectorFeature = tnt.board.track.feature()
    .create(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const y = track.height();

        sel.append('path')
            .classed('snp-connector', true)
            .attr('d', (d) => {
                const fromX = xScale(d.from);
                const toX = xScale(d.to);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            .attr('stroke-opacity', d => ((d.r2 - 0.6) * 2));
    })
    .move(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const y = track.height();

        sel.select('path')
        .attr('d', (d) => {
            const fromX = xScale(d.from);
            const toX = xScale(d.to);
            const fromY = 0;
            const toY = y;
            return getLinePath(fromX, fromY, toX, toY);
        })
        // .attr('stroke-width', 2)
        .attr('stroke-opacity', d => ((d.r2 - 0.6) * 2));
    });

export default lineConnectorFeature;
