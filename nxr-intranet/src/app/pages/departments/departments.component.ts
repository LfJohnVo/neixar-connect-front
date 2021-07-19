import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AreasService, DepartmentsService, EmployeeService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styles: []
})
export class DepartmentsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  DepartmentForm: FormGroup;
  editForm: FormGroup;
  noData: string = 'Dato no registrado';
  errorMessage: string = '';
  departments: any[];
  department: any;
  employees: any[];
  total: number;
  areas: any[];
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    public _employeeService: EmployeeService,
    public _areaService: AreasService,
    public _departmentService: DepartmentsService,
    private spinner: NgxSpinnerService) { 
      this.getDepartments(1);
    }

  ngOnInit() {
    this.DepartmentForm =new FormGroup ({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      responsible: new FormControl(''),
      area: new FormControl('', Validators.required)
    });
    this.editForm =new FormGroup ({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      responsible: new FormControl(''),
      area: new FormControl('', Validators.required)
    });
  }

  /*
   * Esta función nos permite obtener datos de los empleados y
   * las áreas disponibles para mostrarlos en el modal
   */
  getData(){
    this.resetForm()
    this.getEmployees();
    this.getAreas();
  }

  getEmployees() {
    this.spinner.show();
    this._employeeService.getEmployeesbyStatus('ACTIVO').subscribe(
      res => {
        this.employees = res.data;
        this.spinner.hide();
      }, 
      err => {
        //$('#UpdateAreaModal').modal('hide');
        $('#NewDepartmentModal').modal('hide');
        this.spinner.hide();
      }
    );
  }

  getAreas() {
    this.spinner.show();
    this._areaService.getAreas().subscribe(
      res => {
        this.areas = res.data;
        this.spinner.hide();
      }, 
      err => {
        //$('#UpdateAreaModal').modal('hide');
        $('#NewDepartmentModal').modal('hide');
        this.spinner.hide();
      }
    );
  }

  getDepartments(page) {
    this.spinner.show();
    this._departmentService.getDepartments(page).subscribe(
      res => {
        this.departments = res.data;
        this.total = res.total;
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

  requestDepartment(id) {
    this.getData();
    this.spinner.show();
    this._departmentService.getDepartment(id).subscribe(
      res => {
        this.department = res.data;
        if( !this.department.responsible ) {
          this.editForm.patchValue({
            responsible: "",
          });
        } else {
          this.editForm.patchValue({
            responsible: this.department.responsible._id,
          });
        }
        this.editForm.patchValue({
          name: this.department.name,
          area: this.department.area._id
        });
        $('#UpdateDepartmentModal').modal('show');
        this.spinner.hide();
      }, 
      err => {
        $('#UpdateDepartmentModal').modal('hide');
        this.spinner.hide();
      }
    );
  }

  resetForm(){
    this.DepartmentForm.patchValue({
      name: '',
      responsible: '',
      area: ''
    });
  }

  saveDepartment() {
    this.spinner.show();
    if (this.DepartmentForm.valid) {
      this._departmentService.saveDepartment( this.DepartmentForm.value ).subscribe(
        res => {
          $('#NewDepartmentModal').modal('hide');
          this.getDepartments(1);
          this.resetForm()
          this.errorMessage = '';
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Nuevo departamento registrado correctamente.'
          });
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Error al registrar departamento.'
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

  updateDepartment(){
    this.spinner.show();
    this._departmentService.updateDepartment(this.department._id, this.editForm.value)
    .subscribe(
      res => {        
        $('#UpdateDepartmentModal').modal('hide');
        this.getDepartments(1);
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Departamento editado correctamente.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al editar departamento.'
        });
      }
    )
  }

}
