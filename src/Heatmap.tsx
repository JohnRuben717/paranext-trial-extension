import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  score: number;
}

interface HeatmapProps {
  data: Verse[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const heatmapRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const margin = { top: 50, right: 30, bottom: 30, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(heatmapRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xLabels = d3
      .scaleBand<string>()
      .domain(data.map((d) => `${d.chapter}:${d.verse}`))
      .range([0, width])
      .padding(0.05);

    const yLabels = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.book))
      .range([height, 0])
      .padding(0.05);

    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, (d) => d.score) || 1]);

    const xAxis = d3.axisBottom(xLabels);
    const yAxis = d3.axisLeft(yLabels);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g').attr('class', 'y axis').call(yAxis);

    svg
      .selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xLabels(`${d.chapter}:${d.verse}`)!)
      .attr('y', (d) => yLabels(d.book)!)
      .attr('width', xLabels.bandwidth())
      .attr('height', yLabels.bandwidth())
      .style('fill', (d) => colorScale(d.score));

  }, [data]);

  return <svg ref={heatmapRef} />;
};

export default Heatmap;
