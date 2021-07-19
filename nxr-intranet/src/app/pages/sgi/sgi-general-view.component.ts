import { Component, OnInit } from '@angular/core';
import { NcindicatorsService, NcevaluationsService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-sgi-general-view',
  templateUrl: './sgi-general-view.component.html',
  styles: []
})
export class SgiGeneralViewComponent implements OnInit {
  indicators: any[] = [];
  processes: any[] = [];
  years: any[] = [];
  months: string[] = GLOBAL.months;
  shortMonths: string[] = GLOBAL.shortMonths;
  currentMonth: number = moment().month() + 1;
  chosenType: String = 'SGI';
  chosenProcess: String;
  user: any;
  evaluation: any;
  indicator: any;
  colors: any = {
    green: {
      min: 0,
      max: 0
    },
    yellow: {
      min: 0,
      max: 0
    },
    red: {
      min: 0,
      max: 0
    }
  };
  currentEval = true;
  year = moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year();

  constructor(
    public _indicatorService: NcindicatorsService,
    public _evaluationService: NcevaluationsService,
    private spinner: NgxSpinnerService
  ) { 
    this.getYears();
  }

  ngOnInit() {
    //this.getProcesses();
    //this.getIndicatorsEvalByResponsable();
  }

  /*
  * Obtener los indicadores por responsable y concatena su registro de evaluación
  */
 getIndicatorsEvalByResponsable() {
  this.spinner.show();
  this._indicatorService.getEvaluationsByResponsable( this.year, this.chosenType ).subscribe(
    res => {
      this.indicators = res;
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

/*
  * Obtener los indicadores por proceso y concatena su registro de evaluación
  */
 getIndicatorsEvalByProcess() {
  this.spinner.show();
  this._indicatorService.getEvaluationsByProcess( this.year, this.chosenProcess ).subscribe(
    res => {
      this.indicators = res;
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

//Realiza la petición de los indicadores según el tipo solicitado.
changeType(type) {
  this.chosenType = type;
  type == 'PROCESOS' ? this.getIndicatorsEvalByProcess() : this.getIndicatorsEvalByResponsable();
}

//Realiza la petición de los indicadores según el proceso seleccionado.
changeProcess(process) {
  this.chosenProcess = process;
  this.getIndicatorsEvalByProcess();
}

changeYear(year) {
  this.year = year;
  this.currentEval = this.year == (moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year());
  this.getProcesses();
  this.chosenType == 'PROCESOS' ? this.getIndicatorsEvalByProcess() : this.getIndicatorsEvalByResponsable();
}

/*
  * Obtener los indicadores por tipo y paginados
  */
 getProcesses() {
  this.spinner.show();
  this._indicatorService.getProcesses( this.year ).subscribe(
    res => {
      this.processes = res;
      this.chosenProcess = res[0]._id;
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

 /*
  * Obtener el regustro de evaluación del año y del indicador requerido
  */
 requestEvaluation( indicator ) {   
  this.spinner.show();
  this._evaluationService.getEvaluationsByYearAndIndicator(this.year, indicator ).subscribe(
    res => {
      this.evaluation = res.evaluations;
      this.indicator = res.indicator;
      for (let i = 0; i<3; i++) {
        if(res.indicator.trafficLight[i].value === 'green') {
            this.colors.green.min = res.indicator.trafficLight[i].min;
            this.colors.green.max = res.indicator.trafficLight[i].max;
        } else if (res.indicator.trafficLight[i].value === 'yellow') {
          this.colors.yellow.min = res.indicator.trafficLight[i].min;
          this.colors.yellow.max = res.indicator.trafficLight[i].max;
        } else {
          this.colors.red.min = res.indicator.trafficLight[i].min;
          this.colors.red.max = res.indicator.trafficLight[i].max;
        }
      }      
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

/*
   * Esta función obtiene todos los años de evaluación registrados
   */
  getYears() {
    this.spinner.show();
    this._indicatorService.getYears().subscribe(
      res => {
        this.years = res.data;
        (this.years.length > 0) ? this.year = this.years[0]._id : this.year = moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year();
        this.currentEval = this.year == (moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year());
        this.getProcesses();
        this.chosenType == 'PROCESOS' ? this.getIndicatorsEvalByProcess() : this.getIndicatorsEvalByResponsable();
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

}
