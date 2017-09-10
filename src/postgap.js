/* global tnt:true */
/* global d3:true */

import tntRest from 'tnt.rest';
import axios from 'axios';
import getData from './data';
import funnelFeature from './funnelFeature';
import { geneTooltip, leadSnpTooltip, ldSnpTooltip } from './tooltips';

const rest = tntRest()
    .protocol('https')
    .domain('rest.ensembl.org');

const gene = 'SORT1';
const boardColor = '#FFFFFF';
const width = 950;
let genomeHeight = 50;
let selectedLd;

export default function () {
    const render = function (container, container2) {
        console.log(container);
        getData()
            .then((resp) => {
                console.log(resp);
                buildBrowser(resp.data, container, container2);
            })
            .catch((err) => {
                console.trace(err.message);
            });
    };
    return render;
}
function buildBrowser(postgapData, container, container2) {
    const snpsRes = getLeadSnps(postgapData);
    snpsRes.then((resps) => {
        const leadSnps = reformatSnps(postgapData, resps[0].body);
        const extent = calcExtent(resps[0].body, resps[1].body);
        const chr = resps[1].body.seq_region_name;

        // TRACKS
        // Transcript track
        const transcriptTrack = tnt.board.track()
            .height(genomeHeight)
            .color(boardColor)
            .display(tnt.board.track.feature.genome.transcript()
                .color((t) => {
                    if (t.isGene) {
                        return '#005588';
                    }
                    return '#fc8d62';
                })
                .on('click', geneTooltip),
            );
            // .data(tnt.board.track.data.genome.transcript());

        // Variable height
        // expand or contract the height of the gene track as needed
        transcriptTrack.display().layout()
            .fixed_slot_type('expanded')
            .keep_slots(false)
            .on_layout_run((types) => {
                const neededHeight = types.expanded.needed_slots * types.expanded.slot_height;
                if (neededHeight !== genomeHeight) {
                    genomeHeight = neededHeight;
                    transcriptTrack.height(neededHeight);
                    genome.tracks(genome.tracks());
                }
            });


        // We only want canonical transcripts
        const mixedData = tnt.board.track.data.genome.gene();
        const geneUpdater = mixedData.retriever();
        const eRest = tnt.board.track.data.genome.ensembl.protocol('https');
        mixedData.retriever(function (loc) {
            return geneUpdater.call(transcriptTrack, loc)
                .then((genes) => { // genes
                    for (let i = 0; i < genes.length; i += 1) {
                        genes[i].key = genes[i].id;
                        genes[i].isGene = true;
                        genes[i].exons = [{
                            start: genes[i].start,
                            end: genes[i].end,
                            coding: true,
                            offset: 0,
                            isGene: true,
                        }];
                    }

                    const url = eRest.url()
                        .endpoint('xrefs/symbol/:species/:symbol')
                        .parameters({
                            species: 'human',
                            symbol: gene,
                        });
                    return eRest.call(url)
                        .then((resp) => resp.body[0].id)
                        .then((ensId) => {
                            const url2 = eRest.url()
                                .endpoint('lookup/id/:id')
                                .parameters({
                                    id: ensId,
                                    expand: true,
                                });
                            return eRest.call(url2);
                        })
                        .then((resp) => { // transcripts + exons
                            const g = resp.body;
                            const tss = tnt.board.track.data.genome.transcript().gene2Transcripts(g);

                            genes = genes.concat(tss);
                            return genes;
                        });
                });
        });
        transcriptTrack.data(mixedData);

        // Lead snps track
        const leadSnpsTrack = tnt.board.track()
            .label('Lead Snps')
            .height(150)
            .color(boardColor)
            .display(tnt.board.track.feature.pin()
                // .index((d) => `${d.lead_snp.rsid}`)
                .color('#8da0cb')
                .domain(d3.extent(leadSnps, (d) => d.val))
                .on('click', function (lead) {
                    leadSnpTooltip.call(this, lead);
                    console.log(lead);
                    console.log('applying these ld_snps...');
                    console.log(lead.ld_snps);
                    const ldSnpsTrackData = ldSnpsTrack.data(); // tnt.board.track.data.empty
                    const funnelTrackData = funnelTrack.data();
                    const ldSnpsTrackDisplay = ldSnpsTrack.display(); // tnt.board.track.feature.pin

                    // Remove prev data in the ld snps track
                    ldSnpsTrackData.elements([]);
                    ldSnpsTrack.display().update.call(ldSnpsTrack);

                    // remove prev new ld board (if any)
                    d3.select(container2).selectAll('*').remove();
                    getLdSnps(lead.ld_snps)
                        .then((ldSnps) => {
                            // const r2Extent = d3.extent(ldSnps, (d) => d.r2);
                            const pgScoreExtent = d3.extent(ldSnps, (d) => d.fg_scores.postgap_score);
                            const posExtent = d3.extent(ldSnps, (d) => d.pos);

                            // Update ld snps track
                            // ldSnpsTrackDisplay.domain([r2Extent[0] - 0.1, ((r2Extent[1] + 0.1) > 1 ? 1 : (r2Extent[1] + 0.1))]);
                            // ldSnpsTrackDisplay.domain([pgScoreExtent[0] - 0.1, ((pgScoreExtent[1] + 0.1) > 1 ? 1 : (pgScoreExtent[1] + 0.1))]);
                            ldSnpsTrackDisplay.domain([pgScoreExtent[0], pgScoreExtent[1]]);
                            ldSnpsTrackData.elements(ldSnps.map((d) => {
                                d.val = d.fg_scores.postgap_score;
                                return d;
                            }));
                            ldSnpsTrack.display().update.call(ldSnpsTrack);

                            // Update funnelTrack
                            funnelTrack.data()
                                .retriever(() => [{
                                    from: posExtent[0],
                                    to: posExtent[1],
                                }],
                            );
                            funnelTrackData.elements([{
                                from: posExtent[0],
                                to: posExtent[1],
                            }]);
                            funnelTrack.display().update.call(funnelTrack);

                            // Now create a new board with the ld snps
                            // Axis track
                            const axisTrack = tnt.board.track()
                                .height(0)
                                .color('white')
                                .display(tnt.board.track.feature.axis()
                                    .orientation('top'),
                                );

                            const newLdTrack = tnt.board.track()
                                .label('Snps in LD with the lead Snp')
                                .height(120)
                                .color(boardColor)
                                .display(tnt.board.track.feature.pin()
                                    // .domain([r2Extent[0] - 0.1, ((r2Extent[1] + 0.1) > 1 ? 1 : (r2Extent[1] + 0.1))])
                                    // .domain([1, 54]) // global postgap scores range
                                    // .domain([pgScoreExtent[0] - 0.1, ((pgScoreExtent[1] + 0.1) > 1 ? 1 : (pgScoreExtent[1] + 0.1))])
                                    .domain([pgScoreExtent[0], pgScoreExtent[1]])
                                    // .color('#a6d854')
                                    .color((d) => {
                                        if (d.gene_symbol === gene) {
                                            return '#a6d854';
                                        }
                                        return '#aaaaaa';
                                    })
                                    .on('click', function(d) {
                                        // Highlight the gene is associated
                                        if (selectedLd === `${d.rsid}-${d.gene_id}`) {
                                            selectedLd = '';
                                            const els = transcriptTrack.data().elements();
                                            transcriptTrack.data().elements([]);
                                            transcriptTrack.display().update.call(transcriptTrack);
                                            transcriptTrack.display()
                                                .color((t) => {
                                                    if (t.isGene) {
                                                        return '#005588';
                                                    }
                                                    return '#fc8d62';
                                                });
                                            transcriptTrack.data().elements(els);
                                            transcriptTrack.display().update.call(transcriptTrack);

                                            const ldEls = newLdTrack.data().elements();
                                            newLdTrack.data().elements([]);
                                            newLdTrack.display().update.call(newLdTrack);
                                            newLdTrack.display()
                                                .color((d) => {
                                                    if (d.gene_symbol === gene) {
                                                        return '#a6d854';
                                                    }
                                                    return '#aaaaaa';
                                                });
                                            newLdTrack.data().elements(ldEls);
                                            newLdTrack.display().update.call(newLdTrack);
                                        }
                                        else {
                                            ldSnpTooltip.call(this, d);
                                            selectedLd = `${d.rsid}-${d.gene_id}`;
                                            const thisGeneId = d.gene_id;
                                            const els = transcriptTrack.data().elements();
                                            transcriptTrack.data().elements([]);
                                            transcriptTrack.display().update.call(transcriptTrack);
                                            transcriptTrack.display().color((t) => {
                                                if (t.id === thisGeneId) {
                                                    return 'blue';
                                                }
                                                return '#aaaaaa';
                                            });
                                            transcriptTrack.data().elements(els);
                                            transcriptTrack.display().update.call(transcriptTrack);

                                            // Highlight the LD Snp as well
                                            const ldEls = newLdTrack.data().elements();
                                            newLdTrack.data().elements([]);
                                            newLdTrack.display().update.call(newLdTrack);
                                            newLdTrack.display().color((t) => {
                                                if ((t.rsid === d.rsid) && (t.gene_id === d.gene_id)) {
                                                    return 'red';
                                                }
                                                return '#aaaaaa';
                                            });
                                            newLdTrack.data().elements(ldEls);
                                            newLdTrack.display().update.call(newLdTrack);
                                        }
                                    }),
                                )
                                // .data(ldSnpsTrackData);
                                .data(tnt.board.track.data.sync()
                                    .retriever(() => {
                                        // return the ones associated with the current gene first!
                                        return ldSnps.sort((a, b) => {
                                            if (a.gene_symbol === gene) {
                                                return 1;
                                            }
                                            if (b.gene_symbol === gene) {
                                                return -1;
                                            }
                                            return 0;
                                        });
                                    }),
                                );
                            const minCoord = posExtent[0] - 1000;
                            const maxCoord = posExtent[1] + 1000;
                            const from = minCoord;
                            const to = maxCoord;
                            const board2 = tnt.board()
                                .zoom_out(maxCoord - minCoord)
                                .min(minCoord)
                                .max(maxCoord)
                                .from(from)
                                .to(to)
                                .width(width);
                            board2.add_track(axisTrack);
                            board2.add_track(newLdTrack);

                            board2(container2);
                            board2.start();
                            console.log('ok!');
                        });

                }),
            )
            .data(tnt.board.track.data.sync()
                .retriever(() => leadSnps),
            );

        // Ld snps track (in browser)
        const ldSnpsTrack = tnt.board.track()
            .height(80)
            .color(boardColor)
            .display(tnt.board.track.feature.pin()
                .index((d) => `${d.rsid}-${d.gene_id}`)
                // .domain([0.7, 1])
                .domain([1, 54]) // global postgap scores range
                .color('#a6d854'),
            ); // No data, will be set in leadSnpsTrack

        // To create a new axis in the ld plot...
        // but I think we don't need it because the numbers are not meaningful
        // const oldLdFixed = ldSnpsTrack.display().fixed();
        // const newLdFixed = function(width) {
        //     const track = this;
        //     console.log('in fixed, track...');
        //     console.log(track);
        //     console.log(`width: ${width}`);
        //     const height = track.height();
        //     const yScale = ldSnpsTrack.display().y
        //     track.g
        //         .append('line')
        //         .attr('class', 'ld_axis')
        //         .attr('x1', 5)
        //         .attr('x2', 5)
        //         .attr('y1', 0)
        //         .attr('y2', (height - 5))
        //         .attr('stroke', '#cccccc')
        //         .attr('stroke-width', '1px');
        //     oldLdFixed.call(track, width);
        // };
        // ldSnpsTrack.display().fixed(newLdFixed);

        // Funnel track
        const funnelTrack = tnt.board.track()
            .height(20)
            .color('#ffffff')
            .display(funnelFeature)
            .data(tnt.board.track.data.sync()
                .retriever(() => []),
                // .retriever(() => [{
                //     from: 109100000,
                //     to: 109200000,
                // }]),
            );

        const genome = tnt.board.genome()
            .species('human')
            .chr(chr)
            .from(extent[0])
            .to(extent[1])
            .width(width);

        genome(container);
        genome
            .zoom_in(100)
            .add_track(transcriptTrack)
            .add_track(leadSnpsTrack)
            .add_track(ldSnpsTrack)
            .add_track(funnelTrack);

        genome.start();
    });
}

// 1- add ensembl location to snps
// 2- get an array of lead snps with ld snps as a sub-array
function reformatSnps(postgapSnps, ensemblSnps) {
    console.log(postgapSnps);
    console.log(ensemblSnps);
    const leadSnps = postgapSnps.map((d) => {
        d.pos = ensemblSnps[d.lead_snp.rsid].mappings[0].start;
        d.val = d.lead_snp.p_value;
        return d;
    });
    return leadSnps;
}

// Takes the ld snps and calls the ensembl api with them
// to know the positions
function getLdSnps(snps) {
    // rsids
    const rsids = snps.map((d) => d.rsid);
    console.log('rsids of the ld snps...');
    console.log(rsids);
    return getEnsemblSnps(rsids)
        .then ((resp) => {
            const okSnps = [];
            for (const snp of snps) {
                if (resp.body[snp.rsid] && resp.body[snp.rsid].mappings[0]) {
                    snp.pos = resp.body[snp.rsid].mappings[0].start;
                    okSnps.push(snp);
                }
            }
            console.log('okSnps...');
            console.log(okSnps);
            return okSnps;
        });
}

// Takes the lead snps and calls the ensembl api with the gene and the lead snps
// to know the positions (and calculate the extent for the visualisation)
function getLeadSnps(data) {
    const leadSnps = new Set();
    data.forEach((x) => {
        leadSnps.add(x.lead_snp.rsid);
    });
    console.log(leadSnps);

    const leadSnpsPromise = getEnsemblSnps(Array.from(leadSnps));
    const genePromise = getGene(gene);

    return axios.all([leadSnpsPromise, genePromise]);
}

// calculates the extent of lead snps and gene
function calcExtent(snps, gene) {
    const coords = [];
    Object.keys(snps).forEach((key) => {
        const snp = snps[key];
        coords.push(snp.mappings[0].start);
        coords.push(snp.mappings[0].end); // start === end ?
    });
    coords.push(gene.start);
    coords.push(gene.end);
    const extent = d3.extent(coords);
    return extent;
}

function getGene(id) {
    const url = rest.url()
        .endpoint('lookup/symbol/homo_sapiens/:id')
        .parameters({
            id,
            expand: 0,
        });
    return rest.call(url);
}

function getEnsemblSnps(snps) {
    const url = rest.url()
        .endpoint('variation/:species/')
        .parameters({
            species: 'human',
        });
    return rest.call(url, { ids: snps });
}

