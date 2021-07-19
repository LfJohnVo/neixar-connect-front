import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ConfigService, EmployeeService } from 'src/app/services/sevice.index';
declare var $: any;

@Component({
  selector: 'app-vacancies-list',
  templateUrl: './vacancies-list.component.html',
  styles: []
})
export class VacanciesListComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  @Input() vacancies: any[];
  @Input() type: String;
  @Input() currentPage: number;
  @Output() assignRecruiter: EventEmitter<any> = new EventEmitter();
  reassignAllowed: boolean = false;
  recruiters: any[] = [];
  selectedVacancy: any;
  assignmentForm: FormGroup;
  selectedRecruiter: any;
  errorMessage: string;
  user: any = this._employeeService.user;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _configService: ConfigService,
    public _employeeService: EmployeeService
  ) { 
    if( this.router.url.indexOf('/vacantes-vigentes') > -1 || this.router.url.indexOf('/vacantes-vencidas') > -1 || this.router.url.indexOf('/asignaciones') > -1 ) this.reassignAllowed = true;
  }
  
  ngOnInit() {
    this.assignmentForm = new FormGroup({
      recruiter: new FormControl("", Validators.required)
    });
  }

  getDataConfiguration( vacancy ) {
    this.selectedVacancy = vacancy;
    this.spinner.show();
    this._configService.getDataConfiguration().subscribe(
      res => {
        this.assignmentForm.patchValue({
          recruiter: ''
        });
        this.errorMessage = '';
        this.recruiters = res[0].requisition.recruiters.map( recruiter => recruiter.recruiterId);
        $("#requisitionAssignmentModal").modal("show");
        this.spinner.hide();
      },
      err => {
        this.Toast.fire({
          type: 'error',
          title: 'Error al recuperar información, inténtalo de nuevo.'
        });
      }
    );
  }

  getSelectedRecruiter( idRecruiter ) {
    this.selectedRecruiter = this.recruiters.filter( recruiter => recruiter._id == idRecruiter)[0];
  }
  
  assignRequisition( ){
    this.spinner.show();
    if( this.assignmentForm.valid ){
      
      if( this.selectedVacancy.recruiter._id != this.selectedRecruiter._id ) {
        let payload: any = {
          positionId: this.selectedVacancy._id,
          positionName: this.selectedVacancy.position.positionName,
          recruiterEmail: this.selectedRecruiter.email
        };
        payload.payload = this.assignmentForm.value;
        payload.allocatorName = `${this.user.p_information.name} ${this.user.p_information.firstSurname} ${this.user.p_information.secondSurname}`;
  
        this.assignRecruiter.emit( payload );
      } else {
        this.spinner.hide();
      this.errorMessage = "El reclutador actualmete ya está asignado a esta requisición.";  
      }
    } else {
      this.spinner.hide();
      this.errorMessage = "Información incompleta, todos los campos obligatorios deben estar llenos.";
    }
}

}