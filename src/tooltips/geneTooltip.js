/* global tnt:true */
export default function geneTooltip(d) {
    const tooltip = tnt.tooltip.table()
        .id('geneTooltip')
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
