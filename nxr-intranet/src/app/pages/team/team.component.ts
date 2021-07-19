import { Component, OnInit } from '@angular/core';
import { EmployeeService, NxrevaluationsService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import * as moment from "moment";
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styles: []
})
export class TeamComponent implements OnInit {
  user: any;
  team: any;
  // userInfo: any;
  // department: String = "";
  // employeesByDepto: any;
  disabled: boolean = true;
  year =  moment().year();
  period: string = ( moment().isBetween(moment(GLOBAL.secondPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss')) ) ? '2' : '1';

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _evaluationService: NxrevaluationsService
  ) { 
    this._evaluationService.getPeriodAndYear();
    this.user = this._employeeService.user;
  }

  ngOnInit() {    
    this.getTeam();
    this.denyEvaluation();
  }

  denyEvaluation() {
    if(this._employeeService.pc === 'false' || this._employeeService.pa === 'false') {
      this.disabled = true;
    } else {
      this.disabled = false;
    }
  }

  getTeam() {
    this.spinner.show();
    this._employeeService.getTeam(this.user._id, this._evaluationService.year, this._evaluationService.period)
    .subscribe(
      res => {        
        this.team = res.data;
        if(res.data.length == 0) {
          this.router.navigateByUrl('/perfil/evaluaciones');
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/inicio');
      }
    );
  }

  // getInfo() {
  //   this.spinner.show();
  //   this._employeeService.getEmployee(this.user._id)
  //   .subscribe(
  //     res => {        
  //       this.userInfo = res;
  //       this.department = res.w_information.area.name;
  //       this.spinner.hide();
  //       this.getTeam();
  //     },
  //     err => {
  //       this.spinner.hide();
  //       this.router.navigateByUrl('/inicio');
  //     }
  //   );
  // }

  // getEmployeesByDepto(depto) {
  //   this.spinner.show();
  //   this._employeeService.getEmployeesbyDepartment(depto).subscribe(
  //     res => {
  //       this.employeesByDepto = res.data;
  //       this.spinner.hide();
  //     }, 
  //     err => {
  //       this.spinner.hide();
  //     }
  //   );
  // }

  viewObjectives(id) {
    if(!this.disabled)
    this.router.navigateByUrl(`perfil/evaluaciones/equipo/evaluacion/${id}`);
  }

}
