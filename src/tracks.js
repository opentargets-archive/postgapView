/* global tnt:true */
/* global d3:true */

// TRACKS

// import axios from 'axios';
// import { getData, getEnsemblSnps } from './data';
import snpFeature from './features/snpFeature';
import leadSnpFeature from './features/leadSnpFeature';
import connectorFeature from './features/connectorFeature';
import lineConnectorFeature from './features/lineConnectorFeature';
import halfFixedLineConnectorFeature from './features/halfFixedLineConnectorFeature';
import diseaseFeature from './features/diseaseFeature';
import { geneTooltip, snpTooltip, snpTextualInfo } from './tooltips';
import { getAllDataForLocation } from './data/retrieval';

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
        // .on('click', geneTooltip);

    const tCreate = transcriptFeature.create();
    const cCreate = connectorFeature.create();
    transcriptFeature.create(function (els) {
        cCreate.call(this, els);
        tCreate.call(this, els);
    });

    const tMove = transcriptFeature.move();
    const cMove = connectorFeature.move();
    transcriptFeature.move(function (els) {
        cMove.call(this, els);
        tMove.call(this, els);
    });

    const tDistribute = transcriptFeature.distribute();
    const cDistribute = connectorFeature.distribute();
    transcriptFeature.distribute(function (data) {
        // console.log('within distribute');
        // console.log(data);
        cDistribute.call(this, data);
        tDistribute.call(this, data);
    });

    transcriptTrack = tnt.board.track()
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
                transcriptTrack.height(neededHeight);
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
        .height(snpFeatureTrackHeight)
        .color(snpTrackBackgroundColor)
        .display(snpFeature
            .on('mouseover', function (d) {
                return snpTextualInfo.call(this, d, config.gene);
            })
            .on('mouseout', () => {
                snpTextualInfo.close();
            })
            .on('click', function (d) {
                snpTooltip.call(this, d, config.gene);
                // update the gene track with the connectors to this SNP
                selectedSnp = d;
                const els = transcriptTrack.data().elements();
                // clear prev connectors
                els.forEach(t => {
                    delete (t.connectors);
                });

                const from = d.pos;
                els.forEach((t) => {
                    Object.keys(d.targets).forEach((g) => {
                        if (g === t.gene.id) {
                            t.connectors = [{
                                from,
                                to1: t.start,
                                to2: t.end,
                                id: t.id,
                            }];
                        }
                    });
                });

                // Update transcript track
                transcriptTrack.data().elements([]);
                transcriptTrack.display().update.call(transcriptTrack);
                transcriptTrack.data().elements(els);
                transcriptTrack.display().update.call(transcriptTrack);
            }),
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
        .height(snpFeatureTrackHeight)
        .color(snpTrackBackgroundColor)
        .display(leadSnpFeature);
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
        // )

    return leadSnpTrack;
}

let snpConnectorTrack;
function snpConnector() {
    snpConnectorTrack = tnt.board.track()
        .id('snpConnectorTrack')
        .label('Linkage<br/>disequilibrium')
        .height(100)
        .color(boardColor)
        .display(lineConnectorFeature);

    return snpConnectorTrack;
}

let snpDiseaseConnectorTrack;
function snpDiseaseConnector() {
    snpDiseaseConnectorTrack = tnt.board.track()
        .id('snpDiseaseConnectorTrack')
        // .label('GWAS p-value')
        .height(100)
        .color(boardColor)
        .display(halfFixedLineConnectorFeature);

    return snpDiseaseConnectorTrack;
}


// disease track
const diseaseLabelTrackHeight = 100;
let diseaseLabelTrack; // Needs to be accessible to update the data
function diseaseLabel() {
    diseaseLabelTrack = tnt.board.track()
        .height(diseaseLabelTrackHeight)
        .color(boardColor)
        .display(diseaseFeature,
            // .on('click', (d) => {
            //     console.log(d);
            // }),
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

