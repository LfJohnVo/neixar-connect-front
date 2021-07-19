import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { EmployeeService, EmailService } from '../services/sevice.index';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  resetPassForm: FormGroup;
  errorMessage: String;
  errorReset: String;
  emailSent:boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _emailService: EmailService,
    private title: Title
  ) { this.title.setTitle( 'NEIXAR CONNECT' ); }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'user': new FormControl('', [
        Validators.required, 
        Validators.pattern("(?:^[a-z0-9._]{3,}(@neixar\.com)(\.mx)?$)|(?:^(NXR|nxr)[0-9]{4,6}$)")
      ]),
      'pass': new FormControl('', [
        Validators.required
      ]),
    });
    this.resetPassForm = new FormGroup({
      'email': new FormControl('', [
        Validators.required, 
        Validators.pattern("(?:^[a-z0-9._]{3,}(@neixar\.com)(\.mx)?$)|(?:^(NXR|nxr)[0-9]{4,6}$)")
      ])
    });

    if(this._employeeService.isLogged()) this.router.navigateByUrl('/inicio');
  }

  login() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.spinner.show();
      this._employeeService.login( this.loginForm.value )
      .subscribe(
        res => {        
          this.spinner.hide();
          this.router.navigateByUrl('/inicio');
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
        }
      );
    } else {
      this.errorMessage = 'Información incompleta, todos los campos son obligatorios.';
    }
  }

  getResetForm(){
    this.emailSent = false;
    this.resetPassForm.reset();
    this.errorReset = '';
  }

  requestReset(){
    this.spinner.show();
    if(this.resetPassForm.valid){
      let body = {
        SUBJECT: 'Restablecer contraseña',
        TO: this.resetPassForm.value.email
      }
      this._emailService.resetPass(body).subscribe(
        res => {
          this.emailSent = true;
          this.spinner.hide();
        },
        err => {
          this.errorReset = err.error.message;
          this.spinner.hide();
        }
      );
    } else {
      this.spinner.hide();
      this.errorReset = 'Debes escribir tu dirección de correo electrónico o tu número de empleado.';
    }
  }

}
