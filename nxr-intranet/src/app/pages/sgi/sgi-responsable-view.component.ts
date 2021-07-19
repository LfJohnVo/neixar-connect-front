import { Component, OnInit } from '@angular/core';
import { EmployeeService, NcindicatorsService, NcevaluationsService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-sgi-responsable-view',
  templateUrl: './sgi-responsable-view.component.html',
  styles: []
})
export class SgiResponsableViewComponent implements OnInit {
  indicators: any[] = [];
  months: string[] = GLOBAL.months;
  shortMonths: string[] = GLOBAL.shortMonths;
  currentMonth: number = moment().month() + 1;
  chosenType: String = 'SGI';
  user: any;
  year = moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year();

  constructor(
    public _employeeService: EmployeeService,
    public _indicatorService: NcindicatorsService,
    public _evaluationService: NcevaluationsService,
    private spinner: NgxSpinnerService
  ) { 
    this.user = this._employeeService.user;  
  }

  ngOnInit() {
    this.getIndicatorsEvalByResponsable();
  }

  /*
  * Obtener los indicadores por tipo y paginados
  */
 getIndicatorsEvalByResponsable() {
  this.spinner.show();  
  this._indicatorService.getEvaluationsByResponsable( this.year, this.chosenType, this.user._id ).subscribe(
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
  this.getIndicatorsEvalByResponsable();
}

}
