/* global tnt:true */
const naOr3Sf = v => ((v > 0) ? v.toPrecision(3) : 'N/A');

let tooltip = {};
function geneLdSnpTooltip(d) {
    tooltip = tnt.tooltip.table()
        .id('geneLdSnpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            header: 'POSTGAP evidence',
            rows: [
                {
                    label: 'Target',
                    value: d.geneName,
                },
                {
                    label: 'Variant',
                    value: d.ldSnpId,
                },
                // SECTION
                {
                    label: 'POSTGAP score',
                    value: '',
                },
                {
                    label: 'Score',
                    value: naOr3Sf(d.funcgen.ot_g2v_score),
                },
                {
                    label: 'Top contributor',
                    value: d.funcgen.ot_g2v_score_types,
                },
                // SECTION
                {
                    label: 'Variant Effect Predictor',
                    value: '',
                },
                {
                    label: 'Score',
                    value: naOr3Sf(d.funcgen.vep_score),
                },
                // SECTION
                {
                    label: 'Functional genomics',
                    value: '',
                },
                {
                    label: 'GTEx',
                    value: naOr3Sf(d.funcgen.gtex_score),
                },
                {
                    label: 'PCHiC',
                    value: naOr3Sf(d.funcgen.pchic_score),
                },
                {
                    label: 'Fantom5',
                    value: naOr3Sf(d.funcgen.fantom5_score),
                },
                {
                    label: 'DHS',
                    value: naOr3Sf(d.funcgen.dhs_score),
                },
                // SECTION
                {
                    label: 'Other information',
                    value: '',
                },
                {
                    label: 'Nearest target to variant',
                    value: d.funcgen.is_nearest_gene ? 'Yes' : 'No',
                },
                {
                    label: 'Regulome',
                    value: d.funcgen.regulome_score,
                },
            ],
        });
    return tooltip;
}
geneLdSnpTooltip.close = () => { tooltip.close(); };

export default geneLdSnpTooltip;
