/* global tnt:true */
/* global d3:true */

import { v2gScoreColourScale } from '../colourScales';
import thresholdSlider from '../thresholdSlider';

// useful function
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveParentToFront = function () {
    return this.each(function () {
        const parentNode = this.parentNode;
        parentNode.parentNode.appendChild(parentNode);
    });
};

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const geneLdSnpFeature = tnt.board.track.feature()
    .create(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const y = track.height();

        sel.append('path')
            .classed('gene-ld-snp-connector', true)
            .attr('d', (d) => {
                const fromX = xScale(d.geneTss);
                const toX = xScale(d.ldSnpPos);
                const fromY = 0;
                const toY = y;
                return getLinePath(fromX, fromY, toX, toY);
            })
            // .style('stroke-opacity', 0.4)
            .style('stroke-opacity', d => v2gScoreColourScale(d.ot_g2v_score));

        track.g.select('.slider-container').moveToFront();
    })
    .move(function (sel) {
        const track = this;
        const display = track.display();
        const xScale = display.scale();
        const y = track.height();

        sel.select('path')
        .attr('d', (d) => {
            const fromX = xScale(d.geneTss);
            const toX = xScale(d.ldSnpPos);
            const fromY = 0;
            const toY = y;
            return getLinePath(fromX, fromY, toX, toY);
        });
        // .style('stroke-opacity', d => r2ColourScale(d.r2));
        track.g.select('.slider-container').moveToFront();
    })
    .fixed(function (width) {
        const track = this;
        const g = track.g;
        const slider = thresholdSlider();

        slider.value(0);
        slider.callback(function () {
            console.log(`postgap score threshold: ${slider.value()}`);
            // highlight gene-ldSnp connectors (based on the postgap score)
            d3.selectAll('.gene-ld-snp-connector')
                .classed('below-postgap-score-threshold', false)
                .filter(d => (d.funcgen.ot_g2v_score < slider.value()))
                .classed('below-postgap-score-threshold', true);

            // highlight ldSnp-leadSnp connectors (based on the postgap score)
            //   1. get relevant ldSnps connected
            //      Note: MUST only hide ldSnp-leadSnp connectors if the ldSnp has
            //            NO gene-ldSnp visible
            const ldSnpIdsStillVisible = d3.selectAll('.gene-ld-snp-connector:not(.below-postgap-score-threshold)')
                .data()
                .map(d => d.ldSnpId);
            //   2. affect the ldSnp-leadSnp connectors for any of these ldSnps
            d3.selectAll('.ld-snp-lead-snp-connector')
                .classed('below-postgap-score-threshold', false)
                .filter(d2 => (ldSnpIdsStillVisible.indexOf(d2.ldSnpId) === -1))
                .classed('below-postgap-score-threshold', true);

            // highlight leadSnp-disease connectors (based on the postgap score)
            //   1. get relevant leadSnps connected
            //      Note: MUST only hide leadSnp-disease connectors if the leadSnp has
            //            NO ldSnp-leadSnp visible
            const leadSnpIdsStillVisible = d3.selectAll('.ld-snp-lead-snp-connector:not(.below-postgap-score-threshold)')
                .data()
                .map(d => d.leadSnpId);
            //   2. affect the leadSnp-disease connectors for any of these leadSnps
            d3.selectAll('.lead-snp-disease-connector')
                .classed('below-postgap-score-threshold', false)
                .filter(d2 => (leadSnpIdsStillVisible.indexOf(d2.leadSnpId) === -1))
                .classed('below-postgap-score-threshold', true);
        });

        const gContainer = g.append('g')
                            .classed('slider-container', true)
                            .attr('transform', 'translate(5,25)');
        gContainer.call(slider, [0, 1]);
    });

export default geneLdSnpFeature;
