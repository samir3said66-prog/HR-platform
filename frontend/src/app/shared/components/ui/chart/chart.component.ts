import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';

/**
 * Chart Component
 *
 * A reusable wrapper component for ECharts with support for multiple chart types.
 * Provides interactivity (hover, click, drill-down) and lazy loading with @defer.
 *
 * Requirements: 11.5, 17.4
 */

export type ChartType = 'line' | 'bar' | 'pie' | 'heatmap' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  title?: string;
  subtitle?: string;
  data: unknown;
  options?: Partial<EChartsOption>;
  height?: string;
  loading?: boolean;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  @Input() set chartConfig(value: ChartConfig) {
    this.config.set(value);
  }

  @Output() chartClick = new EventEmitter<{ name: string; value: unknown }>();
  @Output() chartHover = new EventEmitter<{ name: string; value: unknown }>();

  config = signal<ChartConfig>({
    type: 'line',
    data: [],
    height: '400px',
    loading: false,
  });

  private chart: ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      if (this.chart) {
        this.updateChart(this.config());
      }
    });
  }

  ngOnInit(): void {
    this.initChart();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }

  private initChart(): void {
    if (!this.chartContainer) return;

    this.chart = echarts.init(this.chartContainer.nativeElement, null, {
      useDirtyRect: true,
    });

    this.chart.on('click', (params: any) => {
      this.chartClick.emit({
        name: params.name,
        value: params.value,
      });
    });

    this.chart.on('mouseover', (params: any) => {
      this.chartHover.emit({
        name: params.name,
        value: params.value,
      });
    });

    this.updateChart(this.config());
  }

  private updateChart(config: ChartConfig): void {
    if (!this.chart) return;

    const option = this.buildChartOption(config);
    this.chart.setOption(option);
  }

  private buildChartOption(config: ChartConfig): EChartsOption {
    const baseOption: EChartsOption = {
      title: config.title
        ? {
            text: config.title,
            subtext: config.subtitle,
            left: 'center',
            textStyle: {
              color: '#1e293b',
              fontSize: 16,
              fontWeight: 'bold',
            },
            subtextStyle: {
              color: '#64748b',
              fontSize: 12,
            },
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#4F46E5',
        textStyle: {
          color: '#fff',
        },
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        top: config.title ? '15%' : '3%',
        containLabel: true,
      },
      ...config.options,
    };

    switch (config.type) {
      case 'line':
        return this.buildLineChart(config, baseOption);
      case 'bar':
        return this.buildBarChart(config, baseOption);
      case 'pie':
        return this.buildPieChart(config, baseOption);
      case 'heatmap':
        return this.buildHeatmapChart(config, baseOption);
      case 'scatter':
        return this.buildScatterChart(config, baseOption);
      default:
        return baseOption;
    }
  }

  private buildLineChart(config: ChartConfig, baseOption: EChartsOption): EChartsOption {
    const data = config.data as any;
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: data.categories || [],
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
        },
      },
      series: [
        {
          data: data.values || [],
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#4F46E5',
          },
          areaStyle: {
            color: 'rgba(79, 70, 229, 0.1)',
          },
        },
      ],
    };
  }

  private buildBarChart(config: ChartConfig, baseOption: EChartsOption): EChartsOption {
    const data = config.data as any;
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: data.categories || [],
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
        },
      },
      series: [
        {
          data: data.values || [],
          type: 'bar',
          itemStyle: {
            color: '#4F46E5',
          },
        },
      ],
    };
  }

  private buildPieChart(config: ChartConfig, baseOption: EChartsOption): EChartsOption {
    const data = config.data as any;
    return {
      ...baseOption,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          data: data.values || [],
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            color: '#64748b',
          },
        },
      ],
    };
  }

  private buildHeatmapChart(config: ChartConfig, baseOption: EChartsOption): EChartsOption {
    const data = config.data as any;
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: data.xCategories || [],
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'category',
        data: data.yCategories || [],
        axisLabel: {
          color: '#64748b',
        },
      },
      visualMap: {
        min: data.min || 0,
        max: data.max || 100,
        calculable: true,
        inRange: {
          color: ['#10B981', '#4F46E5', '#EF4444'],
        },
      },
      series: [
        {
          data: data.values || [],
          type: 'heatmap',
          label: {
            show: true,
            color: '#fff',
          },
        },
      ],
    };
  }

  private buildScatterChart(config: ChartConfig, baseOption: EChartsOption): EChartsOption {
    const data = config.data as any;
    return {
      ...baseOption,
      xAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
        },
      },
      series: [
        {
          data: data.values || [],
          type: 'scatter',
          symbolSize: 8,
          itemStyle: {
            color: '#4F46E5',
            opacity: 0.7,
          },
        },
      ],
    };
  }

  private setupResizeObserver(): void {
    if (!this.chartContainer) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });

    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }
}
