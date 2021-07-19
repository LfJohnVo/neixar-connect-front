import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PositionService, EmployeeService, EmailService, ConfigService } from '../../services/sevice.index';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-job-description',
  templateUrl: './edit-job-description.component.html',
  styles: []
})
export class EditJobDescriptionComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });

  constructor(
    private spinner: NgxSpinnerService,
    public _positionService: PositionService,
     public _employeeService: EmployeeService,
     public _emailService: EmailService,
     public _configService: ConfigService,
     public router: Router
  ) { 
    this.getDataConfiguration();
  }

  ngOnInit() {
  }
  hrValidatorEmail: string;

    /*****************************************************
   ****** Esta función guarda la DP según sea el caso. *****
   ******************************************************/
  editDescription(data) {
    this.spinner.show();

    this._positionService.updateJobDescription(data.jobDescId, data).subscribe(
      res => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Descripción de puesto actualizada.'
        });
        this.sendMailNewJD(data.positionName)
      },
      err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al registrar descripción de puesto.'
        });
      }
    );
  }

  /*********************************************************************************
   ****** Esta función envía la notificación al DT para que valide la edición de la  DP *****
   **********************************************************************************/
  sendMailNewJD( position ) {
    let subject = 'Actualización de Descripción de Puesto';
   let body = {
     position: position,
     author: `${this._employeeService.user.p_information.name} ${this._employeeService.user.p_information.firstSurname}  ${this._employeeService.user.p_information.secondSurname}`,
     SUBJECT: subject,
     TO: this.hrValidatorEmail
   };
   this.spinner.show();
   this._emailService.editJobDescription(body).subscribe(
     res => {
       this.router.navigateByUrl(`/perfil/contrataciones`);
       this.spinner.hide();
       this.Toast.fire({
        type: 'success',
        title: 'Capital Humano ha sido notificado de la modificación a la descripción de puesto.'
      });
     },
     err => {
       this.router.navigateByUrl(`/perfil/contrataciones`);
       this.spinner.hide();
       Swal.fire(
        'Lo sentimos',
        'No pudimos informar a Capital Humano que has modificado la descripción de puesto. Por favor hazle saber que has concluido tu registro.',
        'warning'
      );
     }
   );
 }

 getDataConfiguration( ) {
  this.spinner.show();
  this._configService.getDataConfiguration().subscribe(
    res => {
      this.hrValidatorEmail = res[0].jobDescription.rhValidation.email ? res[0].jobDescription.rhValidation.email : this.informationNotRecovered();
      this.spinner.hide();
    },
    err => {
      this.informationNotRecovered();
    }
  );
}

informationNotRecovered(){
  this.spinner.hide();
  this.router.navigateByUrl('/perfil/contrataciones');
  this.Toast.fire({
    type: 'error',
    title: 'Error al recuperar información, inténtalo de nuevo.'
  });
}

}
