/* global tnt:true */


function tTooltip(d) {
    return {
        header: d.display_name,
        rows: [
            {
                label: 'id',
                value: d.id,
            },
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

// cluster textual info
let clusterTextTooltip = {};
export function clusterTextualInfo(d) {
    const o = {};
    o.header = `Variant cluster associated with ${d.disease}`;
    o.body = `This is a variant cluster associated with ${d.disease} via ${d.gwasSnp} with an score of ${d.score}`;
    clusterTextTooltip = tnt.tooltip.plain()
        .width(400)
        .id('clusterTextualInfo')
        .show_closer(false)
        .call(this, o);
}
clusterTextualInfo.close = () => {
    clusterTextTooltip.close();
};

// snp textual info
let snpTextTooltip = {};
export function snpTextualInfo(d, target) {
    const o = {};
    o.header = `Variant ${d.id}`;
    // Diseases...
    const diseases = Object.keys(d.diseases);
    const targets = Object.keys(d.targets);
    const clusters = Object.keys(d.leadSnps);
    const msgs = [];
    msgs.push('<ul>');
    if (diseases.length) {
        msgs.push(`<li><span class="nowrap">This variant is associated with ${diseases.length} diseases (${diseases.join(', ')})</span></li>`);
    }
    if (targets.length) {
        msgs.push(`<li><span class="nowrap">This variant is associated with ${targets.length} targets (${targets.join(', ')})</span></li>`);
    }
    if (d.maxScore > d.score) {
        // msgs[msgs.length - 1] += ` but ${target} is not the best target for this variant`;
        msgs.push(`<li><span class="nowrap">The best target for this variant is not ${target}</span></li>`)
    }
    if (clusters.length) {
        msgs.push(`<li><span class="nowrap">This variant is part of ${clusters.length} clusters of variants</span></li>`);
    }
    msgs.push('</ul>');
    o.body = msgs.join('');
    snpTextTooltip = tnt.tooltip.plain()
        .width(400)
        .id('variantTextualInfo')
        .show_closer(false)
        .call(this, o);
}
snpTextualInfo.close = () => {
    snpTextTooltip.close();
};


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

    const st = tnt.tooltip.table()
        .id('snpTooltip')
        .width(120)
        .call(this, o);

    return st;
}

export function leadSnpTooltip(d) {
    const leadTooltip = tnt.tooltip.table()
        .id('leadSnpTooltip')
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

export function ldSnpTooltip(d) {
    const ldTooltip = tnt.tooltip.table()
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
