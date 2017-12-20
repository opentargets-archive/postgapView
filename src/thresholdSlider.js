/* global d3:true */
// Inspiration: http://bl.ocks.org/KKostya/6540747
// Note: Advantage of this is that it can be embedded within an svg
export default function thresholdSlider() {
    let margin = {
        top: 5,
        left: 15,
        right: 10,
        bottom: 5,
    };
    const width = 100 - margin.left - margin.right;
    const height = 40 - margin.top - margin.bottom;
    const brush = d3.svg.brush();
    let handle;
    let slider;
    let value = 0;
    let upd = function (d) { value = d; };
    let cback = function () {};

    const x = d3.scale.linear()
        .domain([0, 1])
        .range([0, width])
        .clamp(true);

    function chart(el, xExtent) {
        x.domain(xExtent);

        brush.x(x).extent([0, 0])
            .on('brush', brushed);

        const container = el.attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .classed('threshold-slider', true)
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        container.append('g')
           .attr('class', 'x axis')
           .attr('transform', 'translate(0,' + (height / 2) + ')')
           .call(d3.svg.axis().scale(x).orient('bottom').ticks(3).tickSize(0).tickPadding(12));

        slider = container.append('g')
            .attr('class', 'slider')
            .call(brush);

        slider.selectAll('.extent,.resize').remove();
        slider.select('.background').attr('height', height);

        handle = slider.append('circle')
            .attr('class', 'handle')
            .attr('transform', 'translate(0,' + (height / 2) + ')')
            .attr('cx', x(value))
            .attr('r', 9);

        function brushed() {
            d3.event.sourceEvent.stopPropagation(); 
            if (d3.event.sourceEvent) {
                value = x.invert(d3.mouse(this)[0]);
            }
            upd(value);
            cback();
        }
        upd = function (v) {
            brush.extent([v, v]);
            value = brush.extent()[0];
            handle.attr('cx', x(value));
        };
    }

    chart.margin = function (_) { if (!arguments.length) return margin; margin = _; return chart; };
    chart.callback = function (_) { if (!arguments.length) return cback; cback = _; return chart; };
    chart.value = function (_) { if (!arguments.length) return value; upd(_); return chart; };

    return chart;
}
