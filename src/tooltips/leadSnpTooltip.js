/* global tnt:true */

export default function leadSnpTooltip(d) {
    const leadTooltip = tnt.tooltip.table()
        .id('leadSnpTooltip')
        .width(120)
        .call(this, {
            header: d.id,
            rows: [
                // TODO: What to show about a lead snp?
                // * top diseases?
                // * max r2?
                // * max -logp?

                // {
                //     label: 'disease',
                //     value: d.lead_snp.disease_name,
                // },
                // {
                //     label: 'log p-value',
                //     value: parseFloat(d.lead_snp.log_p_value).toPrecision(2),
                // },
                // {
                //     label: 'source',
                //     value: d.lead_snp.source,
                // },
            ],
        });
    return leadTooltip;
}
