/* global tnt:true */
let tooltip = {};
function geneLdSnpTooltip(d) {
    tooltip = tnt.tooltip.table()
        .id('geneLdSnpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            // header: d.id,
            header: `${d.geneName}-${d.ldSnpId} evidence`,
            rows: [
                // TODO: What to show about a gene - ld snp?
                // * gene name, snp id
                // * funcgen scores?

                // {
                //     label: 'Associated gene',
                //     value: d.gene_symbol,
                // },
                // {
                //     label: 'Gene Rank',
                //     value: d.fg_scores.rank,
                // },
                // SECTION
                {
                    label: 'POSTGAP score',
                    value: '',
                },
                {
                    label: 'Score',
                    value: d.funcgen.ot_g2v_score,
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
                    value: d.funcgen.vep_score,
                },
                // {
                //     label: 'Mean',
                //     value: d.funcgen.vep_mean,
                // },
                // {
                //     label: 'Sum',
                //     value: d.funcgen.vep_sum,
                // },
                // SECTION
                {
                    label: 'Functional genomics',
                    value: '',
                },
                {
                    label: 'GTEx',
                    value: d.funcgen.gtex_score,
                },
                {
                    label: 'PCHiC',
                    value: d.funcgen.pchic_score,
                },
                {
                    label: 'Fantom5',
                    value: d.funcgen.fantom5_score,
                },
                {
                    label: 'DHS',
                    value: d.funcgen.dhs_score,
                },
                // SECTION
                {
                    label: 'Other information',
                    value: '',
                },
                {
                    label: 'Nearest target to variant',
                    value: d.funcgen.is_nearest_gene,
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
