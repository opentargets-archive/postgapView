/* global tnt:true */
/* global d3:true */
import { pvalColourScale } from '../colourScales';

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
    })
    .fixed(function (width) {
        // const track = this;
        // const g = track.g;
        // const slider = thresholdSlider();

        // slider.value(0);
        // slider.callback(_.debounce(function () {
        //     console.log('callback!');
        //     // TODO: Here should show/hide the connections based on the value

        //     d3.selectAll('.lead-snp-disease-connector')
        //         .classed('below-slider-threshold', false)
        //         .filter(d => (d.pvalue < slider.value()))
        //         .classed('below-slider-threshold', true);
        // }, 300));
        
        // const gContainer = g.append('g')
        //                     .classed('slider-container', true)
        //                     .attr('transform', 'translate(5,25)');
        // gContainer.call(slider, [0, 100]);
    });

export default leadSnpDiseaseFeature;
