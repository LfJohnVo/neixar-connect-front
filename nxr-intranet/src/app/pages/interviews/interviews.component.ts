import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { EmployeeService, RecruitmentService, EmailService } from 'src/app/services/sevice.index';
import * as moment from "moment";
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-interviews',
  templateUrl: './interviews.component.html',
  styles: []
})
export class InterviewsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000
  });
  interviewForm: FormGroup
  user = this._employeeService.user;
  candidates: any[] = [];
  selectedCandidate: any;
  errorMessage: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    public _employeeService: EmployeeService,
    public _recruitmentService: RecruitmentService,
    public _emailService: EmailService
    ) { 
    window.scrollTo(0,0);
  }

  ngOnInit() {
    let competenciesValidators: ValidatorFn[] = [Validators.required, Validators.min(1),Validators.max(5)]
    this.interviewForm = new FormGroup({
      technical_Knowledge: new FormControl('Conocimiento avanzado de Control-M, Conocimiento del proceso de Gestión del Cambio, Gestión de Incidentes, Gestión de Problemas basado en ITIL, Conocimiento en análisis de problemas, Manejo de Sistemas Operativos (Windows, Unix), Conocimiento en la suite Office, Conocimiento en mantenimiento proactivo y correctivo de equipos de redes', Validators.required),
      strengths: new FormControl('', Validators.required),
      areasOfOpportunity: new FormControl('', Validators.required),
      competencies: new FormGroup({
        timeManagement: new FormControl('', competenciesValidators),
        teamwork: new FormControl('', competenciesValidators),
        analysisAndSynthesis: new FormControl('', competenciesValidators),
        communicationAndInfluence: new FormControl('', competenciesValidators),
        decisionMaking: new FormControl('', competenciesValidators),
      }),
      evaluationResult: new FormControl('', [Validators.required, Validators.min(1),Validators.max(10)]),
      approvedEvaluation: new FormControl('', Validators.required),
      acceptedCandidate: new FormControl('', Validators.required),
      justification: new FormControl('Tiene el conocimiento necesario para desempeñar las funciones que se requieren y también cuenta con una excelente actitud para desarrollar nuevas aptitudes.', Validators.required)
    });
    this.getCandidatesToInterview();
  }

  getCandidatesToInterview() {
    this.spinner.show();
    this._recruitmentService.getCandidatesToInterview(this.user._id).subscribe(
      res => {
        this.spinner.hide();
        this.candidates = res.data;
        this.selectedCandidate = res.data[0];
      },
      err => {
        this.spinner.hide();

      }
    );
  }

  getCandidate( candidate ) {
    this.selectedCandidate = candidate;
    this.errorMessage = '';
  }

  acceptedInterview() {
    this.spinner.show();
    if( this.interviewForm.valid ){
      let dataForm = this.interviewForm.value;
      dataForm.interviewer = this._employeeService.user._id;
      dataForm.interviewerName = `${this.user.p_information.name} ${this.user.p_information.firstSurname} ${this.user.p_information.secondSurname}`;
      dataForm.interviewDate = moment().toISOString();
      this.saveInterview( dataForm );
    } else {
      this.errorMessage = 'Error en los datos ingresados.';
    }
  }

  saveInterview( data ) {
    this.spinner.show();
    this._recruitmentService.saveInterview( this.selectedCandidate.vacancyId, this.selectedCandidate.candidateId, data ).subscribe(
      res => {
        this.interviewForm.reset();
        let bodyEmail = {
          position: this.selectedCandidate.positionName,
          candidate: this.selectedCandidate.candidateName,
          evaluator: `${this.user.p_information.name} ${this.user.p_information.firstSurname}`,
          SUBJECT: 'Reporte de Entrevista Registrado',
          TO: this.selectedCandidate.recruiter
        };
        this.getCandidatesToInterview();
        window.scrollTo(0,0);
        $('#acceptModal').modal('hide');
        this.Toast.fire({
          type: 'success',
          title: 'Informe de entrevista registrado correctamente.'
        });
        this.sendNotificationEditPersonnelRequisition( bodyEmail );
      },
      err => {
        this.errorMessage = err;
        $('#acceptModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al registrar informe de entrevista.'
        });
      }
    );
  }

  sendNotificationEditPersonnelRequisition( body ) {
   this._emailService.sendMailRegisterEvaluation(body).subscribe(
     res => {
       this.spinner.hide();
       this.Toast.fire({
         type: 'success',
         title: 'Se ha sido notificado a reclutamiento que concluiste el registro del reporte de entrevista.'
       });
     },
     err => {
       this.spinner.hide();
       console.log(err);
       Swal.fire(
         'Lo sentimos',
         'No pudimos informar a reclutamiento que has registrado el reporte de entrevista. Por favor hazles saber que has concluido.',
         'warning'
       );
     });
    }

}
