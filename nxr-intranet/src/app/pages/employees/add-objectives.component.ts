import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService, ObjectiveService, NxrevaluationsService } from '../../services/sevice.index';
import * as moment from 'moment';
import { GLOBAL } from '../../config'
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: "app-add-objectives",
  templateUrl: "./add-objectives.component.html",
  styles: []
})
export class AddObjectivesComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  objectivesForm: FormGroup;
  editForm: FormGroup;
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
  year =  ( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) ? moment().year() - 1 : moment().year();
  period: string = ( moment().isBetween(moment(GLOBAL.secondPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss')) ) ? '2' : '1';
  searched = false;
  searchedYear = null;
  searchedYearShown = null;
  objsValidated: boolean = false; // Si los objetivos ya fueron aceptados por el jefe directo se pone en true

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public _employeeService: EmployeeService,
    public _objectiveService: ObjectiveService,
    public _evaluationService: NxrevaluationsService
  ) {
    activatedRoute.params.subscribe( params => {
      params['id'] ? 
      this.id = params['id'] : this.id = this._employeeService.user._id;
      this.getInfo(this.id);
      this.getObjectives(this.id, this.year);
      this.wasEvaluated();
    });
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
    this.editForm =new FormGroup ({
      description: new FormControl('', [
        Validators.required,
      ]),
      acceptance_criteria: new FormControl( "", Validators.required),
      expected_result: new FormControl( "", Validators.required),
      commitment_date: new FormControl( "", [
        Validators.required,
        Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
      ])
    });
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
        data.objectives = this.formatDate(data.objectives)
        data.year = ( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) ? moment().year() - 1 : moment().year();
        data.user = this.id;
        this._objectiveService.saveObjectives( data ).subscribe(
          res => {
            this.router.navigateByUrl('/capital-humano/plantilla/evaluacion');
            this.errorMessage = '';
            this.spinner.hide();
            this.Toast.fire({
              type: 'success',
              title: 'Nuevos objetivos registrados correctamente.'
            });
          },
          err => {
            this.errorMessage = err.error.message;
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al registrar puesto.'
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
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl('/capital-humano/plantilla/evaluacion');
      }
    );
  }

  /*
   * Esta función obtiene los objetivos del usuario si es que los tiene
   * y esto permitirá habilitar o no el agregar objetivos.
   */
  getObjectives(id, year) {
    this.spinner.show();
    this._objectiveService.getObjectives(id, year)
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
        this.router.navigateByUrl('/capital-humano/plantilla/evaluacion');
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
        this.editForm.patchValue({
          description: this.objective.description,
          acceptance_criteria: this.objective.acceptance_criteria,
          expected_result: this.objective.expected_result,
          commitment_date: moment(this.objective.commitment_date).format("DD/MM/YYYY")
        });
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }
  
  /*
   * Esta función realiza el envío de datos para actualizar el objetivo en cuestión
   */ 
  updateObjective(){
    this.spinner.show();
    if (this.editForm.valid) {
      let data = this.editForm.value;
      data.commitment_date = moment(data.commitment_date,'DD/MM/YYYY').toISOString();
        this._objectiveService.updateObjective(this.objective._id, data ).subscribe(
          res => {
            this.errorMessage2 = '';
            this.getObjectives(this.id, this.year);
            $('#UpdateObjectiveModal').modal('hide');
            this.spinner.hide();
            this.Toast.fire({
              type: 'success',
              title: 'Objetivos actualizados correctamente.'
            });
          },
          err => {
            this.errorMessage2 = err.error.message;
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al actualizar objetivos.'
            });
          }
        );
      }
    else {
      this.errorMessage2 = 'Información incompleta, todos los campos deben estar llenos.';
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
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
        this.getObjectives(this.id, this.year);
        this.Toast.fire({
          type: 'success',
          title: 'Objetivos eliminados correctamente.'
        });
      }, 
      err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al eliminar objetivos'
        });
      }
    );
  }
  
  /*
   * Esta función permite conocer si el colaborador ha sido ya evaluado.
   * De ser así, no mostrará el botón para evaluar.
   */
  wasEvaluated() {
    this.spinner.show();
    
    this._evaluationService.getEvaluation(this.id, this.year, this.period)
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

  searchYear(value) {
    this.searchedYear = value.trim();
  }

  searchByYear() {
      if(this.searchedYear && this.searchedYear <= this.year) {
        this.searchedYear == this.year ? this.searched = false : this.searched = true;
        this.getObjectives(this.id, this.searchedYear);
        this.searchedYearShown = this.searchedYear;
        this.searchedYear = null;    
      }
  }
}
