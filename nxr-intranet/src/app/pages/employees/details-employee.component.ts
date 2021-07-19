import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from '../../services/sevice.index';
import * as moment from 'moment';

@Component({
  selector: 'app-details-employee',
  templateUrl: './details-employee.component.html',
  styles: []
})
export class DetailsEmployeeComponent implements OnInit {
  noData: string = 'Dato no registrado';
  notApplicable: string = 'N/A';
  userInfo: any;
  userpInfo: any;
  userwInfo: any;
  userfInfo: any;
  timeofservice = {
    'years': 0,
    'months': 0,
    'days': 0
  };

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public _employeeService: EmployeeService
  ) { 
    activatedRoute.params.subscribe( params => {
      let id = params['id'];
      this.getInfo(id);
    });
  }

  ngOnInit() {
  }

  getInfo(id) {
    this.spinner.show();
    this._employeeService.getEmployee(id)
    .subscribe(
      res => {        
        this.userInfo = res;
        this.userpInfo = res.p_information;
        this.userwInfo = res.w_information;
        this.userfInfo = res.f_information;
        let admission_date = moment( res.w_information.admission_date );
        
        let today = moment();
        let years = today.diff(admission_date, 'years');
        let months = today.diff(admission_date, 'months');
        let days = today.diff(admission_date, 'days');

        this.timeofservice.years = years;
        this.timeofservice.months = months;
        this.timeofservice.days = days;

        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/capital-humano');
      }
    );
  }

}
