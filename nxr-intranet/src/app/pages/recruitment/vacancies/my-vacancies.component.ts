import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { RecruitmentService, EmployeeService } from 'src/app/services/sevice.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-vacancies',
  templateUrl: './my-vacancies.component.html',
  styles: []
})
export class MyVacanciesComponent implements OnInit {
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
  pagesReq: number[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,    
    public _employeeService: EmployeeService,
    public _recruitmentService: RecruitmentService
  ) { 
    window.scrollTo(0,0);
    if(this.user.role != 'CH4') this.router.navigateByUrl('/capital-humano/reclutamiento');
  }

  ngOnInit() {
    this.recruitmentsByRecruiter(1);
  }

  recruitmentsByRecruiter( page ) {
    this.spinner.show();    
    this._recruitmentService.recruitmentsByRecruiter( this.user._id, page).subscribe(
      res => {        
        this.vacancies = res.data;
        this.currentPageReq = res.currentPage;
        this.totalPagesReq = res.totalPages;
        this.pagesReq = this._employeeService.getPages(res.totalPages, res.currentPage);
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
        this.informationNotRecovered();
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
