/* global tnt:true */
import { r2ColourScale } from '../colourScales';
import thresholdSlider from '../thresholdSlider';

// useful function
d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY - topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const ldSnpLeadSnpFeature = tnt.board.track.feature()
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
            // .style('stroke-opacity', 0.4)
            .style('stroke-opacity', d => r2ColourScale(d.r2));

        track.g.select('.slider-container').moveToFront();
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
        });
        // .style('stroke-opacity', d => r2ColourScale(d.r2));
        track.g.select('.slider-container').moveToFront();
    })
    .fixed(function (width) {
        const track = this;
        const g = track.g;
        const slider = thresholdSlider();

        slider.value(0.7);
        slider.callback(function () {
            // Show/hide the connections based on the value
            g.selectAll('.ld-snp-lead-snp-connector')
                .classed('below-slider-threshold', false)
                .filter(d => (d.r2 < slider.value()))
                .classed('below-slider-threshold', true);
        });

        const gContainer = g.append('g')
                            .classed('slider-container', true)
                            .attr('transform', 'translate(5,25)');
        gContainer.call(slider, [0.7, 1]);
    });

export default ldSnpLeadSnpFeature;
