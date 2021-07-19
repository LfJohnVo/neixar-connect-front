import { Component, OnInit, } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PositionService, EmailService, EmployeeService } from '../../services/sevice.index';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-position-info',
  templateUrl: './position-info.component.html',
  styles: []
})
export class PositionInfoComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  id: string;
  position: any;
  jobDescription: any; 
  versions: any[];
  role: string;
  toValidate:boolean = false;
  reject: boolean = false;
  rejectForm: FormGroup;
  positionForm: FormGroup;
  errorMessage: String = '';

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRouter: ActivatedRoute,
    public _employeeService: EmployeeService,
    public _positionService: PositionService,
    public _emailService: EmailService
  ) { 
    // Obtenemos el ID concatenado a la URL
    activatedRouter.params.subscribe( params => {
      this.id = params['id'];

      // Determinanos si se accede como solicitante, validador o RRHH
      if( this.router.url.indexOf('/descripcion') > -1 ) { // Solicitante
        this.role = 'petitioner';
        this.getJobDescription( this.id );
      } else { // RRHH
        this.role = 'hr';
        if( this.router.url.indexOf('/validar-descripcion') > -1 ) {
          this.getJobDescription( this.id );
          this.toValidate = true;
        } else {
          this.getPosition();
          this.toValidate= false;
        }
      }

    });

  }

  ngOnInit() {
    this.positionForm = new FormGroup({
      job_key: new FormControl('', Validators.required),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      career_key: new FormControl('', Validators.required),
      specialty: new FormControl('', Validators.required),      
      salary: new FormControl('', Validators.required)
    });
    this.rejectForm = new FormGroup({
      actionType: new FormControl('V', Validators.required)
    });
  }

/**********************************************************
  ****** Esta función permite obtener la DP seleccionada *****
  *********************************************************/
 getJobDescription( id ) {
    this.spinner.show();
    this._positionService.getJobDescription( id ).subscribe(
      res => {        
        this.position = res.data[0];
        this.getPositionLevel( res.data[0].career_key || 'Default' );
        this.jobDescription = res.data[0].jobDescription[0];
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }
  
/*************************************************************
 ****** Esta función obtiene los datos del puesto solicitado. *****
 *************************************************************/
  getPosition( ) {
    this.spinner.show();
    this._positionService.getPosition( this.id ).subscribe(
      res => {
        this.position = res.data;
        this.jobDescription =  res.data.jobDescription.length > 0 ? res.data.jobDescription[res.data.jobDescription.length-1] : null;
        this.getPositionLevel( res.data.career_key || 'Default' );
        this.getVerisions( res.data.jobDescription );
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

/**************************************************************
 ****** Esta función obtiene el nombre de la clave de carrera. *****
 **************************************************************/
  getPositionLevel( key ) {
    switch (key) {
      case 'E1':
        this.position.career_key = 'E1 - Director General';
        break;
      
      case 'E2':
        this.position.career_key = 'E2 - Director';
        break;
      
      case 'M2':
        this.position.career_key = 'M2 - Gerente II';
        break;

      case 'M1':
        this.position.career_key = 'M1 - Gerente I';
        break;
      
      case 'P5':
        this.position.career_key = 'P5 - Líder';
        break;

      case 'P4':
        this.position.career_key = 'P4 - Senior';
        break;

      case 'P3':
        this.position.career_key = 'P3 - Especialista';
        break;

      case 'P2':
        this.position.career_key = 'P2 - Profesional';
        break;
      
      case 'P1':
        this.position.career_key = 'P1 - Junior';
        break;

      case 'P0':
        this.position.career_key = 'P0 - Aprendiz';
        break;

      case 'S3':
        this.position.career_key = 'S3 - Especialista';
        break;

      case 'S2':
        this.position.career_key = 'S2 - Profesional';
        break;
      
      case 'S1':
        this.position.career_key = 'S1 - Junior';
        break;
    
      default:
      this.position.career_key = 'Nivel de carrera no asignado'
        break;
    }
  }

/****************************************************************
 ****** Esta función construye el arreglo de versiones de la DP. *****
 ****************************************************************/
  getVerisions( jobDescriptions ) {
    if( jobDescriptions.length > 0 )
      this.versions = jobDescriptions.map( v => { return { "_id": v._id, "name": v.version } });
    else 
      this.versions = [];
  }

  /***********************************************
    ****** VALIDACIONES SEGÚN TIPO DE ACCIÓN *****
    ***********************************************/
   checkType( type ) {

    if( type === 'R' ) {
      this.reject=true;
      this.rejectForm.addControl('rejectionComments', new FormControl('', Validators.required));  
    } else {
      this.reject=false;
      this.rejectForm.removeControl('rejectionComments');
    }
  this.errorMessage = '';

  }

  setFormData() {
    let career_key = this.position.career_key === 'Nivel de carrera no asignado' ? '' : this.position.career_key;
    this.positionForm.patchValue({
      job_key: this.position.job_key || '',
      name: this.position.name.toUpperCase(),
      career_key: career_key || '',
      specialty: this.position.specialty || '',
      salary: this.position.salary || ''
    });
    this.errorMessage = '';
    $('#validateJDModal').modal('show');
  };

  /********************************************************
  ****** Esta función permite validar la DP seleccionada *****
  *********************************************************/
 jobDescriptionValidation(  ) {
   this.spinner.show();
   if ( this.positionForm.valid ) {
     let formData = this.positionForm.value;
     let user = this._employeeService.user.p_information;
     formData.validator = `${user.name} ${user.firstSurname} ${user.secondSurname}`;
    
    this._positionService.jdValidation( this.id, formData ).subscribe(
    res => {
      $('#validateJDModal').modal('hide');
      this.sendMailValidateJD();
      this.getJobDescription( this.id );
      this.spinner.hide();
      this.Toast.fire({
        type: 'success',
        title: 'Descripción de puesto aprobada.'
      });
    },
    err => {
      $('#validateJDModal').modal('hide');
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Error al aprobar la descripción de puesto, inténtalo de nuevo.'
      });
    }
  );

  } else {
    this.errorMessage = 'Debes ingresar la información solicitada.'
    this.spinner.hide();
  }
}

  /*********************************************************
  ****** Esta función permite rechazar la DP seleccionada *****
  **********************************************************/
 jobDescriptionRejection(  ) {
  this.spinner.show();

  if(this.rejectForm.valid) {
    let formData = this.rejectForm.value;
    let user = this._employeeService.user.p_information;
    formData.validator = `${user.name} ${user.firstSurname} ${user.secondSurname}`;
    this._positionService.jdRejection( this.id, formData ).subscribe(
      res => {
        $('#validateJDModal').modal('hide');
        this.sendMailRejectJD();
        this.getJobDescription( this.id );
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Descripción de puesto rechazada.'
        });
      },
      err => {
        $('#validateJDModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al rechazar la descripción de puesto, inténtalo de nuevo.'
        });
      }
    );
  } else {
    this.errorMessage = 'Debes describir los motivos de rechazo.'
    this.spinner.hide();
  }
    
}

/****************************************************************
  ****** Esta función envía la notificación  de aprobación de DP *****
  ****************************************************************/
  sendMailRejectJD( ) {
    this.spinner.show();
    let position = this.position.name;
    let subject = 'Solicitud de Cambios - Descripción de Puesto';
   let body = {
     position: position,
     SUBJECT: subject,
     TO: this.jobDescription.elaboratedBy.email
   };
   this._emailService.rejectJobDescription(body).subscribe(
     res => {
       this.spinner.hide();
       this.Toast.fire({
        type: 'success',
        title: 'El colaborador ha sido notificado.'
      });
     },
     err => {
       this.spinner.hide();
       this.Toast.fire({
        type: 'error',
        title: 'No pudimos notificar al colaborador que has rechazado la descripción de puesto. Por favor hazle saber tu acción.'
      });
     }
   );
 }
       
 
 /****************************************************************
  ****** Esta función envía la notificación  de aprobación  de DP *****
  ****************************************************************/
 sendMailValidateJD( ) {
  this.spinner.show();
  let position = this.position.name;
  let subject = 'Descripción de Puesto Aprobada';
 let body = {
   position: position,
   SUBJECT: subject,
   TO: this.jobDescription.elaboratedBy.email
 };
 this._emailService.validateJobDescription(body).subscribe(
   res => {
     this.spinner.hide();
     this.Toast.fire({
      type: 'success',
      title: 'El colaborador ha sido notificado.'
    });
   },
   err => {
     this.spinner.hide();
     this.Toast.fire({
      type: 'error',
      title: 'No pudimos notificar al colaborador que has aprobado la descripción de puesto. Por favor hazle saber tu acción.'
    });
   }
 );
}

jobDescriptionDeletion(  jobDescriptionId ) {
  this.spinner.show();
  this._positionService.deleteJobDescription( jobDescriptionId ).subscribe(
    res => {
      $('#deleteJDModal').modal('hide');
      this.getJobDescription( jobDescriptionId );
      this.spinner.hide();
      this.Toast.fire({
        type: 'success',
        title: 'Descripción de puesto dada de baja.'
      });
    },
    err => {
      $('#deleteJDModal').modal('hide');
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Error al dar de baja descripción de puesto, inténtalo de nuevo.'
      });
    }
  );
}

}
