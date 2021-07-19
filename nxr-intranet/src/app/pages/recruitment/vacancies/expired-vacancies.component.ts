import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RecruitmentService, EmployeeService, EmailService } from 'src/app/services/sevice.index';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-expired-vacancies',
  templateUrl: './expired-vacancies.component.html',
  styles: []
})
export class ExpiredVacanciesComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  user: any = this._employeeService.user;
  vacancies: any[] = [];  
  currentPageReq: number = 1;
  totalPagesReq: number = 1;
  total: number;
  pagesReq: number[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public _employeeService: EmployeeService,
    public _emailService: EmailService,
    public router: Router,
    public _recruitmentService: RecruitmentService
  ) { 
    window.scrollTo(0,0);
    if(this.user.role === 'CH4') this.router.navigateByUrl('/capital-humano/reclutamiento');
  }

  ngOnInit() {
    this.getExpiredRecruitments(1);
  }

  getExpiredRecruitments( page ) {
    this.spinner.show();    
    this._recruitmentService.getExpiredRecruitments( 'ALL', page).subscribe(
      res => {        
        this.vacancies = res.data;
        this.total = res.total;
        this.currentPageReq = res.currentPage;
        this.totalPagesReq = res.totalPages;
        this.pagesReq = this._employeeService.getPages(res.totalPages, res.currentPage);
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
        this.informationNotRecovered
      }
    );
  }

  informationNotRecovered(){
    this.spinner.hide();
    this.router.navigateByUrl('/capital-humano/reclutamiento');
    this.Toast.fire({
      type: 'error',
      title: 'Error al recuperar información, inténtalo de nuevo.'
    });
  }

  assignRequisition( data ){
    this._recruitmentService.reassignRequisition(data.positionId, data.payload).subscribe(
          res => {
            $("#requisitionAssignmentModal").modal("hide");
            this.sendNotificationRequisitionAssigned( data );
            this.getExpiredRecruitments(1);
            this.Toast.fire({
              type: 'success',
              title: 'Requisición de personal asignada correctamente.'
            });
            this.spinner.hide();
          },
          err => {
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al asignar la requisición de personal.'
            });
          }
        );
}

sendNotificationRequisitionAssigned( data ) {
  let subject = 'Requisición de Personal Asignada';
  let body = {
   position: data.positionName,
   SUBJECT: subject,
   TO: data.recruiterEmail
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

}
