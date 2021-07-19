import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecruitmentService, EmailService, ConfigService } from 'src/app/services/sevice.index';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-edit-requisition',
  templateUrl: './edit-requisition.component.html',
  styles: []
})
export class EditRequisitionComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  requisitionId: string;
  hrValidator: any;
  doValidator: any;
  dfValidator: any;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
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

  editRequisition(data) {
    this.spinner.show();

    if(data.area_leader) {
      this.doValidator = data.area_leader.areaLeaderEmail;
    }

    this._recruitmentService.updateRequisition(data._id, data).subscribe(
      res => {
        this.spinner.hide();
        this.router.navigateByUrl('/perfil/contrataciones');
        this.Toast.fire({
          type: 'success',
          title: 'Requisición de personal actualizada correctamente.'
        });        
        this.sendNotificationEditPersonnelRequisition(data);
      }, err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al actualizar la requisición de personal.'
        });
      }
    );
  }

  sendNotificationEditPersonnelRequisition( data ) {
    let position = data.position.positionName;
    let subject = 'Actualización de requisición de personal';
   let body = {
     position: position,
     SUBJECT: subject,
     TO: `${this.hrValidator}, ${this.doValidator}, ${this.dfValidator}`
   };
   this.spinner.show();
   this._emailService.sendNotificationEditPersonnelRequisition(body).subscribe(
     res => {
       this.spinner.hide();
       this.router.navigateByUrl('/perfil/contrataciones');
       this.Toast.fire({
         type: 'success',
         title: 'Se ha sido notificado a las direcciones correspondientes para la aprobación de esta requisición de personal.'
       });
     },
     err => {
       this.spinner.hide();
       this.router.navigateByUrl('/perfil/contrataciones');
       console.log(err);
       Swal.fire(
         'Lo sentimos',
         'No pudimos informar a  Gerencia de Capital Humano, Dirección de Administración y Finanzas y Dirección de Operaciones o Líder de práctica que has modificado la requisición de personal. Por favor hazles saber que has concluido la actualización.',
         'warning'
       );
     });
    }

}
