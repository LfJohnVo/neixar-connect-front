import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styles: []
})
export class DoughnutChartComponent implements OnInit {
  @Input() labels:string[] = ['Evaluados', 'Sin Evaluar'];
  @Input() data:number[] = [139, 54];
  public doughnutChartType:string = 'doughnut';
  @Input() colors:Array<any> = [ 
    { 
      backgroundColor: ['rgba(175,196,63,1)', 'rgba(12,32,79,1)', 'rgba(233,233,233,1)','rgba(199,28,121,1)', 'rgba(0,123,255,1)'],
      hoverBackgroundColor: ['rgba(175,196,63,.8)', 'rgba(12,32,79,.8)', 'rgba(233,233,233,.8)', 'rgba(199,28,121,.8)', 'rgba(0,123,255,.8)']
    }
  ];
  public options: any = {
    responsive : true,
    legend: {
      position: 'right',
      labels: {
        padding: 5,
        fontFamily: " 'Cuprum-Regular','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        usePointStyle: true
      }
    },
    tooltips: {
      titleFontFamily: "'Cuprum-Regular','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      bodyFontFamily: "'Cuprum-Regular','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      footerFontFamily: "'Cuprum-Regular','Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
