import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService, DepartmentsService, PositionService, UploadImageService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styles: []
})
export class EmployeesComponent implements OnInit {
  
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });

  upImage: File; //Archivo que se asignará
  imagenTemp: any;
  
  employeeForm: FormGroup; // Formulario Nuevo Ingreso
  deleteForm: FormGroup; // Formulario Baja
  errorMessage: String;
  employees: any[];
  departments: any[];
  positions: any[];
  employeesByDepto: any[];
  employeesList: any[];
  employee: any;
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  route: string;
  title: string;
  term: string = '';
  isSearching: boolean = false;

  constructor( 
    public _uploadImageService: UploadImageService,
    public _employeeService: EmployeeService,
    public _departmentService: DepartmentsService,
    public _positionService: PositionService,
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRoute: ActivatedRoute ) {
      activatedRoute.params.subscribe( params => {
      this.route = params['id'];
    });
  }

  ngOnInit() {
    this.employeeForm = new FormGroup({
      p_information: new FormGroup({
        name: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        firstSurname: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        secondSurname: new FormControl('', [
          Validators.required, 
          Validators.minLength(3)
        ]),
        gender: new FormControl('FEMENINO')
      }),
      w_information: new FormGroup({
        admission_date: new FormControl('', [
          Validators.required,
          Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
        ]),
        area: new FormControl('', Validators.required),
        cost_center: new FormControl('', Validators.required),
        position: new FormControl('', Validators.required),
        payroll_periodicity: new FormControl('QUINCENAL'),
        recruitment_scheme: new FormControl('MIXTO'),
        contract_type: new FormControl('DETERMINADO'),
        contract_termination_date: new FormControl('', [
          Validators.required,
          Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
        ]),
        immediate_boss: new FormControl(''),
        hasPerformanceBonus: new FormControl('true'),
        bonusRate: new FormControl('', Validators.required),
      }),
      email: new FormControl('', [
        Validators.required, 
        Validators.pattern('^[a-z0-9._]{3,}(@neixar\.com)(\.mx)?$')
      ]),
      id_saf: new FormControl('', [
        Validators.required,
        Validators.pattern("^(NXR|nxr)[0-9]{4,6}$")
      ]),
      id_neixar: new FormControl('', [
        Validators.required,
        Validators.min(1)
      ]),
      role: new FormControl('User', Validators.required),
      pass: new FormControl('', [
        Validators.required,
        //Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[|!"#$%&\/()=?\\¡¿{\[}\]+-.;,:~*]).{8,20}'),
        Validators.minLength(8),
        Validators.maxLength(20)
      ])
    });

    this.deleteForm = new FormGroup({
      "w_information.leaving_date": new FormControl('', [
        Validators.required, 
        Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
      ]),
      "w_information.leaving_cause": new FormControl('', Validators.required),
      "w_information.leaving_description": new FormControl('', Validators.required)
    });

    this.chooseInfo(this.route);
  }

  chooseInfo(type){
    switch(type) { 
      case "activos": { 
        this.getUsersByStatus('ACTIVO', 1);
        this.title = "Colaboradores Activos";
         break; 
      } 
      case "bajas": { 
        this.getUsersByStatus('BAJA', 1);
        this.title = "Bajas";
         break; 
      } 
      case "determinado": {
        this.getEmployeesByContract('DETERMINADO', 1);
        this.title = "Contratos Temporales";
         break;    
      } 
      case "indeterminado": { 
        this.getEmployeesByContract('INDETERMINADO', 1);
        this.title = "Contratos Indeterminados";
         break; 
      }  
      case "mujeres": { 
        this.getEmployeesByGender('FEMENINO', 1);
        this.title = "Mujeres";
        break; 
     }  
     case "hombres": { 
        this.getEmployeesByGender('MASCULINO', 1);
        this.title = "Hombres";
      break; 
     }  
     case "evaluacion": { 
      this.getUsersByStatus('ACTIVO', 1);
        this.title = "Evaluación de Desempeño";
      break; 
     }  
      default: { 
        // this.getUsersByStatus('ACTIVO', 1);
        // this.title = "Colaboradores Activos";
        this.router.navigateByUrl('/capital-humano');
         break;              
      } 
   }
  }

  /*
  * Verifica que tipo de contrato tiene y asigna validaciones a la fecha de finalización
  * del contrato.
  */
  checkContractType(type) {
    if (type === 'INDETERMINADO') {
      this.employeeForm.get('w_information.contract_termination_date').clearValidators();
      this.employeeForm.get('w_information.contract_termination_date').updateValueAndValidity();
    } else {
      this.employeeForm.get('w_information.contract_termination_date').setValidators([
        Validators.required,
        Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
      ]);
      this.employeeForm.get('w_information.contract_termination_date').updateValueAndValidity();
    }
  }

  /*
  * Verifica si se tiene el beneficio de bono y asigna validaciones a la proporción del bono
  */
 checkBonus(opc) {
  if (!opc) {
    this.employeeForm.get('w_information.bonusRate').clearValidators();
    this.employeeForm.get('w_information.bonusRate').updateValueAndValidity();
  } else {
    this.employeeForm.get('w_information.bonusRate').setValidators(Validators.required);
    this.employeeForm.get('w_information.bonusRate').updateValueAndValidity();
  }
}

  saveEmployee() {
    this.spinner.show();
    if (this.employeeForm.valid) {
      let employee = this.employeeForm.value;
      let admission = employee.w_information.admission_date;
      admission = moment(admission,'DD/MM/YYYY').toISOString();
      employee.w_information.admission_date = admission;
      if(employee.w_information.contract_termination_date){
        let contractEnd = employee.w_information.contract_termination_date;
        contractEnd = moment(contractEnd,'DD/MM/YYYY').toISOString();
        employee.w_information.contract_termination_date = contractEnd;
      }

      this._employeeService.saveEmployee( employee ).subscribe(
        res => {
          $('#NewEmployeeModal').modal('hide');
          this.getUsersByStatus('ACTIVO', 1);
          this.spinner.hide();
          this.resetForm();
          this.Toast.fire({
            type: 'success',
            title: 'Nuevo colaborador registrado correctamente.'
          });
        },
        err => {
          this.errorMessage = err.error.errors.message;
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Error al registrar colaborador.'
          });
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

  getUsersByStatus(status, page?) {
    this.spinner.show();
    this._employeeService.getEmployeesbyStatus(status, page).subscribe(
      res => {
        this.employees = res.data;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.pages = this._employeeService.getPages(res.totalPages, res.currentPage);
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  getEmployees() {
    this.spinner.show();
    this._employeeService.getEmployeesbyStatus('ACTIVO').subscribe(
      res => {
        this.employeesList = res.data;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  /*
 * Obtiene los empleados con contratos temporales
 */
getEmployeesByContract(type, page?) {
  this.spinner.show();
  this._employeeService.getEmployeesbyContract(type, page).subscribe(
    res => {
      this.employees = res.data;
      this.currentPage = res.currentPage;
      this.totalPages = res.totalPages;
      this.pages = this._employeeService.getPages(res.totalPages, res.currentPage);
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

/*
 * Obtiene los empleados por género
 */
getEmployeesByGender(gender, page?) {
  this.spinner.show();
  this._employeeService.getEmployeesbyGender(gender, page).subscribe(
    res => {
      this.employees = res.data;
      this.currentPage = res.currentPage;
      this.totalPages = res.totalPages;
      this.pages = this._employeeService.getPages(res.totalPages, res.currentPage );
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}
  
  requestEmployee( employee ) {
    this.employee = employee;
    this.deleteForm.reset();
    this.errorMessage = '';
    this.upImage = null;
    this.imagenTemp = null;
  }

  resetForm(){
    this.employeeForm.reset();
    this.errorMessage = '';
    this.employeeForm.patchValue({
      p_information:{
        gender: 'FEMENINO',
      },
      w_information:{
        payroll_periodicity: 'QUINCENAL',
        recruitment_scheme: 'MIXTO',
        contract_type: 'DETERMINADO'
      },
      role: 'User'
    });
  }

  confirmDeletion(id) {
    let date = this.deleteForm.controls['w_information.leaving_date'].value;
    let cause = this.deleteForm.controls['w_information.leaving_cause'].value;
    let description = this.deleteForm.controls['w_information.leaving_description'].value;
    date = moment(date,'DD/MM/YYYY').toISOString();

    let leavingObject = {
      "w_information.leaving_date": date,
      "w_information.contract_termination_date": date,
      "w_information.leaving_cause": cause,
      "w_information.leaving_description": description,
      "w_information.status": 'BAJA'
    }
    this.spinner.show();
    this._employeeService.deleteEmployee(id, leavingObject).subscribe(
      res => {
        this.getUsersByStatus('ACTIVO', 1);
        $('#DeleteEmployeeModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'El colaborador ha sido dado de baja.'
        });
      }, 
      err => {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al dar de baja colaborador.'
        });
      }
    );
  }

  changePass( id ){
    this.errorMessage = '';
    this.spinner.show();
    this._employeeService.resetPass(id).subscribe(
      res => {
        $('#passModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Contraseña restablecida exitosamente.'
        });
      }, 
      err => {
        this.errorMessage = 'La contraseña no pudo ser reestablecida.';
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'La contraseña no pudo ser reestablecida.'
        });
      }
    );
  }

  getDepartments() {
    this.spinner.show();
    this._departmentService.getDepartments().subscribe(
      res => {
        this.departments = res.data;
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  getPosition(depto) {
    this.spinner.show();
    this._positionService.getPositionsByDepartment(depto).subscribe(
      res => {
        this.positions = res.data;
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  getEmployeesByDepto(depto) {
    this.spinner.show();
    this._employeeService.getEmployeesbyDepartment(depto).subscribe(
      res => {
        this.employeesByDepto = res.data;
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  fillDropDowns(depto){
    this.getPosition(depto);
  }

  getData() {
    this.resetForm();
    this.getDepartments();
    this.getEmployees();
  }

/*
 * Obtiene los empleados por término de búsqueda
 */
searchEmployees(page?) {
  this.spinner.show();
  this._employeeService.search(this.term, page).subscribe(
    res => {
      this.employees = res.data;
      this.currentPage = res.currentPage;
      this.totalPages = res.totalPages;
      this.pages = this._employeeService.getPages(res.totalPages, res.currentPage );
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

  onKey(value) {
    this.spinner.show();
    this.term = value;
    if(value.length === 0){
      this.chooseInfo(this.route);
      this.isSearching = false;
    } else {
      this.searchEmployees(1);
      this.isSearching = true;
    }
  }

  seleccionImage( archivo: File ) {
    this.errorMessage = '';

    if( !archivo ){
      this.upImage = null;
      return;
    }

    if( archivo.type.indexOf('image') < 0 ){
      this.upImage = null;
      this.errorMessage = 'El archivo seleccionado no es una imagen.';
      return;
    }

    if( archivo.size > 2000000 ){
      this.errorMessage = 'La imagen debe ser menor de 2Mb';
      this.upImage = null;
      return;
    }

    this.upImage = archivo;
    let reader = new FileReader();
    let urlImagenTemp = reader.readAsDataURL( archivo );

    reader.onloadend = () => this.imagenTemp = reader.result;
  }

  saveImage() {
    this.spinner.show();
    this._uploadImageService.subirArchivo( this.upImage, this.employee._id )
    .then( resp =>{
      this.imagenTemp = null;
      this.chooseInfo(this.route);
      this.spinner.hide();
      $('#UpdateEmployeeModal').modal('hide');
      this.Toast.fire({
        type: 'success',
        title: 'Imagen guardada exitosamente.'
      });
    })
    .catch( err =>{
      this.spinner.hide();
      this.errorMessage = JSON.parse(err).message;
      this.Toast.fire({
        type: 'error',
        title: JSON.parse(err).message
      });
    });
  }

}
