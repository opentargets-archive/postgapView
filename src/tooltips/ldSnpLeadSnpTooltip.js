/* global tnt:true */
let tooltip = {};
function ldSnpLeadSnpTooltip(d) {
    tooltip = tnt.tooltip.table()
        .id('ldSnpLeadSnpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            header: 'Linkage disequilibrium',
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
                    label: 'r²',
                    value: parseFloat(d.r2).toPrecision(3),
                },
            ],
        });
    return tooltip;
}
ldSnpLeadSnpTooltip.close = () => { tooltip.close(); };

export default ldSnpLeadSnpTooltip;
