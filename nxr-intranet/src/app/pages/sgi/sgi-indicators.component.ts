import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService, NcindicatorsService, NcevaluationsService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { GLOBAL } from '../../config';
import * as moment from 'moment';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-sgi-indicators',
  templateUrl: './sgi-indicators.component.html',
  styles: []
})
export class SgiIndicatorsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  indicatorForm: FormGroup;
  editForm: FormGroup;
  indicators: any[] = [];
  months: string[] = GLOBAL.months;
  evaluation: any;
  chosenType: String = 'PROCESOS';
  employees: any[];
  total: number;
  pages: number[] = [];
  years: any[] = [];
  chosenYear: String;
  currentPage: number = 1;
  totalPages: number = 1;
  errorMessage: String = '';
  indicator: any;
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
  isCEO: boolean = false;

  constructor(
    public _employeeService: EmployeeService,
    public _indicatorService: NcindicatorsService,
    public _evaluationService: NcevaluationsService,
    private spinner: NgxSpinnerService
    ) { 
      this.getYears();
      this.isCEO = this._employeeService.user.role === 'DG' ? true : false;
    }

  ngOnInit() {
    this.indicatorForm = new FormGroup({
      objective: new FormGroup({
        objective: new FormControl('', [
          Validators.required,
          Validators.minLength(10)
        ]),
        process: new FormControl('', [
          Validators.minLength(7) // 7 ya que en este campo se usa la palabra GESTIÓN
        ]),
        standard: new FormControl('', [
          Validators.minLength(5) //5 mínimo para escribir ISO 1
        ])
      }),
      type: new FormControl('SGI'),
      indicator: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      year: new FormControl(moment().year(), [
        Validators.required,
        Validators.pattern("^2[0-9]{3}$")
      ]),
      responsable: new FormControl('', [
        Validators.required
      ]),
      frecuency: new FormControl('Mensual'),
      formula: new FormControl('', [
        Validators.required
      ]),
      months: new FormControl('', [
        Validators.required
      ]),
      goal: new FormControl('', [
        Validators.required
      ]),
      green: new FormGroup({
        min: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]),
        max: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ])
      }),
      yellow: new FormGroup({
        min: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]),
        max: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ])
      }),
      red: new FormGroup({
        min: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]),
        max: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ])
      })
    });
    this.checkObjectivesType('SGI');
    this.getEmployees();
    //this.getIndicatorsType(1);
  }
  
/*
  * Obtener los colaboradores
  */
  getEmployees() {
    this.spinner.show();
    this._employeeService.getEmployeesbyStatus('ACTIVO').subscribe(
      res => {
        this.employees = res.data;
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  /*
  * Obtener los indicadores por tipo y paginados
  */
  getIndicatorsType(page?) {
    this.spinner.show();
    this._indicatorService.getIndicatorsType( this.chosenType, this.chosenYear, page ).subscribe(
      res => {
        this.indicators = res.data;
        this.total = res.total;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.pages = this._employeeService.getPages(
          res.totalPages,
          res.currentPage
        );
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

/*
  * Verifica que tipo de objetivo es y asigna validaciones a los campos proceso ó estándar
  */
 checkObjectivesType(type) {
  if (type === 'PROCESOS') {
    this.indicatorForm.get('objective.standard').clearValidators();
    this.indicatorForm.get('objective.standard').updateValueAndValidity();
    this.indicatorForm.get('objective.process').setValidators([
      Validators.required,
      Validators.minLength(7)
    ]);
    this.indicatorForm.get('objective.process').updateValueAndValidity();
  } else {
    this.indicatorForm.get('objective.process').clearValidators();
    this.indicatorForm.get('objective.process').updateValueAndValidity();
    this.indicatorForm.get('objective.standard').setValidators([
      Validators.required,
      Validators.minLength(5)
    ]);
    this.indicatorForm.get('objective.standard').updateValueAndValidity();
  }
}

/*
  * Realiza el llamado al servicio que guarda en BD el objetivo.
  */
 saveIndicator() {
  this.spinner.show();
  if(this.indicatorForm.valid){
    this._indicatorService.saveIndicator( this.indicatorForm.value ).subscribe(
      res => {
        let data = {
          indicator: res.data._id,
          year: res.data.year,
          average: 0
        }
          this._evaluationService.saveEvaluation( data ).subscribe(
            res => {
              this.getYears();
              $('#NewIndicatorModal').modal('hide');
              this.spinner.hide();
              this.Toast.fire({
                type: 'success',
                title: 'Nuevo indicador registrado correctamente.'
              });
            },
            err => {
              this.errorMessage = err.error.message;
              this.spinner.hide();
              this.Toast.fire({
                type: 'error',
                title: 'Error al registrar indicador.'
              });
            }
          );
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
      }
    );
  } else {
   this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';
   this.spinner.hide();
   this.Toast.fire({
    type: 'error',
    title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
  });
  }
}

/*
  * Reestablece los valores por predefinidos en el formulario indicatorForm
  */
resetForm(){  
  this.errorMessage = '';
  this.indicatorForm.reset();
  this.indicatorForm.patchValue({
    type: this.chosenType,
    frecuency: 'Mensual',
    year: moment().year()
  });
  this.getEmployees();
  this.checkObjectivesType(this.chosenType);
}

changeType(type) {
  this.chosenType = type;
  this.getIndicatorsType(1);
}

changeYear(year) {
  this.chosenYear = year;
  this.getIndicatorsType(1);
}

/*
  * Obtiene los datos del indicador especificado.
  */
 getIndicator(id) {
  this.spinner.show();
  this._indicatorService.getIndicator( id ).subscribe(
    res => {
      this.indicator = res;      
      let months = this.indicator.months.map((m) => this.months[m-1]);
      this.indicator.nmonths = this.indicator.months; // Número de mes
      this.indicator.months = months.join(", ");

      for (let i = 0; i<3; i++) {
        if(res.trafficLight[i].value === 'green') {
            this.colors.green.min = res.trafficLight[i].min;
            this.colors.green.max = res.trafficLight[i].max;
        } else if (res.trafficLight[i].value === 'yellow') {
          this.colors.yellow.min = res.trafficLight[i].min;
          this.colors.yellow.max = res.trafficLight[i].max;
        } else {
          this.colors.red.min = res.trafficLight[i].min;
          this.colors.red.max = res.trafficLight[i].max;
        }
      }
      this.fillForm();
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}
  
/*
 * Inserta los datos del indicador en el formulario para llevar a cabo la edición del mismo
 */
fillForm(){
  let months = this.indicator.nmonths.map(x => x.toString());
  
  this.indicatorForm.patchValue({
    type: this.indicator.type,
    objective: {
      objective: this.indicator.objective.objective,
      process: this.indicator.objective.process,
      standard: this.indicator.objective.standard
    },
    indicator: this.indicator.indicator,
    year: this.indicator.year,
    responsable: this.indicator.responsable._id,
    frecuency: this.indicator.frecuency,
    formula: this.indicator.formula,
    goal: this.indicator.goal,
    months: months,
    green: {
      min: this.colors.green.min,
      max: this.colors.green.max
    },
    yellow: {
      min: this.colors.yellow.min,
      max: this.colors.yellow.max
    },
    red: {
      min: this.colors.red.min,
      max: this.colors.red.max
    }
  });

  this.checkObjectivesType(this.indicator.type);
}

/*
  *  Cuando se elige el indicador a editar es necesario solicitar algunos datos.
  */
requestData(id){
  this.getEmployees();
  this.getIndicator(id);
}

/*
  * Realiza el llamado al servicio que edita el objetivo.
  */
 editIndicator() {
  this.spinner.show();
    if (this.indicatorForm.valid) {
      this._indicatorService.updateIndicator(this.indicator._id, this.indicatorForm.value).subscribe(
        res => {
          this.getIndicatorsType(1);
          $('#EditIndicatorModal').modal('hide');
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Indicador actualizado correctamente.'
          });
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Error al actualizar indicador.'
          });
        }
      );
    } else {
      this.errorMessage = "Información incompleta, todos los campos obligatorios deben estar llenos.";
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
}

/*
  * Permite llevar a cabo la eliminación del indicador (Cambia su estatus a BAJA)
  */
confirmDeletion(id) {
  this.spinner.show();
  this._indicatorService.deleteIndicator(id).subscribe(
    res => {
      this.getIndicatorsType(1);
      $('#DeleteIndicatorModal').modal('hide');
      this.spinner.hide();
      this.Toast.fire({
        type: 'success',
        title: 'Indicador eliminado correctamente.'
      });
    }, 
    err => {
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Error al elimanar indicador.'
      });
    }
  );
}

/*
  * Obtener el registro de evaluación del año y del indicador requerido
  */
 requestEvaluation(year, indicator?) {
  this.spinner.show();
  this._evaluationService.getEvaluationsByYearAndIndicator(year, indicator ).subscribe(
    res => {
      this.evaluation = res[0].evaluations;
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

/*
   * Esta función obtiene todos los años de evaluación registrados
   */
  getYears() {
    this.spinner.show();
    this._indicatorService.getYears().subscribe(
      res => {
        this.years = res.data;
        (this.years.length > 0) ? this.chosenYear = this.years[0]._id : this.chosenYear = '';
        this.getIndicatorsType(1);
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

}
