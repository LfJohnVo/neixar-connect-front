import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { CompetenciesService } from "src/app/services/sevice.index";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-competencies-form',
  templateUrl: './competencies-form.component.html',
  styles: []
})
export class CompetenciesFormComponent implements OnInit {

  @Output() dataForm: EventEmitter<any> = new EventEmitter();
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  competencyForm: FormGroup
  questions: FormArray;
  errorMessage: String;
  competency: any;

  constructor( 
    private spinner: NgxSpinnerService,
    public router: Router,
    private fb: FormBuilder,
    public _competenciesService: CompetenciesService,
    public activatedRouter: ActivatedRoute
    ) {
      activatedRouter.params.subscribe( params => {
        if( params['id'] ) this.getCompetency( params['id'] );
      });
    }

  ngOnInit() {
    this.competencyForm = new FormGroup({
      competency: new FormControl('', [Validators.required]),
      type: new FormControl('', Validators.required),
      typePosition: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      questions: this.fb.array([ this.createQuestion() ])
    });
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      question: [''],
      level: ['']
    });
  }

  newQuestion() {
    this.questions = this.competencyForm.get("questions") as FormArray;
    this.questions.push(this.createQuestion());
  }

  deleteQuestion(index) {
    this.questions = this.competencyForm.get("questions") as FormArray;
    this.questions.removeAt(index);
  }

  getCompetency( competencyId ) {
    this.spinner.show();
    this._competenciesService.getCompetency( competencyId )
    .subscribe( res => {
      this.spinner.hide();
        this.competency = res.data[0];
        this.setCompetencyData( res.data[0] );
      }, err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al buscar competencia.'
        });
        this.router.navigateByUrl('/capital-humano/evaluaciones/competencias');
      }
    );
  }

  setCompetencyData( data ) {
    this.competencyForm.patchValue({
      competency: data.competency,
      type: data.type,
      typePosition: data.typePosition,
      description: data.description
    });
    let questions = this.competencyForm.get("questions") as FormArray;
    while (questions.length > 0) questions.removeAt(0);

    if(data.questions.length>0) {
      data.questions.forEach( item => {
        questions.push(
          this.fb.group({
             question: [item.question, Validators.required],
             level: [item.level, Validators.required]
          })
        );
      });
    } else this.newQuestion();
  }

  sendDataForm() {
    if( this.competencyForm.valid ){
      this.dataForm.emit( this.competencyForm.value );
    } else {
      this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';    
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
  }

}
