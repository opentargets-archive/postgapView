/* global d3:true */

function leadSnpHighlight(d) {
    // highlight ldSnp-leadSnp connectors
    d3.selectAll('.ld-snp-lead-snp-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return d2.leadSnpId === d.id;
        })
        .classed('highlight', true)
        .moveParentToFront();

    // highlight leadSnp-disease connectors
    d3.selectAll('.lead-snp-disease-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return d2.leadSnpId === d.id;
        })
        .classed('highlight', true)
        .moveParentToFront();

    // highlight gene-ldSnp connectors
    //   1. get ldSnps connected to this leadSnp
    const ldSnpIds = d3.selectAll('.ld-snp-lead-snp-connector')
        .filter(d2 => {
            return d2.leadSnpId === d.id;
        })
        .data()
        .map(d2 => d2.ldSnpId);
    //   2. affect the gene-ldSnp connectors for any of these ldSnps
    d3.selectAll('.gene-ld-snp-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return (ldSnpIds.indexOf(d2.ldSnpId) >= 0);
        })
        .classed('highlight', true)
        .moveParentToFront();
}

export default leadSnpHighlight;
