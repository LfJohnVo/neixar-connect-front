import { Component, OnInit, Input } from '@angular/core';
import * as c3 from 'c3';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html'
})
export class GaugeChartComponent implements OnInit {
  @Input() data:number = 0;

  constructor() { }

  ngOnInit() {
    this.initializeChart();
  }

  initializeChart() {
    let chart = c3.generate({
      bindto: '#chart',
      padding: {
        top: 0
      },
      data: {
        columns: [
            ['Avance', this.data]
        ],
        type: 'gauge'
      },
      color: {
        pattern: ['#FFFFFF', '#DC3545', '#FFC107', '#AFC43F', '#28A745'], // the three color levels for the percentage values.
        threshold: {
            values: [1, 61, 81, 96, 100]
        }
    },
    transition: {
      duration: 1000
    }
  });
  }
}
