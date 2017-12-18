/* global tnt:true */
/* global d3:true */

// TRACKS

import axios from 'axios';
import { getData, getEnsemblSnps } from './data';
import snpFeature from './features/snpFeature';
import connectorFeature from './features/connectorFeature';
import lineConnectorFeature from './features/lineConnectorFeature';
import halfFixedLineConnectorFeature from './features/halfFixedLineConnectorFeature';
import diseaseFeature from './features/diseaseFeature';
import { geneTooltip, snpTooltip, snpTextualInfo, clusterTextualInfo } from './tooltips';

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
            if (d.gene && (d.gene.id === config.gene)) {
                return '#FF5C5C';
            }
            if (d.transcript && d.transcript.gene && d.transcript.gene.id === config.gene) {
                return '#FF5C5C';
            }
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
        .data(tnt.board.track.data.genome.canonical());

    // Variable height
    // expand or contract the height of the gene track as needed
    transcriptTrack.display().layout()
        .fixed_slot_type('expanded')
        .keep_slots(false)
        .on_layout_run((types) => {
            if (selectedSnp) {
                const els = transcriptTrack.data().elements();
                const from = selectedSnp.pos;
                const maxScore = selectedSnp.maxScore;
                els.forEach((t) => {
                    Object.keys(selectedSnp.targets).forEach((g) => {
                        if (g === t.gene.id) {
                            t.connectors = [{
                                from,
                                to1: t.start,
                                to2: t.end,
                                id: `${t.id}-${from}`,
                                isBest: (selectedSnp.targets[g].score === maxScore),
                            }];
                        }
                    });
                });
            }

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
function snpLDMarker(config) {
    const genome = this;
    let snpClusterData;
    const rest = config.rest;
    const snpFlatTrack = tnt.board.track()
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
        )
        .data(tnt.board.track.data.async()
            .retriever((loc) => {
                const regionUrl = config.rest.url()
                    .endpoint('overlap/region/:species/:region')
                    .parameters({
                        species: loc.species,
                        region: `${loc.chr}:${loc.from}-${loc.to}`,
                        feature: 'gene',
                    });
                return rest.call(regionUrl)
                    .then((resp) => {
                        // TODO: Get all the postgap SNPS for those genes. For now just look in the files
                        const promises = resp.body.map((d) => getData(d.id, config.cttvApi)).filter((d) => d);
                        return axios.all(promises);
                    })
                    .then((resps) => {
                        // join all snps
                        const allSnps = resps.reduce((acc, val) => [...acc, ...val.data], []);
                        const {
                            processedClusters,
                            processedDiseases,
                            uniqueSnps,
                            processedSnps,
                        } = processSnps2(allSnps, config);

                        console.log('clusters... ', processedClusters);

                        console.log(`${Object.keys(processedDiseases).length} unique diseases...`);
                        console.log(processedDiseases);

                        // make a new call to ensembl to get the position of all the SNPs
                        const allPromises = getEnsemblSnps(config.rest, Object.keys(uniqueSnps));
                        return axios.all(allPromises)
                            .then((allResps) => {
                                const allSnpsFromEnsembl = allResps.reduce((acc, val) => [...acc, ...Object.keys(val.body).map((k) => val.body[k])], []);
                                setPositions2Snps(allSnpsFromEnsembl,
                                    processedSnps,
                                    processedDiseases,
                                    processedClusters);

                                // snpClusterData = [...Object.keys(processedClusters).map(c => processedClusters[c])];
                                snpClusterData = processedClusters;

                                // Convert snps into array
                                let allClusters = Object.keys(processedSnps)
                                    .map((snpId) => processedSnps[snpId]);

                                // Convert diseases into array
                                // const allDiseases = Object.keys(processedDiseases)
                                //     .map((efoId) => processedDiseases[efoId]);
                                // console.log('all diseases...');
                                // console.log(allDiseases);
                                // Update the disease track for disease diabetes mellitus (EFO_0000400)
                                // EFO_0000275: atrial fibrillation
                                // EFO_0000400: diabetes mellitus
                                // EFO_0000311: cancer
                                // EFO_0000180: HIV-infection
                                // EFO_0000612: Myocardial infarction
                                // EFO_0004518: serum creatinine measurement

                                // Disease-Snp track update
                                // const thisDisease = processedDiseases.EFO_0004518;
                                // const diseaseTrackData = diseaseTrack.data();

                                // TODO: (Needs fixing) There may not be snp if we are out of range with the gene
                                // const diseaseSnps = Object.keys(thisDisease.snps)
                                //     .map((rsId) => thisDisease.snps[rsId])
                                //     .filter(s => s.pos); // Remove those without position
                                // diseaseTrackData.elements(diseaseSnps);
                                // diseaseTrack.display().update.call(diseaseTrack);

                                // Remove snps without position
                                allClusters = allClusters.filter((d) => d.pos);
                                console.log('all flat snps...');
                                console.log(allClusters);

                                // diseaseTrackData.elements(allClusters);
                                // diseaseTrack.display().update.call(diseaseTrack);


                                // Lead SNPs
                                // TODO: Move data logic for snpLeadMarker here...
                                const leadSnps = processSnps2LeadSnps(allSnps);
                                // const leadSnpWithPos = leadSnps.map(d => {
                                //     const snpData = allClusters.filter(d2 => (d2.id === d))[0]
                                //     return {
                                //         id: d,
                                //         pos: d2.pos
                                //     };
                                // });
                                const leadSnpPos = {};
                                leadSnps.forEach(d => {
                                    const snpData = allClusters.filter(d2 => (d2.id === d));
                                    if (snpData.length === 1) {
                                        leadSnpPos[d] = snpData[0].pos;
                                    } else {
                                        console.log(`LEAD SNP ${d} NOT AN LD SNP`);
                                    }
                                });
                                let snpConnections = [];
                                allClusters.forEach(ld => {
                                    // snpConnections = snpConnections.concat(Object.keys(ld.leadSnps).map(lead => ({
                                    //     id: `${lead}-${ld.id}`,
                                    //     from: ld.pos,
                                    //     to: leadSnpPos[lead],
                                    //     r2: parseFloat(ld.leadSnps[lead].r2),
                                    // })));
                                    Object.keys(ld.leadSnps).forEach(lead => {
                                        if (Object.keys(leadSnpPos).indexOf(lead) >= 0) {
                                            // exists in ld set
                                            snpConnections.push({
                                                id: `${lead}-${ld.id}`,
                                                from: ld.pos,
                                                to: leadSnpPos[lead],
                                                r2: parseFloat(ld.leadSnps[lead].r2),
                                            });
                                        }
                                    });
                                });

                                // const snpConnectionComparator = (a, b) {
                                //     if (a.)
                                // }
                                snpConnections = _.sortBy(snpConnections, d => d.r2);
                                // console.log('snpConnections...');
                                // console.log(snpConnections);


                                // Disease labels
                                const diseaseNames = {};
                                allClusters.forEach(ld => {
                                    Object.keys(ld.diseases).forEach(diseaseName => {
                                        diseaseNames[diseaseName] = true;
                                    });
                                });
                                const diseaseLabelTrackData = diseaseLabelTrack.data();
                                diseaseLabelTrackData.elements(Object.keys(diseaseNames).sort());
                                diseaseLabelTrack.display().update.call(diseaseLabelTrack);

                                // Snp-Lead Snp connectors
                                const snpConnectorTrackData = snpConnectorTrack.data();
                                snpConnectorTrackData.elements(snpConnections);
                                snpConnectorTrack.display().update.call(snpConnectorTrack);

                                // Lead Snp-Disease connectors
                                // console.log('processedDiseases...');
                                // console.log(processedDiseases);
                                let snpDiseaseConnections = {};
                                Object.keys(processedDiseases).forEach(efoId => {
                                    const diseaseObj = processedDiseases[efoId];
                                    Object.keys(diseaseObj.snps).forEach(snpId => {
                                        const snp = diseaseObj.snps[snpId];
                                        Object.keys(snp.leadSnps).forEach(leadSnpId => {
                                            const leadSnp = snp.leadSnps[leadSnpId];
                                            snpDiseaseConnections[`${efoId}-${leadSnpId}`] = {
                                                id: `${efoId}-${leadSnpId}`,
                                                efoId: efoId,
                                                leadSnpId: leadSnpId,
                                                leadSnpPos: leadSnpPos[leadSnpId],
                                                pval: d3.min(leadSnp.studies, d => d.pvalue),
                                            };
                                        });
                                    });
                                });
                                snpDiseaseConnections = Object.values(snpDiseaseConnections);
                                console.log('snpDiseaseConnections...');
                                console.log(snpDiseaseConnections);
                                const snpDiseaseConnectorTrackData = snpDiseaseConnectorTrack.data();
                                snpDiseaseConnectorTrackData.elements(snpDiseaseConnections);
                                snpDiseaseConnectorTrack.display().update.call(snpDiseaseConnectorTrack);


                                return allClusters;
                            });
                    });
            }),
        );

    return snpFlatTrack;
}

function snpLeadMarker(config) {
    const genome = this;
    let snpClusterData;
    const rest = config.rest;
    const snpFlatTrack = tnt.board.track()
        .id('snpLeadMarkerTrack')
        .height(snpFeatureTrackHeight)
        .color(snpTrackBackgroundColor)
        .display(snpFeature)
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
        .data(tnt.board.track.data.async()
            .retriever((loc) => {
                const regionUrl = config.rest.url()
                    .endpoint('overlap/region/:species/:region')
                    .parameters({
                        species: loc.species,
                        region: `${loc.chr}:${loc.from}-${loc.to}`,
                        feature: 'gene',
                    });
                return rest.call(regionUrl)
                    .then((resp) => {
                        // TODO: Get all the postgap SNPS for those genes. For now just look in the files
                        const promises = resp.body.map((d) => getData(d.id, config.cttvApi)).filter((d) => d);
                        return axios.all(promises);
                    })
                    .then((resps) => {
                        // join all snps
                        const allSnps = resps.reduce((acc, val) => [...acc, ...val.data], []);
                        const leadSnps = processSnps2LeadSnps(allSnps);
                        console.log('lead snp ids... ', leadSnps);

                        // make a new call to ensembl to get the position of all the SNPs
                        // const allPromises = getEnsemblSnps(config.rest, Object.keys(leadSnps));
                        const allPromises = getEnsemblSnps(config.rest, leadSnps);
                        return axios.all(allPromises)
                            .then((allResps) => {
                                const allLeadSnpsFromEnsembl = allResps.reduce((acc, val) => [...acc, ...Object.keys(val.body).map((k) => val.body[k])], []);
                                const finalData = snpData2pos(allLeadSnpsFromEnsembl);
                                console.log('lead snp ensembl...', allLeadSnpsFromEnsembl);
                                console.log('lead snp ensembl...', finalData);
                                return finalData;
                            });
                    });
            }),
        );

    return snpFlatTrack;
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


function snpData2pos(ensemblData) {
    return ensemblData.map(d => ({
        id: d.name,
        pos: d.mappings[0].start,
    }));
}

function setPositions2Snps(allSnps, processedSnps, processedDiseases, processedClusters) {
    const oSnpsPos = ensemblSnps2Array(allSnps);

    Object.keys(processedSnps).forEach((snpId) => {
        const snp = processedSnps[snpId];
        snp.pos = oSnpsPos[snp.id];
    });

    Object.keys(processedDiseases).forEach((efoId) => {
        const d = processedDiseases[efoId];
        Object.keys(d.snps).forEach(snpId => {
            d.snps[snpId].pos = oSnpsPos[snpId];
        });
    });

    Object.keys(processedClusters).forEach(gwasSnp => {
        const c = processedClusters[gwasSnp];
        Object.keys(c.diseases).forEach(d => {
            const disease = c.diseases[d];
            disease.snps.forEach((snp) => {
                snp.pos = oSnpsPos[snp.rsId];
            });
            disease.snps = disease.snps.filter(d => d.pos);
            [disease.start, disease.end] = d3.extent(disease.snps, (d) => d.pos);
        });
    });
}

function processSnps2(snps, config) {
    const processedDiseases = {};
    const processedClusters = {};
    const uniqueSnps = {};
    const processedSnps = {};

    snps.forEach((snp) => {
        // console.log(snp)
        const ensId = snp.target.id.split('/').pop();
        const leadSnp = snp.evidence.variant2disease.lead_snp_rsid;
        const rsId = snp.variant.id.split('/')[4];
        const efoId = snp.disease.id.split('/').pop();
        const pvalue = snp.evidence.variant2disease.resource_score.value;
        const literature = snp.evidence.variant2disease.provenance_type.literature.references.map((l) => l.lit_id.split('/')[5]);
        const scoresRaw = snp.evidence.gene2variant.metadata.funcgen;
        const r2 = snp.unique_association_fields.r2;

        // Take only the these scores
        // (there are other fields in the scores object that are not scores strictly)
        const scoreSources = ['gtex_score', 'fantom5_score', 'dhs_score', 'pchic_score', 'regulome_score'];
        const scores = Object.keys(scoresRaw)
            .filter((key) => scoreSources.includes(key))
            .reduce((obj, key) => {
                obj[key] = scoresRaw[key];
                return obj;
            }, {});

        // Filter out snps with max individual score < 0.2
        const maxScore = d3.max(Object.keys(scores).map((d) => scores[d] || 0));
        if (maxScore < 0.2) {
            return;
        }

        uniqueSnps[rsId] = true;

        // New processed gwas SNP / target (only if associated with target)
        if (ensId === config.gene) {
            if (!processedClusters[leadSnp]) {
                processedClusters[leadSnp] = {
                    leadSnp,
                    targets: {},
                    diseases: {},
                    // snps: [],
                    // display_label: leadSnp,
                };
            }
            const c = processedClusters[leadSnp];
            // if (!c.targets[ensId]) {
            //     c.targets[ensId] = {
            //         external_name: leadSnp,
            //         display_label: leadSnp,
            //         id: `${leadSnp}-${ensId}`,
            //         target: ensId,
            //         snps: [],
            //     };
            // }
            if (!c.diseases[efoId]) {
                c.diseases[efoId] = {
                    external_name: `${leadSnp} - ${efoId}`,
                    display_label: `${efoId} (via ${leadSnp})`,
                    id: `${leadSnp}-${efoId}`,
                    disease: efoId,
                    gwasSnp: leadSnp,
                    snps: [],
                };
            }
            if (rsId === leadSnp) {
                c.diseases[efoId].score = pvalue;
            }
            // c.targets[ensId].snps.push({
            //     target: ensId,
            //     gwasSnp: leadSnp,
            //     rsId,
            //     id: `${leadSnp}-${ensId}-${rsId}`,
            // });
            c.diseases[efoId].snps.push({
                disease: efoId,
                gwasSnp: leadSnp,
                rsId,
                id: `${leadSnp}-${efoId}-${rsId}`,
            });
        }

        // New processed diseases... only if associated with the target
        if (ensId === config.gene) {
            if (!processedDiseases[efoId]) {
                processedDiseases[efoId] = {
                    id: efoId,
                    snps: {},
                    targets: {},
                };
            }

            const d = processedDiseases[efoId];
            // d.targets[ensId] = {
            //     target: ensId,
            // };

            if (!d.snps[rsId]) {
                d.snps[rsId] = {
                    id: rsId,
                    leadSnps: {},
                    pvalue,
                };
            }
            if (d.snps[rsId].pvalue > pvalue) {
                d.snps[rsId].pvalue = pvalue;
            }
            if (!d.snps[rsId].leadSnps[leadSnp]) {
                d.snps[rsId].leadSnps[leadSnp] = {
                    snp: leadSnp,
                    studies: [],
                };
            }
            d.snps[rsId].leadSnps[leadSnp].studies.push({
                pvalue,
                literature,
            });
        }

        // New processed SNPs...
        if (!processedSnps[rsId]) {
            processedSnps[rsId] = {
                id: rsId,
                maxScore: -Infinity,
                bestPval: 1,
                pvalue: 1,
                targets: {},
                diseases: {},
                leadSnps: {},
            };
        }

        const g = processedSnps[rsId];
        if (g.maxScore < maxScore) {
            g.maxScore = maxScore;
        }

        // target
        g.targets[ensId] = {
            target: ensId,
            score: maxScore,
            funcgen: scores,
        };

        // If this is the selected gene, grab its score
        if (ensId === config.gene) {
            if (!g.score || (g.score < maxScore)) {
                g.score = maxScore;
            }
        }

        // disease and studies
        if (pvalue < g.bestPval) {
            g.bestPval = pvalue;
        }

        // If this is the selected disease, grab its pval
        if (efoId === config.disease) {
            if (!g.pvalue || (g.pvalue > pvalue)) {
                g.pvalue = pvalue;
            }
        }

        if (!g.diseases[efoId]) {
            g.diseases[efoId] = {
                disease: efoId,
                studies: [],
            };
        }
        g.diseases[efoId].studies.push({
            pvalue,
            literature,
        });

        // leadSnps
        g.leadSnps[leadSnp] = {
            leadSnp,
            r2,
        };
    });

    return {
        processedClusters,
        processedDiseases,
        uniqueSnps,
        processedSnps,
    };
}

function processSnps2LeadSnps(snps) {
    const uniqueLeadSnps = {};
    snps.forEach((snp) => {
        uniqueLeadSnps[snp.evidence.variant2disease.lead_snp_rsid] = true;
    });
    return Object.keys(uniqueLeadSnps);
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

function ensemblSnps2Array(allSnps) {
    const oSnps = {};
    for (const snp of allSnps) {
        if (snp.mappings && snp.mappings.length) {
            oSnps[snp.name] = snp.mappings[0].start;
        }
    }
    return oSnps;
}

export {
    transcript,
    snpLDMarker,
    snpLeadMarker,
    snpConnector,
    snpDiseaseConnector,
    diseaseLabel,
};

