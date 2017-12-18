// This file should contain all API retrieval used by the visualisation
/* global tnt:true */
import axios from 'axios';

export function getPostgapDataForGene(geneId, cttvApi) {
    // use the open targets api to get postgap evidence strings for a specific gene
    // TODO: handle paging (over 1000)
    const opts = {
        size: 1000,
        datasource: 'gwas_catalog',
        fields: [
            'target',
            'disease',
            'evidence',
            'variant',
            'sourceID',
            'access_level',
            'unique_association_fields',
        ],
        target: geneId,
        // disease: diseaseId
    };
    const url = cttvApi.url.filterby(opts);
    return cttvApi.call(url)
        .then(resp => {
            return Promise.resolve(resp.body);
        });
}

export function getPostgapDataForGenes(geneIds, cttvApi) {
    // TODO: Get all the postgap SNPS for those genes. For now just look in the files
    // const promises = resp.body.map((d) => getData(d.id, config.cttvApi)).filter((d) => d);
    return axios.all(geneIds.map(geneId => getPostgapDataForGene(geneId, cttvApi)));
}

function getEnsemblDataForMax200Snps(snpIds, rest) {
    // use the ensembl api to get all the snps coordinates (amongst other info)
    // for one chunk of up to 200
    const url = rest.url()
        .endpoint('variation/:species')
        .parameters({
            species: 'human',
        });
    return rest.call(url, { ids: snpIds });
}

export function getEnsemblDataForSnps(snpIds, rest) {
    // use the ensembl api to get all the snps coordinates (amongst other info) in chunks of 200
    const maxPerCall = 200;
    const allPromises = [];
    for (let i = 0; i < snpIds.length; i += maxPerCall) {
        const snpsChunk = snpIds.slice(i, (i + maxPerCall));
        const newPromise = getEnsemblDataForMax200Snps(snpsChunk, rest);
        allPromises.push(newPromise);
    }
    return axios.all(allPromises).then(resps => {
        const all = {};
        resps.forEach(resp => {
            Object.values(resp.body).forEach(snp => {
                all[snp.name] = {
                    id: snp.name,
                    pos: snp.mappings[0].start,
                };
            });
        });
        return all;
    });
}


const getEnsemblDataForGenesInRegion = tnt.board.track.data.genome.canonical().retriever();

export function getAllDataForLocation(loc, config) {
    // steps:
    // 1. get genes within the visible window (ensemblApi)
    // 2. get postgap evidence for each gene returned (cttvApi)
    // 3. get snp position info for each lead snp (ensemblApi); ld snps now have pos
    // 4. return a blob with data for {
    //      gene, geneLdSnp, ldSnp, ldSnpLeadSnp, leadSnp, leadSnpDisease, disease
    //    } tracks

    const geneObjsPromise = getEnsemblDataForGenesInRegion(loc);
    const geneIdsPromise = geneObjsPromise.then(geneObjs => {
        return geneObjs.map(geneObj => geneObj.Parent);
    });
    const evidenceObjsPromise = geneIdsPromise.then(geneIds => {
        return getPostgapDataForGenes(geneIds, config.cttvApi);
    }).then(evidenceObjsResponse => {
        return evidenceObjsResponse.map(evidenceObjResponse => evidenceObjResponse.data).reduce((acc, val) => [...acc, ...val], []);
    });
    const leadSnpIdsPromise = evidenceObjsPromise.then(evidenceObjs => {
        const leadSnpIds = {};
        evidenceObjs.forEach(evidenceObj => {
            leadSnpIds[evidenceObj.evidence.variant2disease.lead_snp_rsid] = true;
        });
        return Object.keys(leadSnpIds);
    }).then(leadSnpIds => getEnsemblDataForSnps(leadSnpIds, config.rest));

    return Promise.all([geneObjsPromise, evidenceObjsPromise, leadSnpIdsPromise]).then(([geneObjs, evidenceObjs, leadSnpObjs]) => {
        console.log('all promises worked!');
        console.log(geneObjs);
        console.log(evidenceObjs);
        console.log(leadSnpObjs);

        // for lookup
        const genesObjsLookup = {};
        geneObjs.forEach(geneObj => {
            genesObjsLookup[geneObj.Parent] = geneObj;
        });

        // iterate the evidence objects and construct all the data lists for individual tracks
        // note: just augment the gene obj and lead snp obj passed in
        const geneLdSnps = {};
        const ldSnps = {};
        const ldSnpLeadSnps = {};
        const leadSnps = {};
        const diseases = {};
        const leadSnpDiseases = {};
        const genes = {};
        evidenceObjs.forEach(evidenceObj => {
            // key info from evidenceObj
            const geneId = evidenceObj.target.id;
            const ldSnpId = evidenceObj.variant.id.split('/').pop();
            const ldSnpPos = evidenceObj.variant.pos;
            const leadSnpId = evidenceObj.evidence.variant2disease.lead_snp_rsid;
            const efoId = evidenceObj.disease.id;
            const pvalue = evidenceObj.evidence.variant2disease.resource_score.value;
            const funcgen = evidenceObj.evidence.gene2variant.metadata.funcgen;
            const r2 = evidenceObj.unique_association_fields.r2;
            // const literature = snp.evidence.variant2disease.provenance_type.literature.references.map((l) => l.lit_id.split('/')[5]);

            // key info from leadSnpObjs
            const leadSnpPos = leadSnpObjs[leadSnpId].pos;

            // key info from geneObjs
            const geneObj = genesObjsLookup[geneId];

            // derived
            const geneLdSnpId = `${geneId}-${ldSnpId}`;
            const ldSnpLeadSnpId = `${ldSnpId}-${leadSnpId}`;
            const leadSnpDiseaseId = `${leadSnpId}-${efoId}`;

            // GENE
            if (!genes[geneId]) {
                genes[geneId] = {
                    id: geneId,
                    // transcriptId: geneObj.id,
                    exons: geneObj.exons,
                    introns: geneObj.introns,
                    strand: geneObj.strand,
                    start: geneObj.start,
                    end: geneObj.end,
                    display_name: geneObj.display_name,
                    display_label: geneObj.display_label,
                };
            }

            // LD SNP
            if (!ldSnps[ldSnpId]) {
                ldSnps[ldSnpId] = {
                    id: ldSnpId,
                    pos: ldSnpPos,
                };
            }

            // LEAD SNP
            if (!leadSnps[leadSnpId]) {
                leadSnps[leadSnpId] = {
                    id: leadSnpId,
                    pos: leadSnpPos,
                };
            }

            // DISEASE
            if (!diseases[efoId]) {
                diseases[efoId] = {
                    id: efoId,
                    name: evidenceObj.disease.name,
                };
            }

            // GENE-LD SNP
            if (!geneLdSnps[geneLdSnpId]) {
                geneLdSnps[geneLdSnpId] = {
                    id: geneLdSnpId,
                    geneId,
                    ldSnpId,
                    funcgen,
                };
            }

            // LD SNP-LEAD SNP
            if (!ldSnpLeadSnps[ldSnpLeadSnpId]) {
                ldSnpLeadSnps[ldSnpLeadSnpId] = {
                    id: ldSnpLeadSnpId,
                    ldSnpId,
                    leadSnpId,
                    r2,
                };
            }

            // LEAD SNP-DISEASE
            if (!leadSnpDiseases[leadSnpDiseaseId]) {
                leadSnpDiseases[leadSnpDiseaseId] = {
                    id: leadSnpDiseaseId,
                    leadSnpId,
                    efoId,
                    pvalue,
                };
            }
        });

        const allData = {
            genes,
            geneLdSnps,
            ldSnps,
            ldSnpLeadSnps,
            leadSnps,
            leadSnpDiseases,
            diseases,
        };
        console.log(allData);
        return allData;
    });
}
