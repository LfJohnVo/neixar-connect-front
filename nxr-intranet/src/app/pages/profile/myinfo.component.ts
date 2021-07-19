import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import * as moment from 'moment';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-myinfo',
  templateUrl: './myinfo.component.html',
  styles: []
})
export class MyinfoComponent implements OnInit {
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
  userfInfo: any;
  userForm: FormGroup;
  errorMessage: String;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService
    ) { 
      this.user = this._employeeService.user;   
    }

  ngOnInit() {
    this.userForm = new FormGroup({
      p_information: new FormGroup({
        name: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        firstSurname: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        secondSurname: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        gender: new FormControl('FEMENINO'),
        birthdate: new FormControl('', [
          Validators.required,
          Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$")
          ]),
        birthplace: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        nationality: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        marital_status: new FormControl('', Validators.required),
        ssn: new FormControl('', [
          Validators.required,
          Validators.pattern("^[0-9]{11}$")
        ]),
        curp: new FormControl('', [
          Validators.required,
          Validators.pattern("^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$")
        ]),
        rfc: new FormControl('', [
          Validators.required,
          Validators.pattern("^([A-Z,Ñ,&]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]))([A-Z|0-9]{3})?$")
        ]),
        phone_number: new FormControl('', [
          Validators.required,
          Validators.pattern("^[0-9]{8,10}$")
        ]),
        address: new FormControl('', [
          Validators.required,
          Validators.minLength(10)
        ]),
        emergency_contact: new FormGroup({
          name: new FormControl('', [
            Validators.required, 
            Validators.minLength(3)
          ]),
          phone_number: new FormControl('', [
            Validators.required,
            Validators.pattern("^[0-9]{8,10}$")
          ])
        })
      })
    });
    this.getInfo();    
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
        this.userfInfo = res.f_information;
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/inicio');
      }
    );
  }

  editUser() {
    this.spinner.show();
    if (this.userForm.valid) {
      let user = this.userForm.value;
      user.p_information.birthdate = moment(user.p_information.birthdate, 'DD/MM/YYYY').toISOString();
      this._employeeService.updateEmployee(this.user._id, user)
        .subscribe(
          res => {
            this.getInfo();
            this.spinner.hide();
            $('#EditProfileModal').modal('hide');
            this.Toast.fire({
              type: 'success',
              title: 'Información actualizada correctamente.'
            });
          },
          err => {
            this.errorMessage = err.error.message;
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al actualizar información, inténtalo de nuevo.'
            });
          }
        )
    } else {
      this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos..'
      });
    }
  }

  setData() {
    this.errorMessage = "";
    this.userForm.patchValue({
      p_information:{
        name: this.userpInfo.name,
        firstSurname: this.userpInfo.firstSurname,
        secondSurname: this.userpInfo.secondSurname,
        birthdate: 
          this.userpInfo.birthdate === null ||
          this.userpInfo.birthdate === undefined
            ? ""
            : moment(this.userpInfo.birthdate).format("DD/MM/YYYY"),
        gender: this.userpInfo.gender,
        birthplace: this.userpInfo.birthplace,
        nationality: this.userpInfo.nationality,
        marital_status: this.userpInfo.marital_status,
        ssn: this.userpInfo.ssn,
        curp: this.userpInfo.curp,
        rfc: this.userpInfo.rfc,
        phone_number: this.userpInfo.phone_number,
        address: this.userpInfo.address,
        emergency_contact: {
          name: this.userpInfo.emergency_contact.name,
          phone_number: this.userpInfo.emergency_contact.phone_number
        }
      }
    });
  }

}
