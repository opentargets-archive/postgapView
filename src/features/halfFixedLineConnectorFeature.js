/* global tnt:true */
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
        const xScaleText = d3.scale.ordinal()
            .domain(sel.data().map(d => d.efoId).sort())
            .rangePoints(xScale.range());
        console.log(d3.extent(sel.data(), d => d.pval));
        // const opacityScale = d3.scale.log()
        //     .base(10)
        //     .domain(d3.extent(sel.data(), d => d.pval))
        //     .range([0, 1]);
        const opacityScale = pval => {
            const mlogp = -Math.log10(pval);
            if (mlogp < 6) {
                return 0.2;
            } else if (mlogp < 7) {
                return 0.3;
            } else if (mlogp < 8) {
                return 0.4;
            } else if (mlogp < 9) {
                return 0.5;
            } else {
                return 0.6;
            }
        }
        const y = track.height();

        sel.append('path')
            .classed('snp-disease-connector', true)
            .attr('d', (d) => {
                const fromX = xScale(d.leadSnpPos);
                const toX = xScaleText(d.efoId);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            .style('stroke-opacity', 0.4)
            .style('stroke', d => pvalColourScale(d.pval));
            // .attr('stroke-opacity', d => opacityScale(d.pval));
    })
    .move(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const xScaleText = d3.scale.ordinal()
            .domain(sel.data().map(d => d.efoId).sort())
            .rangePoints(xScale.range());
        const opacityScale = d3.scale.log()
            .base(10)
            .domain(d3.extent(sel.data(), d => d.pval))
            .range([0, 1]);
        const y = track.height();

        sel.select('path')
            .attr('d', (d) => {
                const fromX = xScale(d.leadSnpPos);
                const toX = xScaleText(d.efoId);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            .style('stroke', d => pvalColourScale(d.pval));
            // .attr('stroke-opacity', d => opacityScale(d.pval));
    });

export default halfFixedLineConnectorFeature;
