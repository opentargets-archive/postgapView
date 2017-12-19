/* global tnt:true */
let tooltip = {};
function geneTooltip(d) {
    tooltip = tnt.tooltip.table()
        .id('geneTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            header: d.gene_symbol,
            rows: [
                // {
                //     label: 'disease',
                //     value: d.efoName,
                // },
                // {
                //     label: 'p-value',
                //     value: d.pvalue.toPrecision(2),
                // },
                // {
                //     label: 'source',
                //     value: d.lead_snp.source,
                // },
            ],
        });
    return tooltip;
}
geneTooltip.close = () => { tooltip.close(); };

export default geneTooltip;
