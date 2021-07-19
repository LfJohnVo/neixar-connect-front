import { Component, OnInit, Input } from '@angular/core';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-sgi-indicators-chart',
  templateUrl: './sgi-indicators-chart.component.html',
  styles: []
})
export class SgiIndicatorsChartComponent implements OnInit {
  @Input() labels:string[] = GLOBAL.shortMonths;
  @Input() data:ChartDataSets[] = [ { data: [65, 59, 80, 81, 56, 55, 40, 28, 48, 40, 19, 86], label: 'Cumplimiento' }];
  @Input() colors:Array<any> = [ 
    { 
      backgroundColor: ['rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)'],
      hoverBackgroundColor: ['rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)']
    }
  ];
  barChartType:string = 'bar';
  barChartOptions: ChartOptions = {
    responsive: true,
    tooltips: {
      callbacks: {
          label: function(tooltipItem, data) {
            let i = tooltipItem.datasetIndex;
            let label = data.datasets[i].label;
            let num = tooltipItem.yLabel.toFixed(2);
              return label +': ' + num + '%';
          }
      }
  },
    scales: {
      yAxes: [{
          ticks: {
              suggestedMin: 0,
              callback: function(value, index, values) {
                return value + '%';
            }
          }
      }]
  },
    legend: {
      display: false,
    }
  };

  constructor() { }

  ngOnInit() {
  }

}
