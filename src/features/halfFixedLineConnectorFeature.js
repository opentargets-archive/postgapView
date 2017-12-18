/* global tnt:true */
/* global d3:true */
import { pvalColourScale } from '../colourScales';

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const halfFixedLineConnectorFeature = tnt.board.track.feature()
    .index((d) => d.id)
    .create(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const xScaleText = d3.scale.linear()
            .domain([0, 1])
            .range(xScale.range());
        const y = track.height();

        sel.append('path')
            .classed('snp-disease-connector', true)
            .attr('d', (d) => {
                const fromX = xScale(d.leadSnpPos);
                const toX = xScaleText(d.efoPos);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            .style('stroke-opacity', 0.4)
            .style('stroke', d => pvalColourScale(d.pvalue));
    })
    .move(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const xScaleText = d3.scale.linear()
            .domain([0, 1])
            .range(xScale.range());
        const y = track.height();

        sel.select('path')
            .attr('d', (d) => {
                const fromX = xScale(d.leadSnpPos);
                const toX = xScaleText(d.efoPos);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            .style('stroke', d => pvalColourScale(d.pvalue));
    });

export default halfFixedLineConnectorFeature;
