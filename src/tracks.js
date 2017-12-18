/* global tnt:true */
/* global d3:true */

// TRACKS

// import axios from 'axios';
// import { getData, getEnsemblSnps } from './data';
import snpFeature from './features/snpFeature';
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
        .on('click', geneTooltip);

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
        // .data(tnt.board.track.data.async()
        //     .retriever((loc) => {
        //         const regionUrl = config.rest.url()
        //             .endpoint('overlap/region/:species/:region')
        //             .parameters({
        //                 species: loc.species,
        //                 region: `${loc.chr}:${loc.from}-${loc.to}`,
        //                 feature: 'gene',
        //             });

        //         // TEST!
        //         getAllDataForLocation(loc, config)

        //         return rest.call(regionUrl)
        //             .then((resp) => {
        //                 // TODO: Get all the postgap SNPS for those genes. For now just look in the files
        //                 const promises = resp.body.map((d) => getData(d.id, config.cttvApi)).filter((d) => d);
        //                 return axios.all(promises);
        //             })
        //             .then((resps) => {
        //                 // join all snps
        //                 const allSnps = resps.reduce((acc, val) => [...acc, ...val.data], []);
        //                 const {
        //                     processedClusters,
        //                     processedDiseases,
        //                     uniqueSnps,
        //                     processedSnps,
        //                 } = processSnps2(allSnps, config);

        //                 console.log('clusters... ', processedClusters);

        //                 console.log(`${Object.keys(processedDiseases).length} unique diseases...`);
        //                 console.log(processedDiseases);

        //                 // make a new call to ensembl to get the position of all the SNPs
        //                 const allPromises = getEnsemblSnps(config.rest, Object.keys(uniqueSnps));
        //                 return axios.all(allPromises)
        //                     .then((allResps) => {
        //                         const allSnpsFromEnsembl = allResps.reduce((acc, val) => [...acc, ...Object.keys(val.body).map((k) => val.body[k])], []);
        //                         setPositions2Snps(allSnpsFromEnsembl,
        //                             processedSnps,
        //                             processedDiseases,
        //                             processedClusters);

        //                         // snpClusterData = [...Object.keys(processedClusters).map(c => processedClusters[c])];
        //                         snpClusterData = processedClusters;

        //                         // Convert snps into array
        //                         let allClusters = Object.keys(processedSnps)
        //                             .map((snpId) => processedSnps[snpId]);

        //                         // Convert diseases into array
        //                         // const allDiseases = Object.keys(processedDiseases)
        //                         //     .map((efoId) => processedDiseases[efoId]);
        //                         // console.log('all diseases...');
        //                         // console.log(allDiseases);
        //                         // Update the disease track for disease diabetes mellitus (EFO_0000400)
        //                         // EFO_0000275: atrial fibrillation
        //                         // EFO_0000400: diabetes mellitus
        //                         // EFO_0000311: cancer
        //                         // EFO_0000180: HIV-infection
        //                         // EFO_0000612: Myocardial infarction
        //                         // EFO_0004518: serum creatinine measurement

        //                         // Disease-Snp track update
        //                         // const thisDisease = processedDiseases.EFO_0004518;
        //                         // const diseaseTrackData = diseaseTrack.data();

        //                         // TODO: (Needs fixing) There may not be snp if we are out of range with the gene
        //                         // const diseaseSnps = Object.keys(thisDisease.snps)
        //                         //     .map((rsId) => thisDisease.snps[rsId])
        //                         //     .filter(s => s.pos); // Remove those without position
        //                         // diseaseTrackData.elements(diseaseSnps);
        //                         // diseaseTrack.display().update.call(diseaseTrack);

        //                         // Remove snps without position
        //                         allClusters = allClusters.filter((d) => d.pos);
        //                         console.log('all flat snps...');
        //                         console.log(allClusters);

        //                         // diseaseTrackData.elements(allClusters);
        //                         // diseaseTrack.display().update.call(diseaseTrack);


        //                         // Lead SNPs
        //                         // TODO: Move data logic for snpLeadMarker here...
        //                         const leadSnps = processSnps2LeadSnps(allSnps);
        //                         // const leadSnpWithPos = leadSnps.map(d => {
        //                         //     const snpData = allClusters.filter(d2 => (d2.id === d))[0]
        //                         //     return {
        //                         //         id: d,
        //                         //         pos: d2.pos
        //                         //     };
        //                         // });
        //                         const leadSnpPos = {};
        //                         leadSnps.forEach(d => {
        //                             const snpData = allClusters.filter(d2 => (d2.id === d));
        //                             if (snpData.length === 1) {
        //                                 leadSnpPos[d] = snpData[0].pos;
        //                             } else {
        //                                 console.log(`LEAD SNP ${d} NOT AN LD SNP`);
        //                             }
        //                         });
        //                         let snpConnections = [];
        //                         allClusters.forEach(ld => {
        //                             // snpConnections = snpConnections.concat(Object.keys(ld.leadSnps).map(lead => ({
        //                             //     id: `${lead}-${ld.id}`,
        //                             //     from: ld.pos,
        //                             //     to: leadSnpPos[lead],
        //                             //     r2: parseFloat(ld.leadSnps[lead].r2),
        //                             // })));
        //                             Object.keys(ld.leadSnps).forEach(lead => {
        //                                 if (Object.keys(leadSnpPos).indexOf(lead) >= 0) {
        //                                     // exists in ld set
        //                                     snpConnections.push({
        //                                         id: `${lead}-${ld.id}`,
        //                                         from: ld.pos,
        //                                         to: leadSnpPos[lead],
        //                                         r2: parseFloat(ld.leadSnps[lead].r2),
        //                                     });
        //                                 }
        //                             });
        //                         });

        //                         // const snpConnectionComparator = (a, b) {
        //                         //     if (a.)
        //                         // }
        //                         snpConnections = _.sortBy(snpConnections, d => d.r2);
        //                         // console.log('snpConnections...');
        //                         // console.log(snpConnections);


        //                         // Disease labels
        //                         const diseaseNames = {};
        //                         allClusters.forEach(ld => {
        //                             Object.keys(ld.diseases).forEach(diseaseName => {
        //                                 diseaseNames[diseaseName] = true;
        //                             });
        //                         });
        //                         const diseaseLabelTrackData = diseaseLabelTrack.data();
        //                         diseaseLabelTrackData.elements(Object.keys(diseaseNames).sort());
        //                         diseaseLabelTrack.display().update.call(diseaseLabelTrack);

        //                         // Snp-Lead Snp connectors
        //                         const snpConnectorTrackData = snpConnectorTrack.data();
        //                         snpConnectorTrackData.elements(snpConnections);
        //                         snpConnectorTrack.display().update.call(snpConnectorTrack);

        //                         // Lead Snp-Disease connectors
        //                         // console.log('processedDiseases...');
        //                         // console.log(processedDiseases);
        //                         let snpDiseaseConnections = {};
        //                         Object.keys(processedDiseases).forEach(efoId => {
        //                             const diseaseObj = processedDiseases[efoId];
        //                             Object.keys(diseaseObj.snps).forEach(snpId => {
        //                                 const snp = diseaseObj.snps[snpId];
        //                                 Object.keys(snp.leadSnps).forEach(leadSnpId => {
        //                                     const leadSnp = snp.leadSnps[leadSnpId];
        //                                     snpDiseaseConnections[`${efoId}-${leadSnpId}`] = {
        //                                         id: `${efoId}-${leadSnpId}`,
        //                                         efoId: efoId,
        //                                         leadSnpId: leadSnpId,
        //                                         leadSnpPos: leadSnpPos[leadSnpId],
        //                                         pval: d3.min(leadSnp.studies, d => d.pvalue),
        //                                     };
        //                                 });
        //                             });
        //                         });
        //                         snpDiseaseConnections = Object.values(snpDiseaseConnections);
        //                         console.log('snpDiseaseConnections...');
        //                         console.log(snpDiseaseConnections);
        //                         const snpDiseaseConnectorTrackData = snpDiseaseConnectorTrack.data();
        //                         snpDiseaseConnectorTrackData.elements(snpDiseaseConnections);
        //                         snpDiseaseConnectorTrack.display().update.call(snpDiseaseConnectorTrack);


        //                         return allClusters;
        //                     });
        //             });
        //     }),
        // );

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
        .display(snpFeature);
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
        // .label('Linkage disequilibrium (r²)')
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
        // No data, this is controlled by the snpFlatTrack

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

