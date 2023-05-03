import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import useResize from '@/hooks/useResize';

const data = [
  { name: '안전모', value: 128 },
  { name: '장갑', value: 1000 },
  { name: '앞치마', value: 338 },
  { name: '보안경', value: 280 },
  { name: '팔토시', value: 180 },
];

function PieChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const size = useResize(rootRef);

  const [selected, setSelected] = useState<{
    data: { name: string; value: number };
  } | null>(null);

  useEffect(() => {
    d3.select(svgRef.current).selectAll('tspan').remove();

    const { width, height } = size;
    // const height = width * 0.75;
    const radius = Math.min(height, width) / 2 - 60;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height- 10);

    const pie = d3
      .pie<{name: string, value: number}>()
      .value(d => d.value)
      .sort(null);

    const arcGenerator = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const arcs = pie(data as any);

    const arcContents = svg
      .selectAll('.arc')
      .data(arcs)
      .join('path')
      .attr('class', 'arc')
      .attr('transform', `translate(${width / 2 - 50}, ${height / 2})`)
      .attr('fill', (d, i) => {
        return d3.schemeCategory10[i % 10];
      })
      .attr('d', arcGenerator as any)
      .on('mouseenter', (event, d) => {
        d3.select(svgRef.current).selectAll('tspan').remove();
        setSelected(d as any);
        d3.select(svgRef.current)
          .selectAll('.arc')
          .transition()
          .attr('opacity', '0.5');
        d3.select(event.currentTarget)
          .transition()
          .attr(
            'd',
            d3
              .arc()
              .innerRadius(radius * 0.5 + 10)
              .outerRadius(radius + 10) as any
          )
          .attr('opacity', '1');
      })
      .on('mouseout', (event, d) => {
        setSelected(null);
        d3.select(svgRef.current)
          .selectAll('.arc')
          .transition()
          .attr('opacity', '1');
        d3.select(event.currentTarget)
          .transition()
          .attr('d', arcGenerator as any);
        d3.select(svgRef.current).selectAll('tspan').remove();
      });

    function updateInnerText() {
      innerText
        .select('tspan.name')
        .text(selected ? `${selected.data.name}` : `전체`);

      innerText
        .select('tspan.value')
        .text(
          selected
            ? `${selected.data.value}건`
            : `${data.reduce(
                (accumulator, currentValue) => accumulator + currentValue.value,
                0
              )}건`
        );
    }

    const innerText = svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2 - 50)
      .attr('y', height / 2);

    innerText
      .append('tspan')
      .text(selected ? `${selected.data.name}` : `전체`)
      .attr('x', width / 2 - 50)
      .attr('dy', '-0.2em')
      .attr('font-weight', 'bold')
      .attr('font-size', '1.3rem')
      .style('fill', 'currentColor');

    innerText
      .append('tspan')
      .text(
        selected
          ? `${selected.data.value}건`
          : `${data.reduce(
              (accumulator, currentValue) => accumulator + currentValue.value,
              0
            )}건`
      )
      .attr('x', width / 2 - 50)
      .attr('dy', '1em')
      .attr('font-size', '1rem')
      .style('fill', 'currentColor');

    updateInnerText();

    const marksGroup = svg
      .selectAll('g.marks')
      .data([null])
      .attr('transform', `translate(${width - 90}, 10)`);

    const marksGroupEnter = marksGroup
      .enter()
      .append('g')
      .classed('marks', true)
      .attr('transform', `translate(0,${height - 40})`);

    marksGroup.exit().remove();

    const marksUpdate = marksGroupEnter.merge(marksGroup as any);

    const mark = marksUpdate
      .selectAll('g.mark')
      .data(arcs)
      .join(
        enter => {
          const g = enter.append('g').classed('mark', true);
          g.append('rect')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('width', 20)
            .attr('height', 15);
          g.append('text').attr('dx', 25).attr('alignment-baseline', 'hanging');
          return g;
        },
        update => update,
        exit => exit.remove()
      )
      .attr('transform', (d, i) => `translate(0, ${i * 30})`)
      .attr('fill', (d, i) => {
        return d3.schemeCategory10[i % 10];
      });

    mark.select('rect').attr('fill', (d, i) => d3.schemeCategory10[i % 10]);

    mark.on('mouseenter', onHighlight).on('mouseout', offHighlight);

    marksUpdate
      .selectAll('.mark')
      .select('text')
      .text((d: any) => d.data.name);

    function onHighlight(e: any, d: any) {
      d3.select(svgRef.current).selectAll('tspan').remove();
      setSelected(d as any);

      const i = e ? mark.nodes().indexOf(e.currentTarget) : -1;
      arcContents
        .transition()
        .attr('opacity', (d, j) => {
          return i === -1 || j === i ? '1' : '0.5';
        })
        .attr('d', (d, j) =>
          j === i
            ? (d3
                .arc()
                .innerRadius(radius * 0.5 + 10)
                .outerRadius(radius + 10)(d as any) as any)
            : (d3
                .arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius)(d as any) as any)
        );
    }

    function offHighlight(e: any, d: any) {
      d3.select(svgRef.current).selectAll('tspan').remove();
      setSelected(null);
      const i = e ? mark.nodes().indexOf(e.currentTarget) : -1;
      arcContents
        .transition()
        .attr('opacity', '1')
        .attr(
          'd',
          d =>
            d3
              .arc()
              .innerRadius(radius * 0.5)
              .outerRadius(radius)(d as any) as any
        );
    }
  }, [size, selected]);

  return (
    <div ref={rootRef} style={{width: '100%', height: '100%'}}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default PieChart;