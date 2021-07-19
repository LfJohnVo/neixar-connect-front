import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { CompetenciesService } from "src/app/services/sevice.index";
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-competency',
  templateUrl: './edit-competency.component.html',
  styles: []
})
export class EditCompetencyComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  competencyId: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _competenciesService: CompetenciesService,
    public activatedRouter: ActivatedRoute
  ) { 
    activatedRouter.params.subscribe( params => this.competencyId = params['id'] );
  }

  ngOnInit() {
  }

  editCompetency( data ) {
    this.spinner.show();
    this._competenciesService.updateCompetency( this.competencyId, data ).subscribe(
      res => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Competencia actualizada correctamente.'
        });
        this.router.navigateByUrl('/capital-humano/evaluaciones/competencias');
      }, err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al actualizar competencia, inténtalo de nuevo.'
        });
      });
  }

}
