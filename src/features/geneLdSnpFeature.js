/* global tnt:true */
import { v2gScoreColourScale } from '../colourScales';

function getLinePath(topX, topY, bottomX, bottomY) {
    const controlY = (bottomY + topY) / 2;
    return `M${topX},${topY} C${topX},${controlY}, ${bottomX},${controlY} ${bottomX},${bottomY}`;
}

const geneLdSnpFeature = tnt.board.track.feature()
    .index((d) => d.id);

geneLdSnpFeature.distribute(function (transcripts) {
    console.log('geneLdSnpFeature.distribute start');
    const track = this;
    const display = track.display();
    const xScale = display.scale();
    const slotHeight = display.layout().gene_slot().slot_height;
    const y = track.height();

    // const currSlots = {};
    // transcripts.data().forEach((t, i) => {
    //     if (i === 0) { console.log('each transcript...'); console.log(t); }
    //     currSlots[t.id] = t.slot;
    // });

    // override path's d.slot here?
    const connectorsSel = transcripts
        .filter((t) => t.ldSnps);
    connectorsSel
        .data()
        .forEach((d) => {
            Object.values(d.ldSnps).forEach((c) => {
                c.slot = d.slot;
            });
        });

    transcripts.selectAll('.gene-ld-snp-connector')
        // .transition()
        // .duration(200)
        .attr('d', (d, i) => {
            if (i === 0) { console.log('each d...'); console.log(d); }
            const fromX = xScale(d.geneTss);
            const toX = xScale(d.ldSnpPos);
            // const fromY = currSlots[d.geneId] * slotHeight;
            const fromY = d.slot * slotHeight;
            const toY = y;
            return getLinePath(fromX, fromY, toX, toY);
        });
});

geneLdSnpFeature.create(function (sel) {
    console.log('geneLdSnpFeature.create start');
    const track = this;
    const display = track.display();
    const xScale = display.scale();
    const slotHeight = display.layout().gene_slot().slot_height;
    const y = track.height();
    const connectorsSel = sel
        .filter((t) => t.ldSnps);

    connectorsSel
        .data()
        .forEach((d) => {
            Object.values(d.ldSnps).forEach((c) => {
                c.slot = d.slot;
            });
        });

    const con = connectorsSel.selectAll('.gene-ld-snp-connector')
        .data((d) => Object.values(d.ldSnps), (d) => d.id);

    con
        .enter()
        .append('path')
        .attr('class', 'gene-ld-snp-connector')
        .attr('d', (d) => {
            const fromX = xScale(d.geneTss);
            const toX = xScale(d.ldSnpPos);
            const fromY = (d.slot) * slotHeight;
            const toY = y;
            return getLinePath(fromX, fromY, toX, toY);
        })
        // .style('stroke-opacity', 0.4)
        // .style('stroke', 'coral');
        .style('stroke-opacity', d => v2gScoreColourScale(d.ot_g2v_score));


    con.exit().remove();
});

geneLdSnpFeature.move(function (sel) {
    console.log('geneLdSnpFeature.move start');
    const track = this;
    const display = track.display();
    const xScale = display.scale();
    const slotHeight = display.layout().gene_slot().slot_height;
    const y = track.height();
    const connectorsSel = sel
        .filter((t) => t.ldSnps);

    // const currSlots = {};
    // connectorsSel.data().forEach((t) => {
    //     currSlots[t.id] = t.slot;
    // });
    // console.log(currSlots);

    connectorsSel.selectAll('.gene-ld-snp-connector')
        .attr('d', (d, i) => {
            // if (i === 0) { console.log(d); console.log(this); }
            const fromX = xScale(d.geneTss);
            const toX = xScale(d.ldSnpPos);
            // const fromY = 0;
            // const fromY = (currSlots[d.geneId]) * slotHeight;
            const fromY = d.slot * slotHeight;
            const toY = y;
            return getLinePath(fromX, fromY, toX, toY);
        });
    console.log('geneLdSnpFeature.move end');
});
    // .fixed(function (width) {
        // const track = this;
        // const g = track.g;
        // const slider = thresholdSlider();

        // slider.value(0);
        // slider.callback(_.debounce(function () {
        //     console.log('callback!');
        //     // TODO: Here should show/hide the connections based on the value

        //     d3.selectAll('.gene-ld-snp-connector')
        //         .classed('below-slider-threshold', false)
        //         .filter(d => (d.funcgen.ot_g2v_score < slider.value()))
        //         .classed('below-slider-threshold', true);
        // }, 300));
        
        // const gContainer = g.append('g')
        //                     .classed('slider-container', true)
        //                     .attr('transform', 'translate(5,25)');
        // gContainer.call(slider, [0, 1]);
    // });

export default geneLdSnpFeature;
