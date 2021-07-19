import { Component, OnInit } from '@angular/core';
import {EmployeeService, NxrevaluationsService, ChartsService} from "../../services/sevice.index";
import { NgxSpinnerService } from "ngx-spinner";

declare var $: any;

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styles: []
})
export class EmployeeSummaryComponent implements OnInit {
  errorMessage: String;
  evaluations: any[];
  chart: any;
  data:Number = 0;
  nextEval: String;
  period: String;
  boss: any;
  isBoss: Boolean = false; // Permite mostrar o no botón Evaluar Equipo
  pa: boolean = false;

  constructor(
    public _employeeService: EmployeeService,
    public _evaluationService: NxrevaluationsService,
    public _chartService: ChartsService,
    private spinner: NgxSpinnerService,
  ) { 
    this._employeeService.getStorage();
    this._evaluationService.getPeriodAndYear(); 
    this.pa = this._employeeService.pa === 'false' ? false : true;
  }

  ngOnInit() {
    this.chart = this._chartService.gaugeChart('chart', 'Avance');
    this.getEvals(this._employeeService.user._id, this._evaluationService.year);
    this.getUser();
    this.getTeam();
  }

  /*
    * Obtiene las evaluaciones de un empleado en particular y de un año en específico.
    */
  getEvals(id, year) {
    this.spinner.show();
    this._evaluationService.getEvaluationsByEmp(id, year).subscribe(
      res => {
        let evals = res.data;
        let total = res.total;
        if (total == 2) this.data = evals[1].total;
        else if (total == 1) this.data = evals[0].total;
        else this.data = 0;
        this.chart.load({
          columns: [['Avance', this.data]]
        });
        this.nextEval = this._evaluationService.nextEval;
        (this._evaluationService.period == '1') ?  this.period = 'Primer Semestre' : this.period ='Segundo Semestre';
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getUser() {
    this.spinner.show();
    this._employeeService.getEmployee(this._employeeService.user._id).subscribe(
      res => {
        this.boss = res.w_information.immediate_boss;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getTeam() {
    this.spinner.show();
    this._employeeService.getTeam(this._employeeService.user._id, this._evaluationService.year, this._evaluationService.period)
    .subscribe(
      res => {        
        (res.data.length > 0) ? this.isBoss = true : this.isBoss = false;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  policyAcceptance() {
    this.spinner.show();
    let ap = { policiesAccepted: true };
    this._employeeService.updateEmployee(this._employeeService.user._id, ap)
    .subscribe(
      res => {        
        $('#policyModal').modal('hide');
        localStorage.setItem('pa', 'true');
        this._employeeService.getStorage();
        this.pa = true;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    )
  }

}
