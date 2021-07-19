import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ConfigService, RecruitmentService, EmailService, EmployeeService } from 'src/app/services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GLOBAL } from '../../config';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-recruitment',
  templateUrl: './recruitment.component.html',
  styles: []
})
export class RecruitmentComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  user: any = this._employeeService.user;
  isRecruiter: boolean = false;
  assignmentForm: FormGroup;
  configForm: FormGroup;
  receivers: FormArray;
  idConfigRegister: any;
  employees: any[];
  recruiters: any[] = [];
  selectedRecruiter: any;
  selectedRequisition: any;
  requisitionsToAssign: any[] = [];  
  currentPageReq: number = 1;
  totalPagesReq: number = 1;
  pagesReq: number[] = [];
  errorMessage: string;
  doughnutChartLabels:string[] = ["Reclutador 1", "Reclutador 2"];
  doughnutChartData:number[] = [0, 0];
  chartColors:Array<any> = [ 
    { 
      backgroundColor: ['rgba(12,32,79,1)', 'rgba(175,196,63,1)', 'rgba(255,197,0,1)', 'rgba(224,1,18,1)', 'rgba(134,134,134,1)', 'rgba(255,120,0,1)'],
      hoverBackgroundColor: ['rgba(12,32,79,.6)',  'rgba(175,196,63,.6)', 'rgba(255,197,0,.6)', 'rgba(224,1,18,.6)', 'rgba(134,134,14,.6)', 'rgba(255,120,0,.6)']
    }
  ];
  generalCounters: any = {
    current: 0,
    expired: 0,
    covered: 0,
    closed: 0,
    month: GLOBAL.months[moment().month()]
  };
  recruiterCounters: any = {
    current: 0,
    expired: 0,
    covered: 0
  };

  constructor( 
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public router: Router,
    public _configService: ConfigService,
    public _employeeService: EmployeeService,
    public _recruitmentService: RecruitmentService,
    public _emailService: EmailService
    ) { 
      window.scrollTo(0,0);
      this.isRecruiter = this.user.role === 'CH4' ? true : false;
    }

  ngOnInit() {
    this.configForm = new FormGroup({
      receivers:  this.fb.array([ this.createReceiver() ])
    });
    this.assignmentForm = new FormGroup({
      recruiter: new FormControl("", Validators.required)
    });
    if(!this.isRecruiter) {
      this.getDataConfiguration();
      this.getRecruitmentsToBeAssigned(1);
    }
    this.getRecruitmentDashboardInfo(this.user._id);
  }

  getRecruitmentDashboardInfo( userId? ) {
    this.spinner.show();    
    this._recruitmentService.getRecruitmentDashboardInfo( userId).subscribe(
      res => {        
        this.getGeneralCounters( res.all );
        this.getRecruiterCounters( res.recruiter );
        this.getDoughnutChatInfo( res.assignments );        
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  getDoughnutChatInfo( data ) {
    this.doughnutChartLabels.length = 0;
    this.doughnutChartData.length = 0;

    let labels = data.map( recruiter => `${recruiter.recruiter.p_information.name} ${recruiter.recruiter.p_information.firstSurname}`);
    this.doughnutChartData = data.map( counter => counter.counter );

    this.doughnutChartLabels.push(...labels);
  }

  getGeneralCounters( generalVancancies ) {
    generalVancancies.map( type => {
      if(type._id === 'En proceso') this.generalCounters.current = type.counter;
      else if(type._id === 'Cubierta') this.generalCounters.covered = type.counter;
      else if(type._id === 'Vencida') this.generalCounters.expired = type.counter;
      else if(type._id === 'Cerrada') this.generalCounters.closed = type.counter;
    });
  }

  getRecruiterCounters( recruiterVacancies) {
    recruiterVacancies.map( type => {
      if(type._id === 'En proceso') this.recruiterCounters.current = type.counter;
      else if(type._id === 'Cubierta') this.recruiterCounters.covered = type.counter;
      else if(type._id === 'Vencida') this.recruiterCounters.expired = type.counter;
    });
  }

  getDataConfiguration( ) {
    this.spinner.show();
    this._configService.getDataConfiguration().subscribe(
      res => {
        this.idConfigRegister = res[0]._id;
        this.recruiters = res[0].requisition.recruiters.map( recruiter => recruiter.recruiterId);
        this.spinner.hide();
      },
      err => {
        this.informationNotRecovered();
      }
    );
  }

  informationNotRecovered(){
    this.spinner.hide();
    this.router.navigateByUrl('capital-humano');
    this.Toast.fire({
      type: 'error',
      title: 'Error al recuperar información, inténtalo de nuevo.'
    });
  }

  getSelectedRecruiter( idRecruiter ) {
    this.selectedRecruiter = this.recruiters.filter( recruiter => recruiter._id == idRecruiter)[0];
  }

  getRecruitmentsToBeAssigned( page ) { 
    this.spinner.show();    
    this._recruitmentService.getRecruitmentsToBeAssigned( page).subscribe(
      res => {        
        let requisitionToAssign = res.data.map( requisition => {
          return {
            _id: requisition._id,
            position: requisition.position
          }
        });
        this.requisitionsToAssign = requisitionToAssign;
        this.selectedRequisition = requisitionToAssign[0];
        this.currentPageReq = res.currentPage;
        this.totalPagesReq = res.totalPages;
        this.pagesReq = this._employeeService.getPages(res.totalPages, res.currentPage);
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  selectRequisition( requisition ) {
    this.selectedRequisition = requisition;
    this.errorMessage = "";
    this.assignmentForm.patchValue({
      recruiter: ''
    });
  }

  assignRequisition( ){
    this.spinner.show();
    if( this.assignmentForm.valid ){
      let payload = this.assignmentForm.value;
      payload.allocatorName = `${this.user.p_information.name} ${this.user.p_information.firstSurname} ${this.user.p_information.secondSurname}`

      if (this.selectedRequisition.position.positionType === "Estratégico") payload.deadline = moment().add(35, 'days').toISOString();
      else if (this.selectedRequisition.position.positionType === "Táctico") payload.deadline = moment().add(19, 'days').toISOString();
      else if (this.selectedRequisition.position.positionType === "Operativo") payload.deadline = moment().add(14, 'days').toISOString();

      this._recruitmentService.assignRequisition(this.selectedRequisition._id, payload).subscribe(
            res => {
              $("#requisitionAssignmentModal").modal("hide");
              this.getRecruitmentDashboardInfo(this.user._id);
              this.sendNotificationRequisitionAssigned();
              this.getRecruitmentsToBeAssigned(1);
              this.Toast.fire({
                type: 'success',
                title: 'Requisición de personal asignada correctamente.'
              });
              
            },
            err => {
              this.errorMessage = err.error.message;
              this.spinner.hide();
              this.Toast.fire({
                type: 'error',
                title: 'Error al asignar la requisición de personal.'
              });
            }
          );

    } else {
        this.spinner.hide();
        this.errorMessage = "Información incompleta, todos los campos obligatorios deben estar llenos.";
    }
  }

  sendNotificationRequisitionAssigned() {
    let position = this.selectedRequisition.position.positionName;
    let recruiterEmail = this.selectedRecruiter.email;
    let subject = 'Requisición de Personal Asignada';
   let body = {
     position: position,
     SUBJECT: subject,
     TO: recruiterEmail
   };
  
   this._emailService.sendNotificationRequisitionAssigned(body).subscribe(
     res => {
       this.spinner.hide();
       this.Toast.fire({
        type: 'success',
        title: 'El reclutador ha sido notificado.'
      });
     },
     err => {
       this.spinner.hide();
       this.Toast.fire({
        type: 'error',
        title: 'No pudimos notificar al reclutador que le has asignado una requisición. Por favor hazle saber tu acción.'
      });
     }
   );
  }

  seeVacancies( vacancyType ) {
    switch (vacancyType) {
      case 'current':
        this.router.navigateByUrl('/capital-humano/reclutamiento/vacantes-vigentes');
        break;
    
      case 'expired':
        this.router.navigateByUrl('/capital-humano/reclutamiento/vacantes-vencidas');
        break;

      case 'completed':
        this.router.navigateByUrl('/capital-humano/reclutamiento/vacantes-cubiertas');
        break;

        case 'closed':
          this.router.navigateByUrl('/capital-humano/reclutamiento/vacantes-cerradas');
          break;

      default:
        break;
    }
  }

  createReceiver(): FormGroup {
    return this.fb.group({
      receiver: ["", Validators.required],
      receiverEmail: ["", Validators.required]
    });
  }

  addReceiver() {
    this.receivers = this.configForm.get("receivers") as FormArray;
    this.receivers.push(this.createReceiver());
  }

  deleteReceiver(index) {
    this.receivers = this.configForm.get("receivers") as FormArray;
    this.receivers.removeAt(index);
  }

  setEmailReceiver( receiverId, index ) {
    this.receivers = this.configForm.get("receivers") as FormArray;
    let selectedPerson = this.employees.find(person => person._id === receiverId);
    this.receivers.at(index).patchValue({
      receiverEmail: `${selectedPerson.email}`
    });
  }

  getConfig() {
    let servicesToConsume = [
      this._employeeService.getEmployeesbyStatus('ACTIVO'),
      this._configService.getDataConfiguration()
    ];

    forkJoin( servicesToConsume ).subscribe( 
      responses => {
      this.employees = responses[0].data;
      let receivers = this.configForm.get("receivers") as FormArray;
      while (receivers.length > 0) receivers.removeAt(0);
        
        if(responses[1][0].receivers.length>0) {
          responses[1][0].receivers.forEach(receiver => {
            receivers.push(
              this.fb.group({
                receiver: [receiver.receiver, Validators.required],
                receiverEmail: [receiver.receiverEmail, Validators.required]
              })
            );
          });
        } else this.addReceiver();
      this.spinner.hide();
      $("#configModal").modal('show');
      }, err => {
      this.spinner.hide();
    });
  }

  saveReceivers() {
      this.spinner.show();
        if(this.configForm.valid) {
          this._configService.updateDataConfiguration(this.idConfigRegister, this.configForm.value).subscribe(
            res => {
              this.Toast.fire({
                type: 'success',
                title: 'Configuración actualizada.'
              });
              $("#configModal").modal('hide');
            },
            err => {
              this.Toast.fire({
                type: 'error',
                title: 'Error al actualizar la configuración.'
              });
            }
          );
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Información incompleta, todos los campos deben estar llenos.'
          });
        }
  }

}
