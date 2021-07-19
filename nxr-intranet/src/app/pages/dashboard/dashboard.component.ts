import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/sevice.index';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { GLOBAL } from '../../config';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  user: any;
  userInfo: any;
  editPass: FormGroup;
  errorMessage: string = '';
  pc: boolean = false;
  pa: boolean = false;
  month: String = GLOBAL.months[ moment().month()]
  birthdays: any[] = [];
  anniversaries: any[] = [];

  constructor( 
    public _employeeService: EmployeeService,
    public router: Router,
    private spinner: NgxSpinnerService) {
    this.user = this._employeeService.user;      
    this._employeeService.getStorage();

    this.pc = this._employeeService.pc === 'false' ? false : true;
    this.pa = this._employeeService.pa === 'false' ? false : true;
  }

  ngOnInit() {
    this.editPass =new FormGroup ({
      pass: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
    this.getInfo();
    this.getBirthdays();
    this.getAnniversaries();
  }

  getInfo() {
    this.spinner.show();
    this._employeeService.getEmployee(this.user._id)
    .subscribe(
      res => {        
        this.spinner.hide();
        this.userInfo = res;
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/inicio');
      }
    );
  }

  savePassword() {
    this.spinner.show();
    if (this.editPass.valid) {
      this._employeeService.changePass( this.user._id, this.editPass.value ).subscribe(
        res => {
          $('#passModal').modal('hide');
          this.editPass.patchValue({
            pass: ''
          });
          this.errorMessage = '';
          this.spinner.hide();
          this.logout();
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
        }
      );
    } else {
      this.errorMessage = 'Debes escribir una contraseña.';
      this.spinner.hide();
    }
  }

  policyAcceptance() {
    this.spinner.show();
    let ap = { policiesAccepted: true };
    this._employeeService.updateEmployee(this.user._id, ap)
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

  getBirthdays() {
    this.spinner.show();
    this._employeeService.getBirthdays(moment().month() + 1)
    .subscribe(
      res => {        
        this.birthdays = res;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getAnniversaries() {
    this.spinner.show();
    this._employeeService.getanniversaries(moment().month() + 1)
    .subscribe(
      res => {        
        this.anniversaries = res;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  logout() {
    this._employeeService.logout();
  }

}
