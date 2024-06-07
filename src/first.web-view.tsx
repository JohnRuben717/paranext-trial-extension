import React, { useEffect, useState } from 'react';
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
  const heatmapRef = React.useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const margin = { top: 50, right: 30, bottom: 30, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const gridSize = Math.floor(width / 24);
    const legendElementWidth = gridSize * 2;
    const buckets = 9;

    const colorScheme = d3.interpolateYlOrRd;
    const colors = d3
      .scaleQuantile<string>()
      .domain([0, buckets - 1, d3.max(data, (d) => d.score) || 1])
      .range(Array.from({ length: buckets }, (_, i) => colorScheme(i / (buckets - 1))));

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
      .data(data, (d: any) => `${d.book}:${d.chapter}:${d.verse}`)
      .enter()
      .append('rect')
      .attr('x', (d) => xLabels(`${d.chapter}:${d.verse}`)!)
      .attr('y', (d) => yLabels(d.book)!)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', xLabels.bandwidth())
      .attr('height', yLabels.bandwidth())
      .style('fill', (d) => colors(d.score));

    const legend = svg
      .selectAll('.legend')
      .data([0].concat(colors.quantiles()), (d) => `${d}`)
      .enter()
      .append('g')
      .attr('class', 'legend');

    legend
      .append('rect')
      .attr('x', (_, i) => legendElementWidth * i)
      .attr('y', height + gridSize)
      .attr('width', legendElementWidth)
      .attr('height', gridSize / 2)
      .style('fill', (_, i) => colors(i / (buckets - 1)));

    legend
      .append('text')
      .attr('class', 'mono')
      .text((d) => `≥ ${Math.round(d as number)}`)
      .attr('x', (_, i) => legendElementWidth * i)
      .attr('y', height + gridSize * 2);
  }, [data]);

  return <svg ref={heatmapRef} />;
};

const App: React.FC = () => {
  const [data, setData] = useState<Verse[]>([]);

  useEffect(() => {
    fetch('https://github.com/JohnRuben717/paranext-trial-extension/blob/main/src/bible.json')
      .then((response) => response.json())
      .then((data: Verse[]) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Heatmap</h1>
      <Heatmap data={data} />
    </div>
  );
};

global.webViewComponent = App;
