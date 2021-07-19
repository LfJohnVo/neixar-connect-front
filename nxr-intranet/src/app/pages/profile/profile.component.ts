import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService, NcindicatorsService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { GLOBAL } from '../../config';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: []
})
export class ProfileComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  user: any;
  noData: string = 'Dato no registrado';
  notApplicable: string = 'N/A';
  userInfo: any;
  userpInfo: any;
  userwInfo: any;
  editPass: FormGroup;
  errorMessage: String;
  hasIndicators: boolean = false;
  isLeader: boolean = false;
  searchCVPermission: boolean = false; 

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _indicatorService: NcindicatorsService
  ) {
    const role = this._employeeService.user.role;
    const searchCVroles = ['Admin', 'CH1', 'CH2', 'CO2'];
    this.user = this._employeeService.user;
    this.isLeader = GLOBAL.leaderKeys.indexOf(this._employeeService.user.w_information.position.career_key) > -1 ? true : false;
    this.searchCVPermission = searchCVroles.indexOf(role) !== -1 ? true : false;
  }

  ngOnInit() {
    this.editPass =new FormGroup ({
      pass: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
    this.getInfo();
    this.getResponsables();
  }

  getInfo() {
    this.spinner.show();
    this._employeeService.getEmployee(this.user._id)
    .subscribe(
      res => {
        this.spinner.hide();
        this.userInfo = res;
        this.userpInfo = res.p_information;
        this.userwInfo = res.w_information;
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
          this._employeeService.logout();
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Error al actualizar contraseña.'
          });
        }
      );
    } else {
      this.errorMessage = 'Debes escribir una contraseña.';
      this.spinner.hide();
    }
  }
  
/*
  * Obtener los responsables y determinar si cuenta o no con indicadores
  */
 getResponsables() {
  this.spinner.show();
  let year = moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year();
  this._indicatorService.getResponsables( year ).subscribe(
    res => {
      let count = 0;
      for (const item of res) {
        if(Object.values(item).includes(this.user._id)) count ++;
      }
      count >= 1 ? this.hasIndicators = true : this.hasIndicators =false;
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

}
