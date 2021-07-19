import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { CompetenciesService } from "src/app/services/sevice.index";
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-competency',
  templateUrl: './new-competency.component.html',
  styles: []
})
export class NewCompetencyComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _competenciesService: CompetenciesService
  ) { }

  ngOnInit() {
  }

  saveCompetency( data ) {

    this.spinner.show();
    this._competenciesService.saveCompetency( data ).subscribe(
      res => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Competencia registrada correctamente.'
        });
        this.router.navigateByUrl('/capital-humano/evaluaciones/competencias');
      }, err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al registrar competencia.'
        });
      }
    );

  }

}
