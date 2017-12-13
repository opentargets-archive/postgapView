/* global tnt:true */

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

// const opacityScale = d3.scale.linear().domain([0.7, 1]).range([0.2, 0.6]) // r2
const opacityScale = r2 => {
    if (r2 < 0.8) {
        return 0.2;
    } else if (r2 < 0.9) {
        return 0.3
    } else if (r2 < 0.95) {
        return 0.4
    } else if (r2 < 0.99) {
        return 0.5
    } else {
        return 0.6
    }
};

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
            .attr('stroke-opacity', d => opacityScale(d.r2));
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
        .attr('stroke-opacity', d => opacityScale(d.r2));
    });

export default lineConnectorFeature;
