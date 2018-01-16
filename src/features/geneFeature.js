/* global tnt:true */

import geneTooltip from '../tooltips/geneTooltip';
import geneHighlight from '../highlights/geneHighlight';

const geneFeature = tnt.board.track.feature.genome.transcript()
        .color(d => ('#758CAB'))
        .on('mouseover', geneTooltip)
        .on('mouseout', () => { geneTooltip.close(); })
        .on('click', geneHighlight);

// override create
geneFeature.create(function (new_elems) {
    const track = this;
    const xScale = geneFeature.scale();
    const gs = new_elems
        .append('g')
        .attr('transform', function (d) {
            return 'translate(' + xScale(d.start) + ',' + (geneFeature.layout().gene_slot().slot_height * d.slot) + ')';
        });

    gs
        .append('line')
        .classed('gene-axis', true)
        .attr('x1', 0)
        .attr('y1', ~~(geneFeature.layout().gene_slot().gene_height/2))
        .attr('x2', function (d) {
            return (xScale(d.end) - xScale(d.start));
        })
        .attr('y2', ~~(geneFeature.layout().gene_slot().gene_height/2))
        .attr('fill', 'none')
        .attr('stroke', track.color())
        .attr('stroke-width', 2)
        .transition()
        .duration(500)
        .attr('stroke', function (d) {
            return geneFeature.color()(d);
        });
        //.attr('stroke', feature.color());

    // exons
    // pass the 'slot' to the exons and introns
    new_elems.each(function (d) {
        if (d.exons) {
            for (var i=0; i<d.exons.length; i++) {
                d.exons[i].slot = d.slot;
            }
        }
    });

    const exons = gs.selectAll('.exons')
        .data(function (d) {
            return d.exons || [];
        }, function (d) {
            return d.start;
        });

    exons
        .enter()
        .append('rect')
        .attr('class', 'tnt_exons')
        .attr('x', function (d) {
            return (xScale(d.start + d.offset) - xScale(d.start));
        })
        .attr('y', 0)
        .attr('width', function (d) {
            return (xScale(d.end) - xScale(d.start));
        })
        .attr('height', geneFeature.layout().gene_slot().gene_height)
        .attr('fill', track.color())
        .attr('stroke', track.color())
        .transition()
        .duration(500)
        //.attr('stroke', feature.color())
        .attr('stroke', function (d) {
            return geneFeature.color()(d);
        })
        .attr('fill', function (d) {
            if (d.coding) {
                return geneFeature.color()(d);
            }
            if (d.coding === false) {
                return track.color();
            }
            return geneFeature.color()(d);
        });

    // labels
    gs
        .append('text')
        .attr('class', 'tnt_name')
        .attr('x', 0)
        .attr('y', 25)
        .attr('fill', track.color())
        .text(function (d) {
            if (geneFeature.layout().gene_slot().show_label) {
                return d.display_label;
            } else {
                return '';
            }
        })
        .style('font-weight', 'normal')
        .transition()
        .duration(500)
        .attr('fill', function (d) {
            return geneFeature.color()(d);
        });

    // connector
    gs.append('line')
        .classed('gene-ld-snp-connector', true)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 1000);
});

// override move
geneFeature.move(function (transcripts) {
    const xScale = geneFeature.scale();
    const gs = transcripts.select('g')
        .attr('transform', function (d) {
            return 'translate(' + xScale(d.start) + ',' + (geneFeature.layout().gene_slot().slot_height * d.slot) + ')';
        });
    gs.selectAll('line.gene-axis')
        .attr('x2', function (d) {
            return (xScale(d.end) - xScale(d.start));
        })
        .attr('y1', ~~(geneFeature.layout().gene_slot().gene_height/2))
        .attr('y2', ~~(geneFeature.layout().gene_slot().gene_height/2));
        // .attr('width', function (d) {
        //     return (xScale(d.end) - xScale(d.start));
        // })
    gs.selectAll('rect')
        .attr('width', function (d) {
            return (xScale(d.end) - xScale(d.start));
        });
    gs.selectAll('.tnt_exons')
        .attr('x', function (d) {
            return (xScale(d.start + d.offset) - xScale(d.start));
        });
});

// override distribute
geneFeature.distribute(function (transcripts) {
    const track = this;
    const xScale = geneFeature.scale();
    const gs = transcripts.select('g')
        .transition()
        .duration(200)
        .attr('transform', function (d) {
            return 'translate(' + xScale(d.start) + ',' + (geneFeature.layout().gene_slot().slot_height * d.slot) + ')';
        });
    gs
        .selectAll('rect')
        .attr('height', geneFeature.layout().gene_slot().gene_height);
    gs
        .selectAll('line.gene-axis')
        .attr('x2', function (d) {
            return (xScale(d.end) - xScale(d.start));
        })
        .attr('y1', ~~(geneFeature.layout().gene_slot().gene_height/2))
        .attr('y2', ~~(geneFeature.layout().gene_slot().gene_height/2));
    gs
        .select('text')
        .text(function (d) {
            if (geneFeature.layout().gene_slot().show_label) {
                return d.display_label;
            }
            return '';
        });
});

export default geneFeature;
