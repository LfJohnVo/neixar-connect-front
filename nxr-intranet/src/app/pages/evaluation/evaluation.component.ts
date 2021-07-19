import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import {
  EmployeeService,
  ObjectiveService,
  NxrevaluationsService,
  EmailService
} from "../../services/sevice.index";
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { GLOBAL } from '../../config';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: "app-evaluation",
  templateUrl: "./evaluation.component.html",
  styles: []
})
export class EvaluationComponent implements OnInit, OnDestroy {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  user: any; // Usuario logeado.
  userChoosen: any; // Usuario elegido a evaluar
  objChoosen: any; // Objetivo a evaluar
  objectives: any[] = [];
  status: any[] = [];
  progressForm: FormGroup;
  errorMessage: String = "";
  isIdUrl = false;
  idEmployee: String;
  total: number = 0;
  saveGrant: boolean = false;  // Si se han validado todos los objetivos permite desplegar el botón de finalizar evaluation
  evaluated: boolean = false;
  onTime: boolean; // Para conocer si ya inició el periodo de evaluación, si ha iniciado = true
  scanDate: any; // Variable que se iguala al setInterval
  messagePeriod: string = "El período de evaluación ha concluido."; // Define el mensaje a mostrar si no ha iniciado la ev o si ya cocluyó
  //year =  ( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) ? moment().year() - 1 : moment().year();
  year =  moment().year();
  period: string = ( moment().isBetween(moment(GLOBAL.secondPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss')) ) ? '2' : '1';
  percentage = 0;
  hasPermissions: boolean = false; // Tiene permiso para evaluar el registro de objetivos
  objsID: string; // Almacenará el id del documento de los objetivos del colaborador en cuestion
  objsValidated: boolean = false; // Si los objetivos ya fueron aceptados por el jefe directo se pone en true

  constructor(
    private spinner: NgxSpinnerService,
    public _employeeService: EmployeeService,
    public _objectiveService: ObjectiveService,
    public _evaluationService: NxrevaluationsService,
    public _emailService: EmailService,
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    activatedRoute.params.subscribe(params => {
      this.idEmployee = params["id"];
      if (this.idEmployee != undefined) this.isIdUrl = true;
      else this.isIdUrl = false;
    });
    this._evaluationService.getPeriodAndYear();
    
  }

  ngOnInit() {
    this.user = this._employeeService.user;
    this.denyEvaluation();
    this.wasEvaluated();
    this.getObjectives();
    this.progressForm = new FormGroup({
      progress: new FormControl("0", [Validators.required, Validators.min(0), Validators.max(100)]),
      progress_description: new FormControl("", [Validators.required])
    });

    // Se verifica que sea tiempo de evaluación.
    this.scanDate = setInterval(() => {
      this._evaluationService.period === '1' ? this.onTime = moment().isBetween(moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss'), null, "[]") :
                                  this.onTime = moment().isBetween(moment(GLOBAL.secondPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss'), null, "[]")

      if( 
        ( this._evaluationService.period === '1' && moment().isAfter( moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss') ) )  || 
        ( this._evaluationService.period === '2' && moment().isAfter( moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss') ) )
        ) {
          clearInterval(this.scanDate);
        $("#UpdateProgressModal").modal("hide");
        (this._evaluationService.period === '1') ? this.messagePeriod = "El período de evaluación del primer semestre ha concluido. !Evaluación no registrada!" :
        this.messagePeriod = "El período de evaluación del segundo semestre ha concluido. !Evaluación no registrada!"
      } else if(
        ( this._evaluationService.period === '1' && moment().isBefore( moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss') ) )  || 
        ( this._evaluationService.period === '2' && moment().isBefore( moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss') ) )
      ) {
        (this._evaluationService.period === '1') ? this.messagePeriod = "El período de evaluación es del 8 al 19 de julio." : this.messagePeriod = "El período de evaluación será del 1 al 14 de enero.";
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.scanDate);
  }

  /*
   * Esta función permite denegar acceder a la página si no se han aceptado los terminos
   * de evaluación y si no ha cambiado la contraseña.
   */
  denyEvaluation() {
    if (
      this._employeeService.pc === "false" ||
      this._employeeService.pa === "false"
    ) {
      this.router.navigateByUrl("/perfil/evaluaciones");
    }
  }

  /*
   * Esta función permite conocer si el colaborador ha sido ya evaluado.
   * De ser así, no mostrará el botón para evaluar.
   */
  wasEvaluated() {
    this.spinner.show();
    let id;
    if (this.isIdUrl) id = this.idEmployee;
    else id = this.user._id;
    this._evaluationService.getEvaluation(id, this._evaluationService.year, this._evaluationService.period).subscribe(
      res => {
        if (res[0]) this.evaluated = true;
        else this.evaluated = false;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  /*
   * Esta función obtiene los objetivos del usuario
   */
  getObjectives() {
    this.spinner.show();
    let id;
    if (this.isIdUrl) id = this.idEmployee;
    else id = this.user._id;
    this._objectiveService.getObjectives(id, this._evaluationService.year).subscribe(
      res => {
        if (res.length > 0) {
          this.objsValidated = res[0].validated ? true : false;
          this.objsID = res[0]._id;
          this.objectives = res[0].objectives;
          this.userChoosen = res[0].user;
          /*
           * Si es un nuevo ingreso y entra después de finalizado el periodo de registro de objetivos,
           * se contarán con 3 días naturales para la validación del registro de sus objetivos.
           */
          let date = this.userChoosen.w_information.admission_date;
          if( !moment(date).isBetween(moment(GLOBAL.ROstartDate, 'DD/MM'), moment(GLOBAL.ROendDate, 'DD/MM') ) ){
            ( moment().isBetween(moment(date), moment(date).add(30, 'days'), null, "[]") ) ?  this.hasPermissions = true : this.hasPermissions = false;
          } else {
            ( moment().isBetween(moment(GLOBAL.ROstartDate, 'DD/MM'), moment(GLOBAL.ROendDate, 'DD/MM'), null, "[]") ) ?  this.hasPermissions = true : this.hasPermissions = false;
          }
          moment().isBetween( moment(GLOBAL.ROstartDate, 'DD/MM'), moment(GLOBAL.ROendDate, 'DD/MM'), null, "[]") ? this.hasPermissions = true : this.hasPermissions = false;
            /*
            *  Sí el colaborador ha sido promovido, contará con 3 días naturales para el registro de sus objetivos.
            */
           if(this.userChoosen.promotions.length > 0) {
            let date = this.userChoosen.promotions[0].date;
            if( !moment(date).isBetween( moment(GLOBAL.ROstartDate, 'DD/MM'), moment(GLOBAL.ROendDate, 'DD/MM') ) ) {
              ( moment().isBetween(moment(date), moment(date).add(3, 'days'), null, "[]") ) ?  this.hasPermissions = true : this.hasPermissions = false                                                            ;
            }
          }
          
          /*** Calcula el total de avance ***/
          this.total = this.objectives.reduce(
            (accumulator, currentValue) =>
              accumulator + (currentValue.progress || 0),
            0
          ).toFixed(2);  
          /*** Fin cálculo del total de avance ***/
          
          if (this.isIdUrl) this.getObjectivesStatus(id, this._evaluationService.year);
        } else {
          this.objectives = [];
          this.getUser(id);
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        //this.router.navigateByUrl('/inicio');
      }
    );
  }

  /*
   * Esta función resetea el modal para actualizar el avance 
   */
  showObj(obj) {
    this.objChoosen = obj;
    this.errorMessage = "";
    let progress = ( obj.progress * 100 ) / obj.weighing;
    if(this._evaluationService.period === '1') {
      this.progressForm.patchValue({
        progress: progress || 0,
        progress_description: obj.progress_description || ""
      });
    } else {
      // Para el segundo semestre no permite que el valor del progreso sea menor al asignado en el semestre 1
      let minProgress = 0; // Avance mínimo a registrar.
      this.progressForm.patchValue({
        progress: progress || 0,
        progress_description: obj.progress_description2 || ""
      });

      if( !obj.validated ) minProgress = 0; // Si NO fue evaluado en el 1er semestre
      else { // Si fue evaluado en el 1er semestre y si ya ha registrado un avance en el 2do.
        obj.registered2 ? minProgress = obj.progress1 : minProgress = obj.progress;
      }
      // Se crea la validación en el formulario para restringir el avance mínimo a registrar
      this.percentage = (minProgress * 100) / obj.weighing;
      this.progressForm.get('progress').clearValidators();
      this.progressForm.get('progress').updateValueAndValidity();
      this.progressForm.get('progress').setValidators([
        Validators.required, 
        Validators.min(this.percentage || 0), 
        Validators.max(100)
      ]);
      this.progressForm.get('progress').updateValueAndValidity();
    }
  }

  /*
   * Esta función actualiza el avance del objetivo
   */
  updateProgress(progress) {
    this._evaluationService.period === '1' ? progress.registered = true : progress.registered2 = true; 
    this._objectiveService
      .updateProgress(this.objChoosen._id, progress)
      .subscribe(
        res => {
          $("#UpdateProgressModal").modal("hide");   
           /*** Calcula el número de objetivos con registro de avance para permitir la notificación al jefe directo ***/
        
          let registeredObjs;
          this._evaluationService.period === '1' ? 
          registeredObjs = this.objectives.filter(obj => obj.registered ) : registeredObjs = this.objectives.filter(obj => obj.registered2 );
          
          if( registeredObjs.length === (this.objectives.length - 1) ) this.sendMailToBoss();

          /*** Fin calculo del número de objetivos con registro de avance para permitir la notificación al jefe directo ***/
          this.getObjectives();
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Avance registrado correctamente.'
          });
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
        }
      );
  }

  /*
   * Esta función valida el avance del objetivo
   */
  validate(progress) {
    this._evaluationService.period === '1' ? progress.validated = true : progress.validated2 = true; 
    this._objectiveService.validate(this.objChoosen._id, progress).subscribe(
      res => {
        if (this.onTime) {
        $("#UpdateProgressModal").modal("hide");
        this.getObjectives();
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Avance validado correctamente.'
        });
        } else {
          this.errorMessage = "El período de evaluación conluyó.";
          this.spinner.hide();
          Swal.fire(
            'Lo sentimos',
            'El período de evaluación concluyó.',
            'warning'
          );
        }
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al validar objetivo.'
        });
      }
    );
  }

  /*
   * Esta función actualiza el objetivo
   */
  updateObj() {
    this.spinner.show();
    if (this.progressForm.valid) {
      if (this.onTime) {
        let obj = this.progressForm.value;
        let progress;
        if(this._evaluationService.period === '1') {
          progress = {
            progress: (obj.progress * this.objChoosen.weighing) / 100,
            progress_description: obj.progress_description
          };
        } else {
          let progress1;
          this.objChoosen.registered2 ? progress1 = this.objChoosen.progress1 : progress1 = this.objChoosen.progress;
          progress = {
            progress: (obj.progress * this.objChoosen.weighing) / 100,
            progress_description2: obj.progress_description,
            progress1: progress1
          };
        } 
        if (this.isIdUrl) this.validate(progress);
        else this.updateProgress(progress);
      } else{
        this.errorMessage = "El período de evaluación conluyó.";
        Swal.fire(
          'Lo sentimos',
          'El período de evaluación concluyó.',
          'warning'
        );
      }
        this.spinner.hide();
    } else {
      if (this.isIdUrl)
        this.errorMessage =
          "Debes asignar un valor al avance y describir la evidencia de acreditación.";
      else
        this.errorMessage =
          "Debes asignar un valor al avance y describir tu evidencia de acreditación.";
      this.spinner.hide();
    }
  }

  /*
    * Esta función permite obtener el número de objetivos validados y no validados.
    */
  getObjectivesStatus(id, year) {
    this.spinner.show();
    let result;
    this._evaluationService.period === '1' ? 
    result = this.objectives.filter(obj => obj.validated ) : result = this.objectives.filter(obj => obj.validated2 );
    
    if(result.length === this.objectives.length) {
      this.saveGrant = true;
    } else {
      this.saveGrant = false;
    }
    this.spinner.hide();
  }

  getUser(id) {
    this.spinner.show();
    this._employeeService.getEmployee(id).subscribe(
      res => {
        this.userChoosen = res;
        /*
          *  Sí el colaborador ha sido promovido, contará con 3 días naturales para el registro de sus objetivos.
          */
         if(this.userChoosen.promotions.length > 0) {
          let date = this.userChoosen.promotions[0].date;
          if( moment(date).isAfter( moment(GLOBAL.ROstartDate, 'DD/MM') ) ) {
            ( moment().isBetween(moment(date), moment(date).add(3, 'days'), null, "[]") ) ?  this.hasPermissions = true : this.hasPermissions = false;
          }
        }        
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  /*
   * Esta función guarda la evaluación 
   */
  save() {
    let evaluation: any = {
      user: this.idEmployee,
      year: this._evaluationService.year,
      period: this._evaluationService.period,
      total: this.total,
      date: moment().toISOString()
    };    
    this.spinner.show();
    if(this._evaluationService.period === '2') {
      let evalDate =  moment();
      let admiDate = moment(this.userChoosen.w_information.admission_date);
      let months = evalDate.diff(admiDate, 'months');
      

      if(evaluation.total >= 80 && evaluation.total < 96) {

        if(months >= 12) evaluation.amount = 24 * (this.userChoosen.f_information.monthly_salary_saf / 30);
        if(months < 12) evaluation.amount = 0;
        evaluation.trafficLight = 'Avance Significativo';
        evaluation.color = 'green';

      } else if(evaluation.total >= 96 && evaluation.total <= 100) {

        if(months >= 12) evaluation.amount = this.userChoosen.f_information.monthly_salary_saf;
        if(months >= 6 && months < 12) evaluation.amount = 12 * (this.userChoosen.f_information.monthly_salary_saf / 30);
        if(months < 6) evaluation.amount = 0;
        evaluation.trafficLight = 'Cumplido';
        evaluation.color = 'lgreen';

      } else {
        evaluation.amount = 0;
      }

      if(evaluation.total >= 1 && evaluation.total < 61) {
        evaluation.trafficLight = 'No Cumplido';
        evaluation.color = 'red';
      }
      else if(evaluation.total >= 61 && evaluation.total < 81) {
        evaluation.trafficLight = 'En Proceso';
        evaluation.color = 'yellow';
      }
      else if(evaluation.total == 0) {
        evaluation.trafficLight = 'No Iniciado';
        evaluation.color = 'white';
      }
    }
    this._evaluationService.saveEvaluation(evaluation).subscribe(
      res => {
        this.sendMailToEmployee();
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Evaluación registrada correctamente.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al registrar evaluación.'
        });
      }
    );
  }

  /*
   * Esta función envía la notificación al colaborador que ha sido evaluado
   */
  sendMailToEmployee() {
    let body = {
      year: this._evaluationService.year,
      SUBJECT: 'Evaluación de desempeño (Objetivos SMART)',
      TO: this.userChoosen.email
    };
    this.spinner.show();
    this._emailService.performanceEvaluationFinish(body).subscribe(
      res => {
        this.router.navigateByUrl("/perfil/evaluaciones/equipo");
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'El colaborador ha sido notificado que has finalizado su evaluación.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        Swal.fire(
          'Lo sentimos',
          'No pudimos informar al colaborador que has finalizado su evaluación. Por favor hazle saber que ha sido evaluado.',
          'warning'
        );
      }
    );
  }

  /*
   * Esta función envía la notificación al jefe directo cuando el colaborador que ha 
   * registrado por completo el avance de sus objetivos
   */
  sendMailToBoss() {
    let body = {
      year: this._evaluationService.year,
      name: `${this.user.p_information.name} ${this.user.p_information.firstSurname}`,
      SUBJECT: 'Evaluación de desempeño (Objetivos SMART)',
      TO: this.user.w_information.immediate_boss.email
    };
    this.spinner.show();
    this._emailService.nxrobjectiveRegistered(body).subscribe(
      res => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Tu jefe inmediato ha sido notificado que has registrado el avance de tus objetivos.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        Swal.fire(
          'Lo sentimos',
          'No pudimos informar a tu jefe inmediato que has registrado el avance de tus objetivos. Por favor hazle saber que has concluido tu registro.',
          'warning'
        );
      }
    );
  }

  /*
   * Esta función permite eliminar los objetivos del empleado
   */
  confirmDeletion() {
    this.spinner.show();
    this._objectiveService.deleteObjectives(this.objsID).subscribe(
      res => {
        $('#DeleteObjsModal').modal('hide');
        this.spinner.hide();
        this.router.navigateByUrl("/perfil/evaluaciones/equipo");
        this.Toast.fire({
          type: 'success',
          title: 'Objetivos eliminados correctamente.'
        });
      }, 
      err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al eliminar objetivos.'
        });
      }
    );
  }

  /*
   * Esta función permite dar el VoBo de los objetivos del empleado
   */
  confirmVoBo() {
    this.spinner.show();
    this._objectiveService.voboObjectives(this.objsID).subscribe(
      res => {
        $('#voboModal').modal('hide');
        this.spinner.hide();
        this.router.navigateByUrl("/perfil/evaluaciones/equipo");
        this.Toast.fire({
          type: 'success',
          title: 'Has aprobado los objetivos.'
        });
        
      }, 
      err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al aprobar objetivos.'
        });
      }
    );
  }
}