/* global tnt:true */


function tTooltip(d) {
    return {
        header: d.display_name,
        rows: [
            {
                label: 'type',
                value: d.object_type,
            },
            {
                label: 'biotype',
                value: d.biotype,
            },
        ],
    };
}

export function geneTooltip(d) {
    tnt.tooltip.table()
        .width(120)
        .call(this, tTooltip(d));
}

let st;
export function snpTooltip(d, target) {
    const o = {};
    o.header = `Variant ${d.id}`;
    o.rows = [];
    // Scores
    o.rows.push({
        label: `${target} scores`,
        value: '',
    });
    o.rows = [...o.rows, ...Object.keys(d.targets[target].funcgen).map((f) => {
        return {
            label: f.split('_')[0],
            value: d.targets[target].funcgen[f],
        };
    })];

    // Diseases
    o.rows.push({
        label: 'Diseases',
        value: '',
    });
    o.rows = [...o.rows, ...Object.keys(d.diseases).map((e) => {
        return {
            label: e,
            value: `${d.diseases[e].studies.length} publications`,
        };
    })];

    // Other targets
    o.rows.push({
        label: 'Other targets',
        value: '',
    });
    Object.keys(d.targets).forEach((t) => {
        if (t !== target) {
            o.rows.push({
                label: t,
                value: d.targets[t].score,
            });
        }
    });

    // Lead snps
    o.rows.push({
        label: 'GWAS SNPs in LD',
        value: '',
    });
    o.rows = [...o.rows, ...Object.keys(d.leadSnps).map((s) => {
        return {
            label: s,
            value: d.leadSnps[s].leadSnp,
        };
    })];

    st = tnt.tooltip.table()
        .id('snpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, o);

    return st;
}
snpTooltip.close = () => {
    st.close();
};

let leadTooltip;
export function leadSnpTooltip(d) {
    leadTooltip = tnt.tooltip.table()
        .id('leadSnpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            header: d.lead_snp.rsid,
            rows: [
                {
                    label: 'disease',
                    value: d.lead_snp.disease_name,
                },
                {
                    label: 'log p-value',
                    value: parseFloat(d.lead_snp.log_p_value).toPrecision(2),
                },
                {
                    label: 'source',
                    value: d.lead_snp.source,
                },
            ],
        });
    return leadTooltip;
}
leadSnpTooltip.close = () => {
    leadTooltip.close();
};

let ldTooltip;
export function ldSnpTooltip(d) {
    ldTooltip = tnt.tooltip.table()
        .id('ldSnpTooltip')
        .show_closer(false)
        .width(120)
        .call(this, {
            header: d.id,
            rows: [
                {
                    label: 'Associated gene',
                    value: d.gene_symbol,
                },
                {
                    label: 'Gene Rank',
                    value: d.fg_scores.rank,
                },
                {
                    label: 'Score',
                    value: d.fg_scores.postgap_score,
                },
                {
                    label: 'Scores',
                    value: '',
                },
                {
                    label: 'Fantom5',
                    value: d.fg_scores.fantom5_score,
                },
                {
                    label: 'GTEx',
                    value: d.fg_scores.gtex_ecore, // Typo in the data!
                },
                {
                    label: 'DHS',
                    value: d.fg_scores.dhs_score,
                },
                {
                    label: 'Pchic',
                    value: d.fg_scores.pchic_score,
                },
                {
                    label: 'Regulome',
                    value: d.fg_scores.regulome_score,
                },
            ],
        });
    return ldTooltip;
}
ldSnpTooltip.close = () => {
    ldTooltip.close();
};

