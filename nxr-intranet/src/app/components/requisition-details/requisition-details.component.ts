import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RecruitmentService, ConfigService } from 'src/app/services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from "sweetalert2";
import * as moment from "moment";
declare var $: any;

@Component({
  selector: 'app-requisition-details',
  templateUrl: './requisition-details.component.html',
  styles: []
})
export class RequisitionDetailsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000
  });
  @Input() requisitionShown:any;
  @Output() rejection: EventEmitter<number> = new EventEmitter();
  @Output() validation: EventEmitter<number> = new EventEmitter();
  @Output() evaluation: EventEmitter<any> = new EventEmitter();
  @Output() rejectCandidate: EventEmitter<any> = new EventEmitter();
  @Output() approveCandidate: EventEmitter<any> = new EventEmitter();
  @Output() closeVacancyAction: EventEmitter<any> = new EventEmitter();
  @Output() earlyCloseVacancyAction: EventEmitter<any> = new EventEmitter();
  toValidate: boolean = false;
  rejectForm: FormGroup;
  rejectCandidateForm: FormGroup;
  contractSignatureForm: FormGroup;
  reject: boolean = false
  errorMessage: string = '';
  addCandidatesGrant: boolean = false;
  candidate: any;
  candidateToReject: any;
  candidateToApprove: any;
  comments: FormControl;
  rejectionComments: FormControl;
  stage: String;
  interviewReport: any;
  interviews: any[] = [];
  receivers: string[] = [];

  constructor( 
    private spinner: NgxSpinnerService,
    public router: Router,
    public _recruitmentService: RecruitmentService,
    public _configService: ConfigService) { 
    if( this.router.url.indexOf('/validar-requisiciones') > -1 ) this.toValidate = true;
    this.addCandidatesGrant = this.router.url.includes("mis-vacantes");
  }

  ngOnInit() {
    this.rejectForm = new FormGroup({
      actionType: new FormControl('V', Validators.required)
    });
    this.comments = new FormControl('', Validators.required);
    this.rejectionComments = new FormControl('', Validators.required);
    this.contractSignatureForm = new FormGroup({
      id_neixar: new FormControl('', [
        Validators.required
      ]),
      admission_date: new FormControl('', [
        Validators.required,
        Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$")
      ])
    });
    this.rejectCandidateForm = new FormGroup({
      status: new FormControl('Declinado', Validators.required),
      justification: new FormControl('', Validators.required)
    });
  }

  checkResponse( response ) {
    if( response === 'R' ) {
      this.reject=true;
      this.rejectForm.addControl('rejectionComments', new FormControl('', Validators.required));  
    } else {
      this.reject=false;
      this.rejectForm.removeControl('rejectionComments');
    }
  this.errorMessage = '';
  }

  requisitionRejection() {
    if(this.rejectForm.valid) {
      this.rejection.emit( this.rejectForm.value )
    } else {
      this.errorMessage = 'Debes describir los motivos de rechazo.'
    }
  }

  requisitionValidation() {
    this.validation.emit( )
  }

  getCandidateInfo( candidateId, actionType ) {
    this.spinner.show();
    this._recruitmentService.getRequisitionCandidateInfo( candidateId ).subscribe(
      res => {
        this.candidate = res.data[0].candidates[0];
        this.stage = this.candidate.stage;
        if (actionType === 'report') this.getCandidateStage();
        else if (actionType === 'interview') {
          if (this.candidate.interviews.length > 0) {
            this.interviews = this.candidate.interviews;
            let report = this.candidate.interviews[0];
            report.candidateName = `${this.candidate.candidate.name} ${this.candidate.candidate.firstSurname} ${this.candidate.candidate.secondSurname}`
            report.positionName = this.requisitionShown.position.positionName;
            this.interviewReport = report;
          }
          $('#interviewReportModal').modal('show');
        }
        else $('#candidateDetailsModal').modal('show');
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  getCandidateStage( ) {
    this.comments.reset();
    this.errorMessage = '';

    if( this.stage === 'Entrevista Líder' ) this.comments.clearValidators();
    else this.comments.setValidators(Validators.required);
    this.comments.updateValueAndValidity();
    $('#candidateReportModal').modal('show');
  }

  defineStructureComments() {
    this.spinner.show();
    if(this.comments.valid) {
      let commentsStage: any = {};
      let nextStage: string = null;
      if(this.stage === 'Entrevista Inicial') {
        if (this.requisitionShown.technical_test) 
          commentsStage = { 
            initialInterview: this.comments.value, 
            nextStage: 'Prueba Técnica'
          }; 
        else
        commentsStage = { 
          initialInterview: this.comments.value, 
          nextStage: 'Entrevista Líder'
        }; 
      } 
      else if(this.stage === 'Prueba Técnica') commentsStage = { technicalTest: this.comments.value };
      else if(this.stage === 'Entrevista Líder') commentsStage = { leaderInterview: true };
      else if(this.stage === 'Prueba Psicométrica') commentsStage = { psychometricTest: this.comments.value };
      else if(this.stage === 'Propuesta Económica') commentsStage = { economicProposal: this.comments.value };
      
      let data: any = {
        id: this.candidate._id,
        comments: commentsStage
      };

      if (nextStage) data.nextStage = nextStage;

      this.evaluation.emit( data );
    } else {
      this.errorMessage = 'Debes ingresar los comentarios de la etapa.' 
      this.spinner.hide();
    }
  }

  getCandidateToReject( candidate ) {
    this.candidateToReject = {
      candidateName: `${ candidate.name } ${ candidate.firstSurname } ${ candidate.secondSurname }`,
      candidateId: candidate._id
    };
    this.rejectCandidateForm.patchValue({
      status: 'Declinado',
      justification: ''
    });
    this.errorMessage = '';
    $('#rejectCandidateModal').modal('show');
  }

  getCandidateToApprove( candidate ) {
    this.candidateToApprove = {
      candidateName: `${ candidate.name } ${ candidate.firstSurname } ${ candidate.secondSurname }`,
      candidateId: candidate._id
    };
    this.contractSignatureForm.reset();
    this.errorMessage = '';
    this.getDataConfiguration();
  }

  getDataConfiguration( ) {
    this.spinner.show();
    this._configService.getDataConfiguration().subscribe(
      res => {
        this.receivers = res[0].receivers.map( receiver => receiver.receiverEmail);
        $('#approveCandidateModal').modal('show');
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
         this.Toast.fire({
          type: 'error',
          title: 'Error al recuperar información, inténtalo de nuevo.'
        });
      }
    );
  }

  approvedCandidateRejection() {
    this.spinner.show();
    if( this.rejectCandidateForm.valid ) {
      let data = {
        requisitionId: this.requisitionShown._id,
        candidateId: this.candidateToReject.candidateId,
        data: this.rejectCandidateForm.value
      };
      this.rejectCandidate.emit( data );
    } else {
      this.errorMessage = 'Debes describir los motivos.'
      this.spinner.hide();
    }
  }

  approveCandidateToHire() {
    this.spinner.show();
    if ( this.contractSignatureForm.valid ) {
      let dataForm = this.contractSignatureForm.value;
      let data = {
        requisitionId: this.requisitionShown._id,
        candidateId: this.candidateToApprove.candidateId,
        candidateName: this.candidateToApprove.candidateName,
        admission_date: moment(dataForm.admission_date,"DD/MM/YYYY").toISOString(),
        id_neixar: dataForm.id_neixar,
        receivers: this.receivers
      };
      
      this.approveCandidate.emit( data );
    } else {
      this.errorMessage = 'Ingresa los campos solicitados, por favor.'
      this.spinner.hide();
    }
  }

  closeVacancy() {
    this.spinner.show();
    let inProgressCandidates = this.requisitionShown.candidates
                                                   .filter( candidate => candidate.status === 'En proceso' )
                                                   .map( candidate => candidate.candidate );
    this.closeVacancyAction.emit( inProgressCandidates );
  }

  earlyCloseVacancy() {
    this.spinner.show();
    if ( this.rejectionComments.valid ) {
      let inProgressCandidates = this.requisitionShown.candidates
                                                   .filter( candidate => candidate.status === 'En proceso' )
                                                   .map( candidate => candidate.candidate );
      let data = {
        candidates: inProgressCandidates,
        rejection: this.rejectionComments.value
      };
      this.earlyCloseVacancyAction.emit( data );
    } else {
      this.errorMessage = 'Describe los motivos de cierre de la vacante.'
      this.spinner.hide();
    }
  }

}
