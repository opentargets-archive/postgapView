/* global tnt:true */
let tooltip = {};
function ldSnpLeadSnpTooltip(d) {
    tooltip = tnt.tooltip.table()
        .id('ldSnpLeadSnpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            header: `${d.ldSnpId} - ${d.leadSnpId} evidence`,
            rows: [
                {
                    label: 'GWAS variant',
                    value: d.leadSnpId,
                },
                {
                    label: 'Other variant',
                    value: d.ldSnpId,
                },
                {
                    label: 'Linkage disequilibrium (r2)',
                    value: d.r2,
                },
            ],
        });
    return tooltip;
}
ldSnpLeadSnpTooltip.close = () => { tooltip.close(); };

export default ldSnpLeadSnpTooltip;
