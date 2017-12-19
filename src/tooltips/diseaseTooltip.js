/* global tnt:true */
let tooltip = {};
function diseaseTooltip(d) {
    tooltip = tnt.tooltip.table()
        .id('diseaseTooltip')
        .show_closer(false)
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
diseaseTooltip.close = () => { tooltip.close(); };

export default diseaseTooltip;
