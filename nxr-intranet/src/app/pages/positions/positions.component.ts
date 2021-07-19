import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PositionService, DepartmentsService, EmployeeService } from "../../services/sevice.index";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: "app-positions",
  templateUrl: "./positions.component.html"
})
export class PositionsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  positions: any[] = [];
  departments: any[] = [];
  total: number;
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  PositionForm: FormGroup;
  position: any;
  editForm: FormGroup;
  errorMessage: String;
  jobDescriptions: any[] = [];
  pagesJD: number[] = [];
  currentPageJD: number = 1;
  totalPagesJD: number = 1;

  constructor(
    public _positionService: PositionService,
    public _departmentService: DepartmentsService,
    public _employeeService: EmployeeService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.getPositions(1);
    this.getJobDescriptionToValidate( 1 );
    this.PositionForm = new FormGroup({
      job_key: new FormControl('', Validators.required),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      department: new FormControl('', Validators.required),
      career_key: new FormControl('', Validators.required),
      specialty: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      salary: new FormControl('', Validators.required)
    });
    this.editForm = new FormGroup({
      job_key: new FormControl('', Validators.required),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      department: new FormControl('', Validators.required),
      career_key: new FormControl('', Validators.required),
      specialty: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      salary: new FormControl('', Validators.required)
    });
  }

  getPositions(page) {
    this.spinner.show();
    this._positionService.getPositions(page).subscribe(
      res => {
        this.positions = res.data;
        this.total = res.total;
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

  savePosition() {
    this.spinner.show();
    if (this.PositionForm.valid) {
        this._positionService
          .savePosition(this.PositionForm.value)
          .subscribe(
            res => {
              $("#NewPositionModal").modal("hide");
              this.getPositions(1);
              this.errorMessage = "";
              this.spinner.hide();
              this.Toast.fire({
                type: 'success',
                title: 'Nuevo puesto registrado correctamente.'
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
    } else {
      this.errorMessage = "Información incompleta, todos los campos obligatorios deben estar llenos.";
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
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

  resetForm(){
    this.PositionForm.patchValue({
      job_key: '',
      name: '',
      department: '',
      career_key: '',
      specialty: '',
      type: '',
      salary: ''
    });
  }

  requestPosition(id) {
    this.getData();
    this.spinner.show();
    this._positionService.getPosition(id).subscribe(
      res => {
        this.position = res.data;
        
        this.editForm.patchValue({
          job_key: this.position.job_key || '',
          name: this.position.name || '',
          department: this.position.department._id || '',
          career_key: this.position.career_key || '',
          specialty: this.position.specialty || '',
          type: this.position.type || '',
          salary: this.position.salary || ''
        });
        $('#UpdatePositionModal').modal('show');
        this.spinner.hide();
      }, 
      err => {
        $('#UpdatePositionModal').modal('hide');
        this.spinner.hide();
      }
    );
  } 

  getData() {
    this.resetForm();
    this.errorMessage = '';
    this.getDepartments();
  }

  updatePosition(){

    this.spinner.show();
    if( this.editForm.valid ) {
    this._positionService.updatePosition(this.position._id, this.editForm.value)
    .subscribe(
      res => {        
        $('#UpdatePositionModal').modal('hide');
        this.getPositions( this.currentPage );
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Puesto actualizado.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Error al actualizar puesto.'
        });
      }
    )
    } else {
      this.spinner.hide();
      this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
    
  }

/********************************************************************
 ****** Esta función obtiene las descripciones de puesto por validar. *****
 *********************************************************************/
getJobDescriptionToValidate( page? ) {
  this.spinner.show();
  this._positionService.getJobDescriptionToValidate( page ).subscribe(
    res => {
      this.jobDescriptions =  res.data
      this.currentPageJD = res.currentPage;
      this.totalPagesJD = res.totalPages;
      this.pagesJD = this._employeeService.getPages(res.totalPages, res.currentPage);
      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}
  
}
