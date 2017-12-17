/* global tnt:true */

// const opacityScale = d3.scale.linear().domain([0.7, 1]).range([0.2, 0.6]) // r2
// const opacityScale = r2 => {
//     if (r2 < 0.8) {
//         return 0.2;
//     } else if (r2 < 0.9) {
//         return 0.3
//     } else if (r2 < 0.95) {
//         return 0.4
//     } else if (r2 < 0.99) {
//         return 0.5
//     } else {
//         return 0.6
//     }
// };
import { r2ColourScale, pvalColourScale } from '../colourScales';


const superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const legendFeature = tnt.board.track.feature()
    .create(function (sel) {
        // const track = this;
        // const display = track.display();
        // const xScale = display.scale();
        // const y = track.height();

        // sel.append('path')
        //     .classed('snp-connector', true)
        //     .attr('d', (d) => {
        //         const fromX = xScale(d.from);
        //         const toX = xScale(d.to);
        //         const fromY = 0;
        //         const toY = y;
        //         return getLinePath(fromX, fromY, toX, toY);
        //     })
        //     .attr('stroke-opacity', d => opacityScale(d.r2));
    })
    .move(function (sel) {
        // const track = this;
        // const display = track.display();
        // const xScale = display.scale();
        // const y = track.height();

        // sel.select('path')
        // .attr('d', (d) => {
        //     const fromX = xScale(d.from);
        //     const toX = xScale(d.to);
        //     const fromY = 0;
        //     const toY = y;
        //     return getLinePath(fromX, fromY, toX, toY);
        // })
        // // .attr('stroke-width', 2)
        // .attr('stroke-opacity', d => opacityScale(d.r2));
    })
    .fixed(function (width) {
        const track = this;
        const g = track.g;
        const r2Legend = d3.legend.color()
            .shapeWidth(30)
            .orient('horizontal')
            .scale(r2ColourScale)
            .title('Linkage Disequilibrium (r^2)');

        g.append('g')
            .attr('transform', 'translate(5, 5)')
            .classed('legend-r2', true)
            .call(r2Legend);

        const pvalLegend = d3.legend.color()
            .shapeWidth(30)
            .orient('horizontal')
            .scale(pvalColourScale)
            .cells([1e-6, 1e-7, 1e-8, 1e-9, 1e-10])
            .labels(['10⁻⁶', '10⁻⁷', '10⁻⁸', '10⁻⁹', '10⁻¹⁰'])
            .title('GWAS p-value');

        g.append('g')
            .attr('transform', 'translate(205, 5)')
            .classed('legend-pval', true)
            .call(pvalLegend);
    });

export default legendFeature;
