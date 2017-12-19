/* global tnt:true */
import { r2ColourScale } from '../colourScales';

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
            .classed('ld-snp-lead-snp-connector', true)
            .attr('d', (d) => {
                const fromX = xScale(d.from);
                const toX = xScale(d.to);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            .style('stroke-opacity', 0.4)
            .style('stroke', d => r2ColourScale(d.r2));
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
        .style('stroke', d => r2ColourScale(d.r2));
    });

export default lineConnectorFeature;
