import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as moment from 'moment';

@Component({
  selector: 'app-candidate-form',
  templateUrl: './candidate-form.component.html',
  styles: []
})
export class CandidateFormComponent implements OnInit {

  candidateForm: FormGroup;
  errorMessage: String;
  @Output() dataForm:  EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.candidateForm = new FormGroup({
      name: new FormControl('', Validators.required),
      firstSurname: new FormControl('', Validators.required),
      secondSurname: new FormControl("", Validators.required),
      gender: new FormControl('FEMENINO', Validators.required),
      birthdate: new FormControl("", [
        Validators.required, 
        Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$")
      ]),
      phone_number: new FormControl("", [
        Validators.required, 
        Validators.pattern("^[0-9]{8,10}$")
      ]),
      email: new FormControl('', [
        Validators.required, 
        Validators.pattern("^[^@]+@[^@]+\.[a-z]{2,}$")
      ]),
      address: new FormControl("", Validators.required),
      marital_status: new FormControl("", Validators.required),
      scholarship: new FormControl("", Validators.required),
      courses: new FormControl("", Validators.required),
      english_level: new FormControl("", Validators.required),
      certification: new FormControl('false', Validators.required),
      economic_claims: new FormControl("", Validators.required),
      source: new FormControl("", Validators.required)
    });
  }

  sendRequestData() {
    let formData = this.candidateForm.value;
    let birthdate = formData.birthdate;
    birthdate = moment(birthdate,'DD/MM/YYYY').toISOString();
    formData.birthdate = birthdate;

    if( this.candidateForm.valid ) {      
      this.dataForm.emit( formData );
    } else {
      this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';
    }
  }
}
