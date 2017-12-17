export const r2ColourScale = d3.scale.linear()
    .domain([0.7, 1])
    .range(['#eee', '#777']);

export const pvalColourScale = d3.scale.log()
    .base(10)
    .domain([1e-6, 1e-10])
    .clamp(true)
    .range(['#eee', '#777']);

export const v2gScoreColourScale = d3.scale.linear()
    .domain([0, 1])
    .range(['#eee', '#777']);
