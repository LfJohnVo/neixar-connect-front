import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RecruitmentService, EmployeeService } from 'src/app/services/sevice.index';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-closed-vacancies',
  templateUrl: './closed-vacancies.component.html',
  styles: []
})
export class ClosedVacanciesComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  user: any = this._employeeService.user;
  vacancies: any[] = [];  
  closedPageReq: number = 1;
  totalPagesReq: number = 1;
  total: number;
  pagesReq: number[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public _employeeService: EmployeeService,
    public router: Router,
    public _recruitmentService: RecruitmentService
  ) { 
    window.scrollTo(0,0);
    if(this.user.role === 'CH4') this.router.navigateByUrl('/capital-humano/reclutamiento');
  }

  ngOnInit() {
    this.getClosedRecruitments( 1 );
  }

  getClosedRecruitments( page ) {
    this.spinner.show();    
    this._recruitmentService.getClosedRecruitments( page).subscribe(
      res => {                
        this.vacancies = res.data;
        this.total = res.total;
        this.closedPageReq = res.currentPage;
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

}
