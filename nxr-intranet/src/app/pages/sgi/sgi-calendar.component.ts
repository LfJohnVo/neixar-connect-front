import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ActivationEnd } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService, NcevaluationsService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { filter, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-sgi-objectives',
  templateUrl: './sgi-calendar.component.html',
  styles: []
})
export class SgiCalendarComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  user: any;
  evaluation: any;
  indicator: any;
  progressForm: FormGroup;
  year = moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year();
  currentMonth =  moment().month();
  isOwner: boolean = false; // Nos permite conocer si el que ingresó a la página es dueño de algún indicador
  asExpected: boolean = true; // Nos permite mostrar o no los campos plan de acción y fecha compromiso al evaluar el indicador si es true no los muestra
  months: string[] = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  colors: any = {
    green: {
      min: 0,
      max: 0
    },
    yellow: {
      min: 0,
      max: 0
    },
    red: {
      min: 0,
      max: 0
    }
  };
  indChoosen: any;
  indicatorID: String = "";
  errorMessage: String = "";
  onTime: boolean; // Para conocer si ya inició el periodo de evaluación, si ha iniciado = true
  currentEval = true;
  isCEO: boolean = false;
  
  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public _employeeService: EmployeeService,
    public _evaluationService: NcevaluationsService
    ) {
      this.isCEO = this._employeeService.user.role === 'DG' ? true : false;
      this.user = this._employeeService.user;
      activatedRoute.params.subscribe(params => {
        this.requestEvaluation(params['year'], params['id']);
        this.year = params['year'];
        this.currentEval = this.year == (moment().isBetween(moment('01/01', 'DD/MM'), moment('31/01 23:59:59', 'DD/MM hh:mm:ss'), null, '[]') ? (moment().year() - 1) : moment().year());
        this.indicatorID = params['id'];
        this.getDataRoute().subscribe(data => {
          data.route.indexOf('/perfil') > -1 ? this.isOwner = true : this.isOwner = false;
        });
      });

      (moment().date() < 11) ? this.onTime = true: this.onTime = false;
    }

  ngOnInit() {    
    this.progressForm = new FormGroup({
      progress: new FormControl("0", [
        Validators.required, Validators.min(0),
         Validators.max(100)
        ]),
      evidence: new FormControl("", [Validators.required]),
      action: new FormControl(''),
      commitmentDate: new FormControl(''),
      color: new FormControl('green')
    });
  }

  /*
  * Obtener el regustro de evaluación del año y del indicador requerido
  */
 requestEvaluation(year, indicator?) {
  this.spinner.show();
  this._evaluationService.getEvaluationsByYearAndIndicator(year, indicator ).subscribe(
    res => {      
      if(res) {
        this.evaluation = res.evaluations;
        this.indicator = res.indicator;
        for (let i = 0; i<3; i++) {
          if(res.indicator.trafficLight[i].value === 'green') {
              this.colors.green.min = res.indicator.trafficLight[i].min;
              this.colors.green.max = res.indicator.trafficLight[i].max;
          } else if (res.indicator.trafficLight[i].value === 'yellow') {
            this.colors.yellow.min = res.indicator.trafficLight[i].min;
            this.colors.yellow.max = res.indicator.trafficLight[i].max;
          } else {
            this.colors.red.min = res.indicator.trafficLight[i].min;
            this.colors.red.max = res.indicator.trafficLight[i].max;
          }
        }
      }
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
      this.router.navigateByUrl('/normatividad/indicadores');
    }
  );
}

/*
   *  Esta función permite obtener la ruta para saber si estamos en el apartado de Norm y Cumplimiento o
   *  en la ventana de indicadores de los responsables
   */
  getDataRoute() {
    return this.router.events.pipe(
      filter( routerEvent => routerEvent instanceof ActivationEnd ),
      filter( (routerEvent: ActivationEnd) => routerEvent.snapshot.firstChild === null ),
      map( (routerEvent: ActivationEnd) => routerEvent.snapshot.data)
    )
  }

  /*
    * Esta función permite definir el color del semáforo según el avance definido por el colaborador.
    */
  validateProgress(value) {
    if(value >= this.colors.green.min && value <= this.colors.green.max){ // Semáforo Verde
      this.progressForm.get('action').clearValidators();
      this.progressForm.get('action').updateValueAndValidity();
      this.progressForm.get('commitmentDate').clearValidators();
      this.progressForm.get('commitmentDate').updateValueAndValidity();
      this.asExpected = true;
      this.progressForm.patchValue({ color: 'green' });
      
    } else if(value >= this.colors.yellow.min && value <= this.colors.yellow.max){  // Semáforo Amarillo
      this.progressForm.get('action').setValidators([
        Validators.required,
      ]);
      this.progressForm.get('action').updateValueAndValidity();
      this.progressForm.get('commitmentDate').setValidators([
        Validators.required
      ]);
      this.progressForm.get('commitmentDate').updateValueAndValidity();
      this.asExpected = false;      
      this.progressForm.patchValue({ color: 'yellow' });

    } else if(value >= this.colors.red.min && value <= this.colors.red.max){ // Semáforo Rojo
      this.progressForm.get('action').setValidators([
        Validators.required
      ]);
      this.progressForm.get('action').updateValueAndValidity();
      this.progressForm.get('commitmentDate').setValidators([
        Validators.required
      ]);
      this.progressForm.get('commitmentDate').updateValueAndValidity();
      this.asExpected = false;      
      this.progressForm.patchValue({ color: 'red' });
    }
  }

  /*
   * Esta función actualiza el avance del indicador
   */
  updateIndicator() {
    this.spinner.show();
    let data = this.progressForm.value;
    if(this.progressForm.valid){
      data.evaluationDate = moment().toISOString();
      data.responsable = this.user._id;
      data.registered = true;
      if( data.color === 'green') {
        delete data.action; 
        delete data.commitmentDate;
      } else { 
        data.commitmentDate = moment(data.commitmentDate, 'DD/MM/YYYY').toISOString();
      }
      // Verifica si es registro de cumplimiento  o validación
      if (!this.isOwner) this.validate(data, this.indChoosen.registered);
      else this.updateProgress(data);
    } else {
      this.errorMessage ="Información incompleta, todos los campos obligatorios deben estar llenos.";
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
  }

  /*
   * Esta función actualiza el avance del indicador
   */
  updateProgress(data) {
    this._evaluationService.updateProgress(this.indChoosen._id, data)
      .subscribe(
        res => {
          $("#UpdateProgressModal").modal("hide");
          this.requestEvaluation(this.year, this.indicator._id);
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Avance registrado correctamente.'
          });
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Error al registrar avance, inténtalo de nuevo.'
          });
        }
      );
  }

  /*
   * Esta función valida el avance del objetivo
   */
  validate(data, wasRegister ) {
    let totalProgress: number = 0;
    for (let month of this.evaluation) {
      totalProgress = totalProgress + month.progress;
    }
    let sum: number;
    (wasRegister == false) ? sum = totalProgress + data.progress : sum = totalProgress;
    let i;
    if(this.indicator.frecuency === 'Mensual')  i = this.currentMonth + 1;
    else if(this.indicator.frecuency === 'Bimestral')  i = Math.floor( (this.currentMonth + 1) / 2);
    else if(this.indicator.frecuency === 'Trimestral')  i = Math.floor( (this.currentMonth + 1) / 3);
    else if(this.indicator.frecuency === 'Semestral')  i = Math.floor( (this.currentMonth + 1) / 6);
    else if(this.indicator.frecuency === 'Anual')  i = 1;
    
    data.average = (sum/i).toFixed(2);

    this._evaluationService.validate(this.indChoosen._id, data, this.indicatorID ).subscribe(
      res => {
        $("#UpdateProgressModal").modal("hide");
          this.requestEvaluation(this.year, this.indicator._id);
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Has validado el avance del indicador.'
          });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al validar el avance, inténtalo de nuevo.'
        });
      }
    );
  }

  /*
  * Reestablece los valores por predefinidos en el formulario progressForm
  */
resetForm(selectedMonth){  
  this.indChoosen = selectedMonth;
  this.errorMessage = '';
  this.progressForm.reset();
  this.progressForm.patchValue({
    progress: selectedMonth.progress,
    evidence: selectedMonth.evidence,
    action: selectedMonth.action,
    commitmentDate: moment(selectedMonth.commitmentDate).format('DD/MM/YYYY')
  });
  this.validateProgress(selectedMonth.progress || 0);
}

}