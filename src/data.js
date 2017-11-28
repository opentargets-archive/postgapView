import axios from 'axios';

// export default function getData() {
//     const url = '/data/SORT1_1_1MB.json';
//     // const url = '/data/IGFBP5_2_1MB.json';
//
//     return axios.get(url);
// }

export function getData(geneId) {
    // const url = `/postgap_data/${geneId}_formatted.json`;
    if (geneId === 'ENSG00000134243' || geneId === 'ENSG00000143106' || geneId === 'ENSG00000221986') {
        const url = `/data/${geneId}_formatted2.json`;
        return axios.get(url);
    }
    return undefined;
}

export function getEnsemblSnps(rest, otSnps) {
    // Get all the snps coordinates in chunks of 200
    const maxPerCall = 200;
    const allPromises = [];
    for (let i = 0; i < otSnps.length; i += maxPerCall) {
        const snpsChunk = otSnps.slice(i, (i + maxPerCall));
        const newPromise = getEnsemblSnps1Call(rest, snpsChunk);
        allPromises.push(newPromise);
    }
    return allPromises;
}

function getEnsemblSnps1Call(rest, snpsId) {
    const url = rest.url()
        .endpoint('variation/:species')
        .parameters({
            species: 'human',
        });
    return rest.call(url, { ids: snpsId });
}
