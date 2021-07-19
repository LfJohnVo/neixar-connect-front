import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styles: []
})
export class CompanyComponent implements OnInit {
  department: String = "";
  employeesByDepto: any[] = [];
  data: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public _employeeService: EmployeeService,
    public router: Router
  ) { }

  ngOnInit() {
    this.getTeam();
  }

  getTeam() {
    this.spinner.show();
    this._employeeService.getCompany()
    .subscribe(
      res => {        
        this.data = res.data;        
        this.department = res.data[0]._id;
        this.employeesByDepto = res.data[0].employees;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/inicio');
      }
    );
  }

  changeDeparment(department){
    this.spinner.show();
    let data = this.data.filter( depto => depto._id == department );
    this.employeesByDepto = data[0].employees;
    this.department = data[0]._id;
    this.spinner.hide();
  }

}
