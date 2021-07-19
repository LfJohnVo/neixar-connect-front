import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AreasService, EmployeeService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styles: []
})
export class AreasComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  areaForm: FormGroup;
  editForm: FormGroup;
  noData: string = 'Dato no registrado';
  errorMessage: String;
  areas: any[];
  total: number;
  area: any;
  employees: any[];
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    public _employeeService: EmployeeService,
    public _areasService: AreasService,
    private spinner: NgxSpinnerService) { 
      this.getAreas(1);      
    }

  ngOnInit() {
    this.areaForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      responsible: new FormControl('')
    });
    this.editForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      responsible: new FormControl('')
    });
  }

  saveArea() {
    this.spinner.show();
    if (this.areaForm.valid) {
      this._areasService.saveArea( this.areaForm.value ).subscribe(
        res => {
          $('#NewAreaModal').modal('hide');
          this.getAreas(1);
          this.areaForm.reset();
          this.errorMessage = '';
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Nueva área registrada correctamente.'
          });
        },
        err => {
          this.errorMessage = err.error.message;
          this.spinner.hide();
          this.Toast.fire({
            type: 'error',
            title: 'Error al registrar área.'
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

  getAreas(page) {
    this.spinner.show();
    this._areasService.getAreas(page).subscribe(
      res => {
        this.areas = res.data;
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
  
  requestArea( id ) {
    this.getUsers();
    this.spinner.show();
    this._areasService.getArea(id).subscribe(
      res => {
        this.area = res.data;
        if( !this.area.responsible ) {
          this.area.responsible = '';
        }
        this.editForm.patchValue({
          name: this.area.name,
          responsible: this.area.responsible._id
        });
        $('#UpdateAreaModal').modal('show');
        this.spinner.hide();
      }, 
      err => {
        $('#UpdateAreaModal').modal('hide');
        this.spinner.hide();
      }
    );
  }

  updateArea( ) {
    this.spinner.show();
    this._areasService.updateArea(this.area._id, this.editForm.value)
    .subscribe(
      res => {        
        $('#UpdateAreaModal').modal('hide');
        this.getAreas(1);
        this.spinner.hide();
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
      }
    )
  }

  getUsers() {
    this.spinner.show();
    this._employeeService.getEmployeesbyStatus('ACTIVO').subscribe(
      res => {
        this.employees = res.data;
        this.spinner.hide();
      }, 
      err => {
        $('#UpdateAreaModal').modal('hide');
        $('#NewAreaModal').modal('hide');
        this.spinner.hide();
      }
    );
  }

}
