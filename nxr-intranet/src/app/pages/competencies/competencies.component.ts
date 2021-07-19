import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { CompetenciesService, EmployeeService } from "src/app/services/sevice.index";
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-competencies',
  templateUrl: './competencies.component.html',
  styles: []
})
export class CompetenciesComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  competencies: any[] = [];
  competencyChosen: any;
  total: number;
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _competenciesService: CompetenciesService,
    public _employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.getAllCompetencies( 1 );
  }

  getAllCompetencies( page? ) {
    this.spinner.show();
    this._competenciesService.getAllCompetencies( page )
    .subscribe( res => {
      this.spinner.hide();
        this.competencies = res.data;
        this.total = res.total;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.pages = this._employeeService.getPages(res.totalPages, res.currentPage );
      }, err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al recuperar competencias.'
        });
        this.router.navigateByUrl('/capital-humano/evaluaciones');
      }
    );
  }

}
