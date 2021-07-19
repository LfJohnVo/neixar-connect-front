import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { DepartmentsService, PositionService, EmployeeService, RecruitmentService, EmailService, ConfigService } from 'src/app/services/sevice.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-requisition',
  templateUrl: './requisition.component.html',
  styles: []
})
export class RequisitionComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  requisitionForm: FormGroup;
  errorMessage: String;
  departments: any[];
  positions: any[];
  hrValidator: any;
  doValidator: any;
  dfValidator: any;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _departmentService: DepartmentsService,
    public _positionService: PositionService,
    public _employeeService: EmployeeService,
    public _emailService: EmailService,
    public _recruitmentService: RecruitmentService,
    public _configService: ConfigService
  ) { 
    window.scrollTo(0,0);
    this.getDataConfiguration();
  }

  ngOnInit() {
  }

  getDataConfiguration( ) {
    this.spinner.show();
    this._configService.getDataConfiguration().subscribe(
      res => {
        this.spinner.hide();
        if( res[0].requisition ){
          this.hrValidator = res[0].requisition.rhValidation.email;
          this.doValidator = res[0].requisition.doValidation.email;
          this.dfValidator = res[0].requisition.dfValidation.email;
        } else this.configurationNotRecovered();
      },
      err => {
        this.configurationNotRecovered();
      }
    );
  }

  configurationNotRecovered(){
    this.spinner.hide();
    this.router.navigateByUrl('/perfil/contrataciones');
    this.Toast.fire({
      type: 'error',
      title: 'Error al recuperar información, inténtalo de nuevo.'
    });
  }

  saveRequisition(data) {
    this.spinner.show();

    if(data.area_leader) {
      this.doValidator = data.area_leader.areaLeaderEmail;
    }

    this._recruitmentService.saveRequisition(data).subscribe(
      res => {
        this.spinner.hide();
        this.router.navigateByUrl('/perfil/contrataciones');
        this.Toast.fire({
          type: 'success',
          title: 'Requisición de personal registrada correctamente.'
        });
        this.sendNotificationNewPersonnelRequisition(data);
      }, err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al registrar la requisición de personal.'
        });
      }
    );
  }

  sendNotificationNewPersonnelRequisition( data ) {
    let position = data.position.positionName;
    let subject = 'Nueva Requisición de Personal';
   let body = {
     position: position,
     SUBJECT: subject,
     TO: `${this.hrValidator}, ${this.doValidator}, ${this.dfValidator}`
   };
   this.spinner.show();
   this._emailService.sendNotificationNewPersonnelRequisition(body).subscribe(
     res => {
       this.spinner.hide();
       this.router.navigateByUrl('/perfil/contrataciones');
       this.Toast.fire({
         type: 'success',
         title: 'Se ha sido notificado a las direcciones correspondientes para la aprobación de esta requisición de personal.'
       });
     },
     err => {
       this.errorMessage = err.error.message;
       this.spinner.hide();
       this.router.navigateByUrl('/perfil/contrataciones');
       Swal.fire(
         'Lo sentimos',
         'No pudimos informar a  Gerencia de Capital Humano, Dirección de Administración y Finanzas y Dirección de Operaciones o Líder de práctica que has registrado una requisición de personal Por favor hazles saber que has concluido tu registro.',
         'warning'
       );
     });
    }
}
