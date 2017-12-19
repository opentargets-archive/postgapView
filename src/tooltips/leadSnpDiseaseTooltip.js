/* global tnt:true */
export default function leadSnpDiseaseTooltip(d) {
    const tooltip = tnt.tooltip.table()
        .id('leadSnpDiseaseTooltip')
        .width(120)
        .call(this, {
            header: `${d.efoName} - ${d.leadSnpId} evidence`,
            rows: [
                // {
                //     label: 'disease',
                //     value: d.efoName,
                // },
                {
                    label: 'p-value',
                    value: d.pvalue.toPrecision(2),
                },
                // {
                //     label: 'source',
                //     value: d.lead_snp.source,
                // },
            ],
        });
    return tooltip;
}
