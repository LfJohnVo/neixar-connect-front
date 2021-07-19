import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { ChartOptions, ChartDataSets } from 'chart.js';
import { Color, BaseChartDirective } from 'ng2-charts';
import { NcindicatorsService, NcevaluationsService } from "../../services/sevice.index";
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-normativity',
  templateUrl: './normativity.component.html',
  styles: []
})
export class NormativityComponent implements OnInit {
  @ViewChild('sgiChart') sgiChartComponent: any;
  @ViewChild(BaseChartDirective) processChartComponent: BaseChartDirective;
  sgiIndicators: number = 0;
  processIndicators: number = 0;
  averages: any[] = [];
  year = moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year();
  years: any[] = [];
  sgiYear: string;
  processYear: string;
  chosenYear: String;
  sgiIndicator: any;
  processIndicator: any;
  sgiIndicatorsArray: string[];
  processIndicatorsArray: string[];
  labels: String[] = GLOBAL.shortMonths;
  data: ChartDataSets[] = [ { data: [65, 59, 80, 81, 56, 55, 40, 28, 48, 40, 19, 86], label: 'Cumplimiento' }];
  processColors: Color[] = [ 
    { 
      backgroundColor: ['rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)', 'rgba(175,196,63,1)'],
      hoverBackgroundColor: ['rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)', 'rgba(175,196,63,.8)']
    }
  ];
  barChartType: String = 'bar';
  sgiData: ChartDataSets[] = [ { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Cumplimiento' }];
  processData: ChartDataSets[] = [ { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Cumplimiento' }];
  sgiColors: Color[] = [];
  colors = ['rgba(175,196,63,1)', 'rgba(220,53,69,1)', 'rgba(255,193,7,1)']; // Verde, Rojo, Amarrillo
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
  
  constructor(
    private router: Router,
    public _indicatorService: NcindicatorsService,
    public _evaluationService: NcevaluationsService,
    private spinner: NgxSpinnerService
  ) { 
    this.getEvaluatedYears();
  }

  ngOnInit() { 
    //setInterval(() => this.randomize(), 1000);
    this.getIndicatorsByYear();
  }

  randomize() {
    this.processColors = [ ...this.processColors ];
  }

  getEvaluatedYears() {
    this.spinner.show();
    this._indicatorService.getYears().subscribe(
      res => {
        this.years = res.data;
        if (this.years.length > 0) {
          this.chosenYear = this.years[0]._id;
          this.sgiYear= this.years[0]._id;
          this.processYear = this.years[0]._id;
        } else {
          this.chosenYear = '';
          this.sgiYear = '';
          this.processYear = '';
        }
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

 getIndicatorsType(type, year) {
  this.spinner.show();
  this._indicatorService.getIndicatorsType( type, year ).subscribe(
    res => {
      if ( type === 'SGI' ) {
        this.sgiIndicator = res.data[0];
        this.sgiIndicatorsArray = res.data;
        this.requestEvaluation(this.sgiYear, res.data[0]._id, 'SGI');
      } else {
        this.processIndicator = res.data[0];
        this.processIndicatorsArray = res.data;
        this.requestEvaluation(this.processYear, res.data[0]._id, 'PROCESO');
      }
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

viewIndicators() {
  this.router.navigateByUrl('/sgi/indicadores');
}

getIndicatorsByYear() {
  let servicesToConsume = [
    this._indicatorService.getIndicatorsType( 'SGI', this.year ),
    this._indicatorService.getIndicatorsType( 'PROCESOS', this.year )
  ];

  forkJoin( servicesToConsume ).subscribe( 
    responses => {
      this.sgiIndicators = responses[0].total;
      this.sgiIndicator = responses[0].data[0];
      this.processIndicators = responses[1].total;
      this.processIndicator = responses[1].data[0];
      this.sgiIndicatorsArray = responses[0].data;
      this.processIndicatorsArray = responses[1].data;
      this.getInformationToGraph();
    }, err => {
    this.spinner.hide();
  });
}

getInformationToGraph() {
  let servicesToConsume = [
    this._evaluationService.getEvaluationsByYearAndIndicator(this.chosenYear, this.sgiIndicator._id ),
    this._evaluationService.getEvaluationsByYearAndIndicator(this.chosenYear, this.processIndicator._id ),
  ];

  forkJoin( servicesToConsume ).subscribe( 
    responses => {
    this.sgiIndicator.average = responses[0].average;
    this.processIndicator.average = responses[1].average;
    this.defineChartValues(responses[0].evaluations, 'SGI');
    this.defineChartValues(responses[1].evaluations, 'PROCESO');

    this.spinner.hide();
  
    }, err => {
    this.spinner.hide();
  });
}

defineChartValues( evaluationResults, type ){
  let evaluations = evaluationResults;
  let values = evaluations.map( evaluation => evaluation.progress || 0 );
  const colors = evaluations.map ( evaluation => {
    if (evaluation.color === 'red') {
      return this.colors[1];
    } else if (evaluation.color === 'green') {
      return this.colors[0];
    } else {
      return this.colors[2];
    }
  });
  
  if (type === 'SGI') {
    let sgidata = [{ data: values, label: 'Cumplimiento', backgroundColor: colors }];
    this.sgiColors = [{ backgroundColor: colors }];
    this.sgiColors = [ ...this.sgiColors ];
    setTimeout(() => this.sgiData = [...sgidata], 10);
  } else {
    this.data = [{ data: values, label: 'Cumplimiento'}];
    this.processColors = [{ backgroundColor: colors }];
    this.processColors = [ ...this.processColors ];
    setTimeout(() => this.processData = [...this.data], 10);
  }
}

changeSgiIndicator( indicatorId ) {
  this.requestEvaluation(this.sgiYear, indicatorId, 'SGI');
}

changeSgiYear( year ) {
  this.sgiYear = year;
  this.getIndicatorsType('SGI', year);
}

changeProcessIndicator( indicatorId ) {
  this.requestEvaluation(this.processYear, indicatorId, 'PROCESO');
}

changeProcessYear( year ) {
  this.processYear = year;
  this.getIndicatorsType('PROCESOS', year);
}

requestEvaluation(year, indicator, type) {
  this.spinner.show();
  this._evaluationService.getEvaluationsByYearAndIndicator(year, indicator ).subscribe(
    res => {      
      if( type === 'SGI' ) {
        let indicator = res.indicator;
        indicator.average = res.average;
        this.sgiIndicator = indicator        
        this.defineChartValues(res.evaluations, type);
      } else  {
        let indicator = res.indicator;
        indicator.average = res.average;
        this.processIndicator = indicator        
        this.defineChartValues(res.evaluations, type);
      }
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
      this.router.navigateByUrl('/sgi');
    }
  );
}

}
