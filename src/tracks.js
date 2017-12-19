/* global tnt:true */
/* global d3:true */

// TRACKS

// import axios from 'axios';
// import { getData, getEnsemblSnps } from './data';

// data
import { getAllDataForLocation } from './data/retrieval';

// features
import snpFeature from './features/snpFeature';
import leadSnpFeature from './features/leadSnpFeature';
// import connectorFeature from './features/connectorFeature';
import geneLdSnpFeature from './features/geneLdSnpFeature';
import lineConnectorFeature from './features/lineConnectorFeature';
import halfFixedLineConnectorFeature from './features/halfFixedLineConnectorFeature';
import diseaseFeature from './features/diseaseFeature';

// tooltips
import { snpTooltip, snpTextualInfo } from './tooltips';
import leadSnpTooltip from './tooltips/leadSnpTooltip';
import ldSnpTooltip from './tooltips/ldSnpTooltip';
import geneTooltip from './tooltips/geneTooltip';
import diseaseTooltip from './tooltips/diseaseTooltip';
import leadSnpDiseaseTooltip from './tooltips/leadSnpDiseaseTooltip';
import ldSnpLeadSnpTooltip from './tooltips/ldSnpLeadSnpTooltip';

const boardColor = '#FFFFFF';
const snpTrackBackgroundColor = '#EEE';
let selectedSnp;


let genomeHeight = 50;
let transcriptTrack; // We need to access it from the snpFlatTrack
// Transcript track
function transcript(config) {
    const genome = this;
    const transcriptFeature = tnt.board.track.feature.genome.transcript()
        .color((d) => {
            // if (d.gene && (d.gene.id === config.gene)) {
            //     return '#FF5C5C';
            // }
            // if (d.transcript && d.transcript.gene && d.transcript.gene.id === config.gene) {
            //     return '#FF5C5C';
            // }
            return '#758CAB';
        })
        .on('mouseover', geneTooltip)
        .on('mouseout', () => { geneTooltip.close(); })
        // .on('click', geneTooltip);

    const tCreate = transcriptFeature.create();
    const cCreate = geneLdSnpFeature.create();
    transcriptFeature.create(function (els) {
        cCreate.call(this, els);
        tCreate.call(this, els);
    });

    const tMove = transcriptFeature.move();
    const cMove = geneLdSnpFeature.move();
    transcriptFeature.move(function (els) {
        cMove.call(this, els);
        tMove.call(this, els);
    });

    const tDistribute = transcriptFeature.distribute();
    const cDistribute = geneLdSnpFeature.distribute();
    transcriptFeature.distribute(function (data) {
        // console.log('within distribute');
        // console.log(data);
        // cDistribute.call(this, data);
        tDistribute.call(this, data);
        cDistribute.call(this, data);
    });

    transcriptTrack = tnt.board.track()
        // .label('Target and POSTGAP score')
        .height(genomeHeight)
        .color(boardColor)
        .display(transcriptFeature)
        .data(tnt.board.track.data.async()
            .retriever((loc) => {
                return getAllDataForLocation(loc, config).then(allData => {
                    console.log('allData called by transcript track...');
                    console.log(allData);

                    // update ldSnps
                    ldSnpTrack.data().elements(Object.values(allData.ldSnps));
                    ldSnpTrack.display().update.call(ldSnpTrack);

                    // update leadSnps
                    leadSnpTrack.data().elements(Object.values(allData.leadSnps));
                    leadSnpTrack.display().update.call(leadSnpTrack);

                    // update diseases
                    diseaseLabelTrack.data().elements(Object.values(allData.diseases));
                    diseaseLabelTrack.display().update.call(diseaseLabelTrack);

                    // update ldSnp-leadSnp connectors
                    snpConnectorTrack.data().elements(Object.values(allData.ldSnpLeadSnps));
                    snpConnectorTrack.display().update.call(snpConnectorTrack);

                    // update leadSnp-disease connectors
                    snpDiseaseConnectorTrack.data().elements(Object.values(allData.leadSnpDiseases));
                    snpDiseaseConnectorTrack.display().update.call(snpDiseaseConnectorTrack);

                    // finally, return gene data for transcripts
                    return Object.values(allData.genes);
                });
            }));
        // .data(tnt.board.track.data.genome.canonical());

    // Variable height
    // expand or contract the height of the gene track as needed
    transcriptTrack.display().layout()
        .fixed_slot_type('expanded')
        .keep_slots(false)
        .on_layout_run((types) => {
            // if (selectedSnp) {
            //     const els = transcriptTrack.data().elements();
            //     const from = selectedSnp.pos;
            //     const maxScore = selectedSnp.maxScore;
            //     els.forEach((t) => {
            //         Object.keys(selectedSnp.targets).forEach((g) => {
            //             if (g === t.gene.id) {
            //                 t.connectors = [{
            //                     from,
            //                     to1: t.start,
            //                     to2: t.end,
            //                     id: `${t.id}-${from}`,
            //                     isBest: (selectedSnp.targets[g].score === maxScore),
            //                 }];
            //             }
            //         });
            //     });
            // }

            const neededHeight = types.expanded.needed_slots * types.expanded.slot_height;
            if (neededHeight !== genomeHeight) {
                genomeHeight = neededHeight;
                transcriptTrack.height(neededHeight + 50); // 50 gives more space for connectors
                genome.tracks(genome.tracks());
            }
        });

    return transcriptTrack;
}

const snpFeatureTrackHeight = 15;

let ldSnpTrack;
function snpLDMarker(config) {
    const genome = this;
    let snpClusterData;
    const rest = config.rest;
    ldSnpTrack = tnt.board.track()
        .id('snpLDMarkerTrack')
        .label('Variant')
        .height(snpFeatureTrackHeight)
        .color(snpTrackBackgroundColor)
        .display(snpFeature
            .on('mouseover', ldSnpTooltip)
            .on('mouseout', () => { ldSnpTooltip.close(); })
            // .on('mouseover', function (d) {
            //     return snpTextualInfo.call(this, d, config.gene);
            // })
            // .on('mouseout', () => {
            //     snpTextualInfo.close();
            // })
            // .on('click', function (d) {
            //     snpTooltip.call(this, d, config.gene);
            //     // update the gene track with the connectors to this SNP
            //     selectedSnp = d;
            //     const els = transcriptTrack.data().elements();
            //     // clear prev connectors
            //     els.forEach(t => {
            //         delete (t.connectors);
            //     });

            //     const from = d.pos;
            //     els.forEach((t) => {
            //         Object.keys(d.targets).forEach((g) => {
            //             if (g === t.gene.id) {
            //                 t.connectors = [{
            //                     from,
            //                     to1: t.start,
            //                     to2: t.end,
            //                     id: t.id,
            //                 }];
            //             }
            //         });
            //     });

            //     // Update transcript track
            //     transcriptTrack.data().elements([]);
            //     transcriptTrack.display().update.call(transcriptTrack);
            //     transcriptTrack.data().elements(els);
            //     transcriptTrack.display().update.call(transcriptTrack);
            // }),
        );

    return ldSnpTrack;
}

let leadSnpTrack;
function snpLeadMarker(config) {
    const genome = this;
    let snpClusterData;
    const rest = config.rest;
    leadSnpTrack = tnt.board.track()
        .id('snpLeadMarkerTrack')
        .label('GWAS variant')
        .height(snpFeatureTrackHeight)
        .color(snpTrackBackgroundColor)
        .display(leadSnpFeature
            .on('mouseover', leadSnpTooltip)
            .on('mouseout', () => { leadSnpTooltip.close(); })
            // .on('click', function (d) {
            //     // leadSnpTooltip().show_closer(true).call(this, d);

            //     // highlight ldSnp-leadSnp connnectors
            //     d3.selectAll('.ld-snp-lead-snp-connector')
            //         .classed('highlight', false)
            //         .filter(d2 => {
            //             console.log(d2);
            //             console.log(d);
            //             return d2.leadSnpId === d.id;
            //         })
            //         .classed('highlight', true);

            // //     snpTooltip.call(this, d, config.gene);
            // //     // update the gene track with the connectors to this SNP
            // //     selectedSnp = d;
            // //     const els = transcriptTrack.data().elements();
            // //     // clear prev connectors
            // //     els.forEach(t => {
            // //         delete (t.connectors);
            // //     });

            // //     const from = d.pos;
            // //     els.forEach((t) => {
            // //         Object.keys(d.targets).forEach((g) => {
            // //             if (g === t.gene.id) {
            // //                 t.connectors = [{
            // //                     from,
            // //                     to1: t.start,
            // //                     to2: t.end,
            // //                     id: t.id,
            // //                 }];
            // //             }
            // //         });
            // //     });

            // //     // Update transcript track
            // //     transcriptTrack.data().elements([]);
            // //     transcriptTrack.display().update.call(transcriptTrack);
            // //     transcriptTrack.data().elements(els);
            // //     transcriptTrack.display().update.call(transcriptTrack);
            // }),
        );

    return leadSnpTrack;
}

let snpConnectorTrack;
function snpConnector() {
    snpConnectorTrack = tnt.board.track()
        .id('snpConnectorTrack')
        .label('Linkage disequilibrium')
        .height(100)
        .color(boardColor)
        .display(lineConnectorFeature
            .on('mouseover', ldSnpLeadSnpTooltip)
            .on('mouseout', () => { ldSnpLeadSnpTooltip.close(); }),
        );
    return snpConnectorTrack;
}

let snpDiseaseConnectorTrack;
function snpDiseaseConnector() {
    snpDiseaseConnectorTrack = tnt.board.track()
        .id('snpDiseaseConnectorTrack')
        .label('-log(GWAS p-value)')
        .height(100)
        .color(boardColor)
        .display(halfFixedLineConnectorFeature
            .on('mouseover', leadSnpDiseaseTooltip)
            .on('mouseout', () => { leadSnpDiseaseTooltip.close(); }),
        );

    return snpDiseaseConnectorTrack;
}


// disease track
const diseaseLabelTrackHeight = 300;
let diseaseLabelTrack; // Needs to be accessible to update the data
function diseaseLabel() {
    diseaseLabelTrack = tnt.board.track()
        .height(diseaseLabelTrackHeight)
        .color(boardColor)
        .display(diseaseFeature
            .on('mouseover', diseaseTooltip)
            .on('mouseout', () => { diseaseTooltip.close(); }),
        );
    return diseaseLabelTrack;
}

export {
    transcript,
    snpLDMarker,
    snpLeadMarker,
    snpConnector,
    snpDiseaseConnector,
    diseaseLabel,
};

