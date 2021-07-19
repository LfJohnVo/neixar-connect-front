import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService } from '../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styles: []
})
export class ResetPassComponent implements OnInit {
  resetPassForm: FormGroup;
  errorMessage: String;
  errorMessage2: String = '';
  matched = false;
  token:string = '';

  constructor(private spinner: NgxSpinnerService,
                    public _employeeService: EmployeeService,
                    public router: Router,
                    public activatedRoute: ActivatedRoute,
                    private title: Title) { 
    this.title.setTitle( 'Restablecimiento de contraseña' );
    activatedRoute.params.subscribe( params => {
      params['token'] ? this.token = params['token'] : this.token = '';
    });
  }

  ngOnInit() {
    this.resetPassForm = new FormGroup({
      'pass1': new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      'pass2': new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
    });
  }

  validatePass() {
    if(this.resetPassForm.valid) {
      if(this.resetPassForm.value.pass1 ) {
        if(this.resetPassForm.value.pass1 === this.resetPassForm.value.pass2){
          this.matched = true;
          this.errorMessage = '';
        } else {
          this.matched = false;
          this.errorMessage = 'Las contraseñas no coinciden.';
        }
      } else {
        this.matched = false;
        this.errorMessage = 'Debes ingresar tu nueva contraseña.'
      }    
    } else {
      this.matched = false;
      this.errorMessage = 'Las contraseñas no cumplen los requerimientos mínimos.';
    }
  }

  sendNewPass(){    
    
      this.spinner.show();
      this._employeeService.resetPassFromEmp( this.token, {pass: this.resetPassForm.value.pass1} )
      .subscribe(
        res => {        
          this.spinner.hide();
          this.router.navigateByUrl('/login');
        },
        err => {
          this.errorMessage2 = err.error.message;
          this.spinner.hide();
        }
      );
    
  }

}
