import { Component, ElementRef, ViewChild, effect, input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  template: `
    <div class="w-full h-full relative" #chartContainer></div>
  `
})
export class ActivityChartComponent {
  data = input.required<{ date: Date, value: number }[]>();
  @ViewChild('chartContainer') container!: ElementRef;

  constructor() {
    effect(() => {
      const data = this.data();
      if (this.container && data.length) {
        this.renderChart(data);
      }
    });
  }

  private renderChart(data: { date: Date, value: number }[]) {
    const element = this.container.nativeElement;
    d3.select(element).selectAll('*').remove();

    const margin = { top: 10, right: 10, bottom: 20, left: 0 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradients
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'activityGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#22d3ee').attr('stop-opacity', 0.5);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#22d3ee').attr('stop-opacity', 0);

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Line
    const line = d3.line<{ date: Date, value: number }>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.date))
      .y(d => y(d.value));

    // Area
    const area = d3.area<{ date: Date, value: number }>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.value));

    // Draw Area
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#activityGradient)')
      .attr('d', area);

    // Draw Line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#22d3ee')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots
    svg.selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', '#0f172a')
      .attr('stroke', '#22d3ee')
      .attr('stroke-width', 2);
      
    // Add X Axis (Custom minimalist)
    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickFormat((d: any) => d3.timeFormat('%a')(d))
        .tickSize(0)
        .tickPadding(10);
        
    const xAxisGroup = svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
        
    xAxisGroup.select('.domain').remove();
    xAxisGroup.selectAll('text').attr('fill', '#64748b').attr('font-size', '10px');
  }
}