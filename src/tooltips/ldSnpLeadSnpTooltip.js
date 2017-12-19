/* global tnt:true */
export default function leadSnpDiseaseTooltip(d) {
    const tooltip = tnt.tooltip.table()
        .id('leadSnpDiseaseTooltip')
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
                    label: 'LD (r',
                    value: d.lead_snp.source,
                },
            ],
        });
    return tooltip;
}
