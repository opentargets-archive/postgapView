/* global d3:true */

function diseaseHighlight(d) {
    // highlight leadSnp-disease connectors
    d3.selectAll('.lead-snp-disease-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return d2.efoId === d.id;
        })
        .classed('highlight', true);

    // highlight ldSnp-leadSnp connectors
    //   1. get leadSnps connected to this disease
    const leadSnpIds = d3.selectAll('.lead-snp-disease-connector')
        .filter(d2 => {
            return d2.efoId === d.id;
        })
        .data()
        .map(d2 => d2.leadSnpId);
    //   2. affect the ldSnp-leadSnp connectors for any of these leadSnps
    d3.selectAll('.ld-snp-lead-snp-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return (leadSnpIds.indexOf(d2.leadSnpId) >= 0);
        })
        .classed('highlight', true);

    // highlight gene-ldSnp connectors
    //   1. get ldSnps connected to this leadSnp
    const ldSnpIds = d3.selectAll('.ld-snp-lead-snp-connector')
        .filter(d2 => {
            return (leadSnpIds.indexOf(d2.leadSnpId) >= 0);
        })
        .data()
        .map(d2 => d2.ldSnpId);
    //   2. affect the gene-ldSnp connectors for any of these ldSnps
    d3.selectAll('.gene-ld-snp-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return (ldSnpIds.indexOf(d2.ldSnpId) >= 0);
        })
        .classed('highlight', true);
}

export default diseaseHighlight;
