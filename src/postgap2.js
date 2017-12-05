/* global tnt:true */
/* global d3:true */

import api from 'tnt.api';
import tntRest from 'tnt.rest';
import spinner from 'cttv.spinner';
import axios from 'axios';
import { getData, getEnsemblSnps } from './data';
import funnelFeature from './funnelFeature';
import circleFeature from './circleFeature';
import namesFeature from './namesFeature';
import {
    sequence as sequenceTrack,
    transcript as transcriptTrack,
    snpFlat as snpFlatTrack,
    snpClusterLabel as snpClusterLabelTrack,
    snpCluster as snpClusterTrack,
    // snpCluster2 as snpClusterTrack2,
    snpFlatLabel as snpFlatLabelTrack,
    disease as diseaseTrack,
    diseaseSnpsLabel as diseaseLabelTrack,
} from './tracks';

const rest = tntRest()
    .protocol('https')
    .domain('rest.ensembl.org');

const config = {
    rest,
    gene: 'ENSG00000134243', // SORT1
    // disease: 'EFO_0004518', // Myocardial infarction
    disease: 'EFO_0004261', // Myocardial infarction
    width: 950,
};

export default function () {
    const render = function (container, container2) {
        getData(config.gene)
            .then((resp) => {
                buildBrowser(resp.data, container, container2);
            })
            .catch((err) => {
                console.trace(err.message);
            });
    };

    api(render)
        .getset(config);
    return render;
}

function buildBrowser(postgapData, container, container2) {
    const cluster = getCluster(postgapData);

    cluster.then((ensemblSnpsForGene) => {
        console.log('ensembl snps for gene..');
        console.log(ensemblSnpsForGene);
        const snpsExtent = calcExtent(ensemblSnpsForGene);
        console.log(snpsExtent);
        const chr = ensemblSnpsForGene[0].mappings[0].seq_region_name;


        const genome = tnt.board.genome()
            .species('human')
            .chr(chr)
            .from(snpsExtent[0])
            .to(snpsExtent[1])
            .width(config.width);
        genome.rest().protocol('https');

        genome(container);
        genome
            .zoom_in(100)
            .add_track(sequenceTrack.call(genome, config))
            .add_track(transcriptTrack.call(genome, config))
            .add_track(snpFlatLabelTrack.call(genome, config))
            .add_track(snpFlatTrack.call(genome, config))
            .add_track(snpClusterLabelTrack.call(genome, config))
            .add_track(snpClusterTrack.call(genome, config))
            .add_track(diseaseLabelTrack.call(genome, config))
            .add_track(diseaseTrack.call(genome, config));
            // .add_track(snpClusterTrack2.call(genome, config));
        genome.start();
        console.log('genome started...');
    });

    //
}

function calcExtent(arr) {
    let minPos = Infinity;
    let maxPos = -Infinity;

    arr.forEach((d) => {
        if (d.mappings.length) {
            if (d.mappings[0].start < minPos) minPos = d.mappings[0].start;
            if (d.mappings[0].end > maxPos) maxPos = d.mappings[0].end;
        }
    });
    return [minPos, maxPos];
}

// Takes the cluster and call the ensembl rest api with the gene and the lead snps
// to know the positions (and calculate the extent for the visualisation)
function getCluster(data) {
    const otSnps = data.map((d) => {
        const fullId = d.variant.id;
        const snpId = fullId.split('/')[4];
        // const snpId = d.variant.id;
        return snpId;
    });
    const otSnpsSet = new Set(otSnps);
    const allPromises = getEnsemblSnps(config.rest, Array.from(otSnpsSet));
    return axios.all(allPromises)
        .then((arrs) => arrs.reduce((acc, val) => [...acc, ...Object.keys(val.body).map((k) => val.body[k])], []));
}

// function getEnsemblSnps(otSnps) {
//     // Get all the snps coordinates in chunks of 200
//     const maxPerCall = 200;
//     const allPromises = [];
//     for (let i = 0; i < otSnps.length; i += maxPerCall) {
//         const snpsChunk = otSnps.slice(i, (i + maxPerCall));
//         const newPromise = getEnsemblSnps1Call(snpsChunk);
//         allPromises.push(newPromise);
//     }
//     return allPromises;
// }
//
// function getEnsemblSnps1Call(snpsId) {
//     const url = rest.url()
//         .endpoint('variation/:species')
//         .parameters({
//             species: 'human',
//         });
//     return rest.call(url, { ids: snpsId });
// }

// Takes the lead snps and calls the ensembl api with the gene and the lead snps
// to know the positions (and calculate the extent for the visualisation)
// function getLeadSnps(data) {
//     const leadSnps = new Set();
//     data.forEach((x) => {
//         leadSnps.add(x.lead_snp.rsid);
//     });
//
//     const leadSnpsPromise = getEnsemblSnps(Array.from(leadSnps));
//     const genePromise = getGene(gene);
//
//     return axios.all([leadSnpsPromise, genePromise]);
// }
