import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { EmployeeService, RecruitmentService, ConfigService, EmailService } from 'src/app/services/sevice.index';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-requisitions-to-validate',
  templateUrl: './requisitions-to-validate.component.html',
  styles: []
})
export class RequisitionsToValidateComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  requisitionShown: any;
  requisitionsToValidate: any[] = [];  
  currentPageReq: number = 1;
  totalPagesReq: number = 1;
  pagesReq: number[] = [];
  user: any = this._employeeService.user;  
  departmentValidator: string;
  allocators: string;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _recruitmentService: RecruitmentService,
    public _configService: ConfigService,
    public _emailService: EmailService
  ) { 
    //$('html,body').scrollTop(0);
    window.scrollTo(0,0);
  }

  ngOnInit() {
    this.getDataConfiguration();
  }

  getDataConfiguration( ) {
    this.spinner.show();
    this._configService.getDataConfiguration().subscribe(
      res => {
        this.getDepartmentValidatorAndAllocators( res[0].requisition );
        this.spinner.hide();
      },
      err => {
        this.informationNotRecovered();
      }
    );
  }

  getDepartmentValidatorAndAllocators( validators ) {
    this.allocators = validators.allocators.map( allocator => allocator.allocatorId.email).join(', ');

    if( validators.dfValidation._id == this.user._id )
      this.departmentValidator = 'daf';
    else if( validators.rhValidation._id == this.user._id )
      this.departmentValidator = 'dt';
    else if( validators.doValidation._id == this.user._id )
      this.departmentValidator = 'do';
    else
      this.departmentValidator = 'la';

    this.getRecruitmentsToValidate(1);
  }

  informationNotRecovered(){
    this.spinner.hide();
    this.router.navigateByUrl('/perfil/contrataciones');
    this.Toast.fire({
      type: 'error',
      title: 'Error al recuperar información, inténtalo de nuevo.'
    });
  }

  getRecruitmentsToValidate( page ) {
    this.spinner.show();    
    this._recruitmentService.getRecruitmentsToValidate( this.departmentValidator, this.user._id, page).subscribe(
      res => {        
        this.requisitionsToValidate = res.data;
        this.requisitionShown = res.data[0];
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

  getPersonnelRequisition( requisitionId ) {
    this.spinner.show();
    this._recruitmentService.getRequisition( requisitionId ).subscribe(
      res => {
        this.requisitionShown = res.data[0];
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  requisitionRejection( rejectionData ) {
    this.spinner.show();

    this._recruitmentService.requisitionRejection(  this.requisitionShown._id, rejectionData, this.departmentValidator ).subscribe(
      res => {
        $('#validateRequisitionModal').modal('hide');
        this.sendMailRejectRequisition();
        this.getRecruitmentsToValidate(1);
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Requisición de personal rechazada.'
        });
      },
      err => {
        $('#validateRequisitionModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al rechazar la requisición de personal, inténtalo de nuevo.'
        });
      }
    );
  
  }

  requisitionValidation() {
    this.spinner.show();
    let departmentValidator = this.departmentValidator;

    if( departmentValidator === 'dt' || departmentValidator === 'daf' ) {
      if( this.requisitionShown.area_leader && this.requisitionShown.area_leader.areaLeaderId === this.user._id ) 
      departmentValidator = this.departmentValidator + '2';
    } else if( departmentValidator === 'la' ) departmentValidator = 'do';
    
    let validatorName = { validatorName: `${this.user.p_information.name} ${this.user.p_information.firstSurname} ${this.user.p_information.secondSurname}` };

    this._recruitmentService.requisitionValidation( this.requisitionShown._id, departmentValidator, validatorName ).subscribe(
      res => {
        $('#validateRequisitionModal').modal('hide');
        if(res.recruitmentStatus === 'Aprobada') this.sendMailValidateRequisition();
        
        this.getRecruitmentsToValidate(1);
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Requisición de personal aprobada.'
        });
      },
      err => {
        $('#validateRequisitionModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al aprobar la requisición, inténtalo de nuevo.'
        });
      }
    );
  }

  sendMailRejectRequisition() {
    this.spinner.show();
    let position = this.requisitionShown.position.positionName;
    let petitionerEmail = this.requisitionShown.petitioner.petitionerId.email;
    let subject = 'Solicitud de Cambios - Requisición de Personal';
   let body = {
     position: position,
     SUBJECT: subject,
     TO: petitionerEmail
   };
  
   this._emailService.sendNotificationPersonnelRequisitionRejected(body).subscribe(
     res => {
       this.spinner.hide();
       this.Toast.fire({
        type: 'success',
        title: 'El colaborador ha sido notificado.'
      });
     },
     err => {
       this.spinner.hide();
       this.Toast.fire({
        type: 'error',
        title: 'No pudimos notificar al colaborador que has rechazado su requisición. Por favor hazle saber tu acción.'
      });
     }
   );
  }

  sendMailValidateRequisition() {
    this.spinner.show();
    let position = this.requisitionShown.position.positionName;
    let petitionerEmail = this.requisitionShown.petitioner.petitionerId.email;
    let subject = 'Requisición de personal aprobada';
   let body = {
     position: position,
     SUBJECT: subject,
     CC: petitionerEmail,
     TO: this.allocators
   };
  
   this._emailService.sendNotificationPersonnelRequisitionApproved(body).subscribe(
    res => {
      this.spinner.hide();
      this.Toast.fire({
       type: 'success',
       title: 'El personal de reclutamiento ha sido notificado.'
     });
    },
    err => {
      this.spinner.hide();
       console.log(err);
      this.Toast.fire({
       type: 'error',
       title: 'No pudimos notificar al personal de reclutamiento de la aprobación de la requisición. Por favor hazle saber tu acción.'
     });
    }
  );
  }

}
