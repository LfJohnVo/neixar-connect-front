import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import {
  PositionService,
  EmployeeService,
  EmailService,
  ConfigService
} from "src/app/services/sevice.index";
import { Router, ActivatedRoute } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: "app-job-description",
  templateUrl: "./job-description.component.html",
  styles: []
})
export class JobDescriptionComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  actionType: string = "NVERSION";
  errorMessage: String;
  isHR: boolean = false;
  hrValidatorEmail: String = '';

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _positionService: PositionService,
    public _emailService: EmailService,
    public _configService: ConfigService,
    public activatedRouter: ActivatedRoute
  ) {
    //window.scrollTo(0,0);
    activatedRouter.params.subscribe(params => {
      if (params["id"]) {
        this.isHR = true;
      } else {
        this.isHR = false;
      }
    });
    this.getDataConfiguration();
  }

  ngOnInit() {}

  /*****************************************************
   ****** Esta función guarda la DP según sea el caso. *****
   ******************************************************/
  saveDescription(data) {
    this.spinner.show();
    
    if (data.actionType === "NVERSION") {
      if( this.isHR ) {
        data.data.status = 'Vigente';
        data.data.validatedRH = true;
      }
      this._positionService.saveJobDescription(data.positionId, data.data).subscribe(
          res => {
            this.spinner.hide();
            this.Toast.fire({
              type: 'success',
              title: 'Descripción de puesto registrada correctamente.'
            });
            !this.isHR ? this.sendMailNewJD(data) : this.router.navigateByUrl('/capital-humano/puestos');
          },
          err => {
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al registrar descripción de puesto.'
            });
          }
        );
    } else {
      this._positionService.savePosition(data.data).subscribe(
        res => {
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Descripción de puesto registrada correctamente.'
          });
          !this.isHR ? this.sendMailNewJD(data) : this.router.navigateByUrl('/capital-humano/puestos');
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

  }

  /***************************************************************************
   ****** Esta función envía la notificación al DT para que valide la nueva DP *****
   ***************************************************************************/
  sendMailNewJD( data ) {
     let position = data.positionName
     let subject = data.actionType === 'NVERSION' ? 'Descripción de Puesto (Nueva Versión)' : 'Descripción de Puesto (Puesto de Nueva Creación)';
    let body = {
      position: position,
      author: `${this._employeeService.user.p_information.name} ${this._employeeService.user.p_information.firstSurname}  ${this._employeeService.user.p_information.secondSurname}`,
      SUBJECT: subject,
      TO: this.hrValidatorEmail
    };
    this.spinner.show();
    this._emailService.newJobDescription(body).subscribe(
      res => {
        this.spinner.hide();
        this.isHR ? this.router.navigateByUrl('/capital-humano/puestos') : this.router.navigateByUrl('/perfil/contrataciones');
        this.Toast.fire({
          type: 'success',
          title: 'Capital Humano ha sido notificado para que apruebe la descripción de puesto.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.isHR ? this.router.navigateByUrl('/capital-humano/puestos') : this.router.navigateByUrl('/perfil/contrataciones');
        Swal.fire(
          'Lo sentimos',
          'No pudimos informar a Capital Humano que has registrado una descripción de puesto. Por favor hazle saber que has concluido tu registro.',
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
