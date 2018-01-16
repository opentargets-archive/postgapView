/* global d3:true */

function geneHighlight(d) {
    // highlight gene-ldSnp connectors
    d3.selectAll('.gene-ld-snp-connector')
        .classed('highlight', false)
        .filter(d2 => (d2.geneId === d.Parent))
        .classed('highlight', true);

    // highlight ldSnp-leadSnp connectors
    //   1. get ldSnps connected to this gene
    const ldSnpIds = d3.selectAll('.gene-ld-snp-connector')
        .filter(d2 => (d2.geneId === d.Parent))
        .data()
        .map(d2 => d2.ldSnpId);
    //   2. affect the ldSnp-leadSnp connectors for any of these ldSnps
    d3.selectAll('.ld-snp-lead-snp-connector')
        .classed('highlight', false)
        .filter(d2 => (ldSnpIds.indexOf(d2.ldSnpId) >= 0))
        .classed('highlight', true);

    // highlight leadSnp-disease connectors
    //   1. get leadSnps connected to this gene
    const leadSnpIds = d3.selectAll('.ld-snp-lead-snp-connector')
        .filter(d2 => (ldSnpIds.indexOf(d2.ldSnpId) >= 0))
        .data()
        .map(d2 => d2.leadSnpId);
    //   2. affect the leadSnp-disease connectors for any of these leadSnps
    d3.selectAll('.lead-snp-disease-connector')
        .classed('highlight', false)
        .filter(d2 => (leadSnpIds.indexOf(d2.leadSnpId) >= 0))
        .classed('highlight', true);
}

export default geneHighlight;
