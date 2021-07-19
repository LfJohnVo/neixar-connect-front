import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { EmployeeService, ObjectiveService, NxrevaluationsService, EmailService } from '../../services/sevice.index';
import * as moment from 'moment';
import { GLOBAL } from '../../config'
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-addobjectives',
  templateUrl: './addobjectives.component.html',
  styles: []
})
export class AddobjectivesComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  objectivesForm: FormGroup;
  objs: FormArray;
  userInfo: any;
  id: string;
  errorMessage: string = "";
  errorMessage2: string = "";
  total: number = 0;
  totalProgress: number = 0;
  objectives: any[] = [];
  objective: any;
  objsID: string; // Almacenará el id del documento de los objetivos del colaborador en cuestion
  evaluated:boolean = false;
  evaluationInfo: any;
  hasPermissions: boolean = false; // Tiene permiso para registrar sus objetivos
  year =  ( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) ? moment().year() - 1 : moment().year();
  period: string = ( moment().isBetween(moment(GLOBAL.secondPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss')) ) ? '2' : '1';
  objsValidated: boolean = false; // Si los objetivos ya fueron aceptados por el jefe directo se pone en true

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _objectiveService: ObjectiveService,
    public _evaluationService: NxrevaluationsService,
    public _emailService: EmailService
  ) { 
      this.id = this._employeeService.user._id;
      this._evaluationService.getPeriodAndYear();
      this.getInfo(this.id);
      this.getObjectives(this.id);
    this.wasEvaluated();
  }

  ngOnInit() {
    this.objectivesForm = new FormGroup({
      objectives: this.fb.array([this.createObjective()])
    });
    this.objectivesForm.get("objectives").valueChanges.subscribe(newVal => {
      this.total = newVal.reduce((acc, curr) => {
        return acc + +curr.weighing;
      }, 0);
    });
    
  }

  // Obtener los permisos para dar de alta los objetivos.
  thereArePermissions() {
    // No es tiempo de registro de objetivos
    if( !moment().isBetween( moment(GLOBAL.ROstartDate, 'DD/MM'), moment(GLOBAL.ROendDate, 'DD/MM') ) ){
      /*
       * Si es un nuevo ingreso y entra después de finalizado el periodo de registro de objetivos,
       * se contarán con 3 días naturales para el registro de sus objetivos.
       */
      let date = this._employeeService.user.w_information.admission_date;      
      ( moment().isBetween(moment(date), moment(date).add(30, 'days'), null, "[]") ) ? this.hasPermissions = true : this.hasPermissions = false;
        /*
          *  Sí el colaborador ha sido promovido, contará con 3 días naturales para el registro de sus objetivos.
          */
         if(this.userInfo.promotions.length > 0) {
          let date = this.userInfo.promotions[0].date;
          ( moment().isBetween(moment(date), moment(date).add(3, 'days'), null, "[]") ) ?  this.hasPermissions = true : this.hasPermissions = false;
        }
    } else { // Es período de registro de objetivos
      this.hasPermissions = true;
    }
  }

   // Esta función crea el formulario para un objetivo.
   createObjective(): FormGroup {
    return this.fb.group({
      description: ["", Validators.required],
      acceptance_criteria: ["", Validators.required],
      expected_result: ["", Validators.required],
      commitment_date: ["", [
        Validators.required,
        Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
      ]],
      weighing: ["0", [Validators.min(1), Validators.required]]
    });
  }
  
  // Esta función agrega un objetivo al arreglo para mostrarse en pantalla.
  addObjective() {
    this.objs = this.objectivesForm.get("objectives") as FormArray;
    this.objs.push(this.createObjective());
  }
  
  // Esta función elimina un objetivo al arreglo.
  deleteObjective(index) {
    this.objs = this.objectivesForm.get("objectives") as FormArray;
    this.objs.removeAt(index);
  }
  
  // Esta función da el formato necesario para mongoDB a las fechas en los objetivos
  formatDate(data){
    for (let i in data) {
      data[i].commitment_date = moment(data[i].commitment_date,'DD/MM/YYYY').toISOString();
    }
    return data;
  }
  
  // Esta función permite asignar los objetivos a un colaborador
  saveObjectives() {
    this.spinner.show();
    if (this.objectivesForm.valid) {
      if (this.total < 100 || this.total > 100) {
        this.errorMessage = "El porcentaje total debe ser igual a 100.";
        this.spinner.hide();
      } else {
        let data = this.objectivesForm.value;
        data.objectives = this.formatDate(data.objectives);
        data.year = ( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) ? moment().year() - 1 : moment().year();
        data.user = this.id;
        this._objectiveService.saveObjectives( data ).subscribe(
          res => {
            this.getObjectives(this.id);
            this.errorMessage = '';
            this.spinner.hide();
            this.sendMailToBoss();
            this.Toast.fire({
              type: 'success',
              title: 'Nuevos objetivos registrados, correctamente.'
            });
          },
          err => {
            this.errorMessage = err.error.message;
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al registrar objetivos.'
            });
          }
        );
      }
    }
    else {
      this.errorMessage = 'Información incompleta, todos los campos deben estar llenos.';
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
  }
  
  // Esta función obtiene los datos del colaborador para mostrarlos en pantalla
  getInfo(id) {
    this.spinner.show();
    this._employeeService.getEmployee(id)
    .subscribe(
      res => {        
        this.userInfo = res;
        this.thereArePermissions();
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/perfil/evaluaciones');
      }
    );
  }

  /*
   * Esta función obtiene los objetivos del usuario si es que los tiene
   * y esto permitirá habilitar o no el agregar objetivos.
   */
  getObjectives(id) {
    this.spinner.show();
    this._objectiveService.getObjectives(id, this._evaluationService.year)
    .subscribe(
      res => {        
        if(res.length > 0) {
          this.objsValidated = res[0].validated ? true : false;
          this.objsID = res[0]._id;
          this.objectives = res[0].objectives;
          this.totalProgress = this.objectives.reduce(
            ( accumulator, currentValue ) => accumulator + (currentValue.progress || 0),
            0
          ).toFixed(2);
        } else {
          this.objectives = [];
          this.totalProgress = 0;
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/perfil/evaluaciones');
      }
    );
  }

  /*
   * Esta función obtiene el objetivo
   */
  getObjective(id) {
    this.spinner.show();
    this._objectiveService.getObjective(id)
    .subscribe(
      res => {        
        this.objective = res[0].objectives[0]; 
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }
  
  /*
   * Esta función permite conocer si el colaborador ha sido ya evaluado.
   * De ser así, no mostrará el botón para evaluar.
   */
  wasEvaluated() {
    this.spinner.show();
    this._evaluationService.getEvaluation(this.id, this._evaluationService.year, this._evaluationService.period)
    .subscribe(
      res => {
        if(res[0]){ 
          this.evaluated = true;
          this.evaluationInfo = res[0];
        }
        else{ 
          this.evaluated = false;
          this.evaluationInfo = {};
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  /*
   * Esta función envía la notificación al jefe directo cuando el colaborador que ha 
   * registrado sus objetivos
   */
  sendMailToBoss() {
    let body = {
      year: this._evaluationService.year,
      name: `${this.userInfo.p_information.name} ${this.userInfo.p_information.firstSurname}`,
      SUBJECT: `Registro de Objetivos SMART ${this._evaluationService.year}`,
      TO: this.userInfo.w_information.immediate_boss.email
    };
    
    this.spinner.show();
    this._emailService.nxrApproveObjectives(body).subscribe(
      res => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Tu jefe directo ha sido notificado para que apruebe tus objetivos.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        Swal.fire(
          'Lo sentimos',
          'No pudimos informar a tu jefe que has registrado tus objetivos. Por favor hazle saber que has concluido tu registro.',
          'warning'
        )
      }
    );
  }

}
