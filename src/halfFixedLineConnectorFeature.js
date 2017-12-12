/* global tnt:true */

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
        const opacityScale = d3.scale.log()
            .base(10)
            .domain(d3.extent(sel.data(), d => d.pval))
            .range([0, 1]);
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
            .attr('stroke-opacity', d => opacityScale(d.pval));
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
            .attr('stroke-opacity', d => opacityScale(d.pval));
    });

export default halfFixedLineConnectorFeature;
