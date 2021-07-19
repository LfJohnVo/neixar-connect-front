import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  RecruitmentService,
  EmailService,
  PositionService,
  CandidatesService
} from "src/app/services/sevice.index";
import Swal from "sweetalert2";
import { NgxSpinnerService } from "ngx-spinner";
import { FormControl, Validators } from "@angular/forms";
import * as moment from "moment";
declare var $: any;

@Component({
  selector: "app-vacancy-info",
  templateUrl: "./vacancy-info.component.html",
  styles: []
})
export class VacancyInfoComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000
  });
  isRecruiter: boolean = false;
  requisitionShown: any;
  requisitionId: String;
  position: any;
  jobDescription: any;
  candidateSelect: FormControl;
  candidates: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRouter: ActivatedRoute,
    public _emailService: EmailService,
    public _recruitmentService: RecruitmentService,
    public _positionService: PositionService,
    public _candidatesService: CandidatesService
  ) {
    window.scrollTo(0, 0);
    this.isRecruiter = this.router.url.includes("mis-vacantes");
    activatedRouter.params.subscribe(params => {
      if (params["id"]) {
        this.requisitionId = params["id"];
        this.getPersonnelRequisition(this.requisitionId);
      }
    });
  }

  ngOnInit() {
    this.candidateSelect = new FormControl("", Validators.required);
  }

  getPersonnelRequisition(requisitionId) {
    this.spinner.show();
    this._recruitmentService.getRequisition(requisitionId).subscribe(
      res => {
        this.requisitionShown = res.data[0];
        let approvedCandidates = this.requisitionShown.candidates.filter( candidate => (candidate.status === 'Aprobado' && candidate.stage=== "Firma de Contrato") ).length;
        this.requisitionShown.closeVacancy = this.requisitionShown.vacancies === approvedCandidates ? true : false;
        this.getJobDescription(
          this.requisitionShown.job_description.job_descriptionId
        );
        this.getCandidates();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getJobDescription(id) {
    this.spinner.show();
    this._positionService.getJobDescription(id).subscribe(
      res => {
        this.position = res.data[0];
        this.getPositionLevel(res.data[0].career_key || "Default");
        this.jobDescription = res.data[0].jobDescription[0];
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getPositionLevel(key) {
    switch (key) {
      case "E1":
        this.position.career_key = "E1 - Director General";
        break;

      case "E2":
        this.position.career_key = "E2 - Director";
        break;

      case "M2":
        this.position.career_key = "M2 - Gerente II";
        break;

      case "M1":
        this.position.career_key = "M1 - Gerente I";
        break;

      case "P5":
        this.position.career_key = "P5 - Líder";
        break;

      case "P4":
        this.position.career_key = "P4 - Senior";
        break;

      case "P3":
        this.position.career_key = "P3 - Especialista";
        break;

      case "P2":
        this.position.career_key = "P2 - Profesional";
        break;

      case "P1":
        this.position.career_key = "P1 - Junior";
        break;

      case "P0":
        this.position.career_key = "P0 - Aprendiz";
        break;

      case "S3":
        this.position.career_key = "S3 - Especialista";
        break;

      case "S2":
        this.position.career_key = "S2 - Profesional";
        break;

      case "S1":
        this.position.career_key = "S1 - Junior";
        break;

      default:
        this.position.career_key = "Nivel de carrera no asignado";
        break;
    }
  }

  getCandidates() {
    this.spinner.show();

    this._candidatesService.getCandidatesToAssign().subscribe(
      res => {
        this.spinner.hide();
        this.candidates = res.data;
      },
      err => {
        this.configurationNotRecovered();
      }
    );
  }

  configurationNotRecovered() {
    this.spinner.hide();
    this.router.navigateByUrl("/capital-humano/mis-vacantes");
    this.Toast.fire({
      type: "error",
      title: "Error al recuperar información, inténtalo de nuevo."
    });
  }

  assignCandidate() {
    this.spinner.show();
    if (this.candidateSelect.valid) {
      let candidate = { candidate: this.candidateSelect.value };

      this._recruitmentService
        .assignCandidate(this.requisitionId, candidate)
        .subscribe(
          res => {
            this.spinner.hide();
            this.Toast.fire({
              type: "success",
              title: "Candidato apostulado correctamente."
            });
            $("#AssignCandidateModal").modal("hide");
            this.getPersonnelRequisition(this.requisitionId);
            this.getCandidates();
          },
          err => {
            this.spinner.hide();
            this.Toast.fire({
              type: "error",
              title: "Error al postular candidato, inténtalo de nuevo."
            });
          }
        );
    }
    this.spinner.hide();
  }

  saveComments( data ) {
    this._recruitmentService.storeEvaluationsOfCandidate(data.id, data.comments).subscribe(
      res => {
        this.spinner.hide();
        $("#candidateReportModal").modal("hide");
        this.Toast.fire({
          type: "success",
          title: "El candidato ha sido asignado a la siguiente etapa."
        });
        this.getPersonnelRequisition(this.requisitionId);
      },
      err => {
        this.Toast.fire({
          type: "error",
          title: "Error al registrar comentarios, inténtalo de nuevo."
        });
        this.spinner.hide();
      }
    );
  }

  rejectCandidate( data ) {
    this._candidatesService.candidateRejection(data.requisitionId, data.candidateId, data.data)
      .subscribe(
        res => {
          $('#rejectCandidateModal').modal('hide');
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'El candidato ha sido descartado.'
          });
          this.getPersonnelRequisition(data.requisitionId);
        },
        err => {
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: err.error.message
          });
        }
      );
  }

  approveCandidate( data ) {
    let payload: any = {
      admission_date: data.admission_date,
      id_neixar: data.id_neixar
    };
    
    this._candidatesService.candidateApproval(data.requisitionId, data.candidateId, payload)
      .subscribe(
        res => {
          $('#approveCandidateModal').modal('hide');
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'El candidato ha sido aprobado para su contratación.'
          });
          this.sendMailNewEmployee( data );
          this.getPersonnelRequisition(data.requisitionId);
        },
        err => {
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: err.error.message
          });
        });
  }

  closeVacancy( candidates ) {
    this._recruitmentService.closeVacant( this.requisitionShown._id,  candidates ).subscribe(
        res => {
          $('#closeVacancyModal').modal('hide');
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'La vacante ha sido cubierta.'
          });
          this.getPersonnelRequisition(this.requisitionShown._id);
        },
        err => {
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: err.error.message
          });
        });
  }

  earlyCloseVacancy( data ) {
    this._recruitmentService.earlyCloseVacant( this.requisitionShown._id,  data ).subscribe(
        res => {
          $('#earlyCloseVacancyModal').modal('hide');
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'La vacante ha sido cerrada.'
          });
          this.sendMailVacancyClosed( data.rejection );
          this.getPersonnelRequisition(this.requisitionShown._id);
        },
        err => {
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: err.error.message
          });
        });
  }

    sendMailNewEmployee( data ) {
      let to = data.receivers;
      let petitionerEmail = this.requisitionShown.petitioner.petitionerId.email;
      let recruiterEmail = this.requisitionShown.recruiter.email;
      to = [...to, petitionerEmail];
      let body: any = {
        position: this.requisitionShown.position.positionName,
        id_neixar: data.id_neixar,
        candidateName: data.candidateName,
        department: this.requisitionShown.petitioner.petitionerDepartment,
        admission_date: moment(data.admission_date).format('DD/MM/YYYY'),
        immediateBoss: this.requisitionShown.petitioner.petitionerName,
        SUBJECT: 'Nuevo Ingreso',
        TO: to.join(),
        CC: recruiterEmail
      };
      
      this.spinner.show();
      this._emailService.sendMailNewEmployee(body).subscribe(
        res => {
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Se ha enviado la notificación de nuevo ingreso'
          });
        },
        err => {
          this.spinner.hide();
          Swal.fire(
            'Lo sentimos',
            'No pudimos notificar el nuevo ingreso.',
            'warning'
          );
        });
       }

       sendMailVacancyClosed( comments ) {
        let body = {
          position: this.requisitionShown.position.positionName,
          justification: comments,
          SUBJECT: 'Vacante Cerrada',
          TO: this.requisitionShown.petitioner.petitionerId.email
        };
        
        this.spinner.show();
        this._emailService.sendMailRequisitionClosed(body).subscribe(
          res => {
            this.spinner.hide();
            this.Toast.fire({
              type: 'success',
              title: 'Se ha notificado al solicitante.'
            });
          },
          err => {
            this.spinner.hide();
            Swal.fire(
              'Lo sentimos',
              'No pudimos notificar al solicitante de la accion.',
              'warning'
            );
          });
         }

}