import { Injectable } from '@angular/core';
import * as c3 from 'c3';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  constructor() { }

  gaugeChart(id, dataName) {
    let chart = c3.generate({
      bindto: `#${id}`,
      padding: {
        top: 0
      },
      data: {
        columns: [
            [dataName, 0]
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
      },
      legend: {
          show: false
      }
  });
  return chart;
  }

}
