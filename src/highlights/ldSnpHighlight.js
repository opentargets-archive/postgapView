/* global d3:true */

function ldSnpHighlight(d) {
    // highlight gene-ldSnp connectors
    d3.selectAll('.gene-ld-snp-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return d2.ldSnpId === d.id;
        })
        .classed('highlight', true);

    // highlight ldSnp-leadSnp connectors
    d3.selectAll('.ld-snp-lead-snp-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return d2.ldSnpId === d.id;
        })
        .classed('highlight', true);

    // highlight leadSnp-disease connectors
    //   1. get leadSnps connected to this ldSnp
    const leadSnpIds = d3.selectAll('.ld-snp-lead-snp-connector')
        .filter(d2 => {
            return d2.ldSnpId === d.id;
        })
        .data()
        .map(d2 => d2.leadSnpId);
    //   2. affect the leadSnp-disease connectors for any of these leadSnps
    d3.selectAll('.lead-snp-disease-connector')
        .classed('highlight', false)
        .filter(d2 => {
            return (leadSnpIds.indexOf(d2.leadSnpId) >= 0);
        })
        .classed('highlight', true);
}

export default ldSnpHighlight;
