/* global tnt:true */
export default function diseaseTooltip(d) {
    const tooltip = tnt.tooltip.table()
        .id('diseaseTooltip')
        .width(120)
        .call(this, {
            header: d.name,
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
