
// From https://github.com/gregjopa/d3-server-side-demo by gregjopa
// I only changed the inputs to make the graph function universal for all pages
// And added the rotation on the x labels 

const d3 = Object.assign({},
  require('d3-scale'),
  require('d3-axis'),
  require('d3-array')
);

class BarChart {
  constructor({ data, width, height, xAxisLabel, yAxisLabel, containerId, axisLabelMargin }) {  // some changes here
    this.data = data;
    this.width = width;
    this.height = height;
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
    this.containerId = containerId;
    this.axisLabelMargin = axisLabelMargin;  // I added manual change to label margins 

    this.margin = {
      top: 10,
      right: 10,
      bottom: 34,
      left: 34
    };
  }

  render(container) {
    const {
      data,
      width,
      height,
      xAxisLabel,
      yAxisLabel,
      axisLabelMargin,
      margin
    } = this;

    const xScale = d3.scaleBand()
      .domain(this.data.map(({ label }) => label))
      .rangeRound([0, width - axisLabelMargin - margin.left - margin.right])
      .padding(0.25);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, ({ data }) => data) + 10])
      .range([height - axisLabelMargin - margin.top - margin.bottom, 0]);

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickSizeInner(0)
      .tickSizeOuter(0);

    const yAxis = d3.axisLeft()
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .scale(yScale);

    const g = container.append('svg')
        .attr('class', 'svg-chart')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    g.append('rect')
      .attr('class', 'background')
      .attr('x', axisLabelMargin)
      .attr('width', width - axisLabelMargin - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom - axisLabelMargin);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + axisLabelMargin + ',' +
        (height - axisLabelMargin - margin.top - margin.bottom) + ')')
      .call(xAxis)

      .selectAll("text")     // x label rotation from: http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)" )

      .append('text')
      .attr('class', 'axis-label')
      .attr('x', (width - margin.left - margin.right - axisLabelMargin) / 2)
      .attr('y', margin.left)
      .style('text-anchor', 'middle')
      .text(xAxisLabel);

    g.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + axisLabelMargin + ', 0)')
      .call(yAxis)
      .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left-25)
      .attr('x', -(height - margin.top - margin.bottom - axisLabelMargin) / 2)
      .style('text-anchor', 'middle')
      .text(yAxisLabel);

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) {
        return xScale(d.label) + axisLabelMargin;
      })
      .attr('y', function(d) {
        return yScale(d.data);
      })
      .attr('width', xScale.bandwidth())
      .attr('height', function(d) {
        return height - margin.top - margin.bottom - yScale(d.data) - axisLabelMargin;
      });
  }
}

module.exports = BarChart;
