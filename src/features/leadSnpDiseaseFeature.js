/* global tnt:true */
/* global d3:true */
import { pvalColourScale } from '../colourScales';
import thresholdSlider from '../thresholdSlider';

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const leadSnpDiseaseFeature = tnt.board.track.feature()
    .index((d) => d.id)
    .create(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const xStart = xScale.range()[0];
        const xEnd = xScale.range()[1];
        const xScaleText = d3.scale.linear()
            .domain([0, 1])
            .range([xStart + 30, xEnd - 30]);
        const y = track.height();

        sel.append('path')
            .classed('lead-snp-disease-connector', true)
            .attr('d', (d) => {
                const fromX = xScale(d.leadSnpPos);
                const toX = xScaleText(d.efoPos);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            // .style('stroke-opacity', 0.4)
            .style('stroke-opacity', d => pvalColourScale(d.pvalue));

        track.g.select('.slider-container').moveToFront();
    })
    .move(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const xStart = xScale.range()[0];
        const xEnd = xScale.range()[1];
        const xScaleText = d3.scale.linear()
            .domain([0, 1])
            .range([xStart + 30, xEnd - 30]);
        const y = track.height();

        sel.select('path')
            .attr('d', (d) => {
                const fromX = xScale(d.leadSnpPos);
                const toX = xScaleText(d.efoPos);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            // .style('stroke-opacity', d => pvalColourScale(d.pvalue));

        track.g.select('.slider-container').moveToFront();
    })
    .fixed(function (width) {
        const track = this;
        const g = track.g;
        const slider = thresholdSlider();

        slider.value(0);
        slider.callback(function () {
            console.log(`log pval threshold: ${slider.value()}`);
            // highlight disease-leadSnp connectors (based on -log[pval])
            d3.selectAll('.lead-snp-disease-connector')
                .classed('below-log-pvalue-threshold', false)
                .filter(d => (-Math.log10(d.pvalue) <= slider.value()))
                .classed('below-log-pvalue-threshold', true);

            // highlight ldSnp-leadSnp connectors (based on -log[pval])
            //   1. get relevant leadSnps connected
            //      Note: MUST only hide ldSnp-leadSnp connectors if the leadSnp has
            //            NO leadSnp-disease visible
            const leadSnpIdsStillVisible = d3.selectAll('.lead-snp-disease-connector:not(.below-log-pvalue-threshold)')
                .data()
                .map(d => d.leadSnpId);
            //   2. affect the ldSnp-leadSnp connectors for any of these leadSnps
            d3.selectAll('.ld-snp-lead-snp-connector')
                .classed('below-log-pvalue-threshold', false)
                .filter(d2 => (leadSnpIdsStillVisible.indexOf(d2.leadSnpId) === -1))
                .classed('below-log-pvalue-threshold', true);

            // highlight gene-ldSnp connectors (based on -log[pval])
            //   1. get relevant ldSnps connected
            //      Note: MUST only hide gene-ldSnp connectors if the ldSnp has
            //            NO ldSnp-leadSnp visible
            const ldSnpIdsStillVisible = d3.selectAll('.ld-snp-lead-snp-connector:not(.below-log-pvalue-threshold)')
                .data()
                .map(d => d.ldSnpId);
            //   2. affect the gene-ldSnp connectors for any of these ldSnps
            d3.selectAll('.gene-ld-snp-connector')
                .classed('below-log-pvalue-threshold', false)
                .filter(d2 => (ldSnpIdsStillVisible.indexOf(d2.ldSnpId) === -1))
                .classed('below-log-pvalue-threshold', true);
        });

        const gContainer = g.append('g')
                            .classed('slider-container', true)
                            .attr('transform', 'translate(5,25)');
        gContainer.call(slider, [0, 50]);
    });

export default leadSnpDiseaseFeature;
