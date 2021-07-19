import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { EmployeeService, ConfigService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styles: []
})
export class ConfigurationsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  performanceEvalForm: FormGroup;
  jdValidationForm: FormGroup;
  employees: any[];  
  idConfigRegister: any;
  allocators: FormArray;
  recruiters: FormArray;

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public _employeeService: EmployeeService,
    public _configService: ConfigService
  ) { 
    this.getActiveUsersList();
  }

  ngOnInit() {
    this.performanceEvalForm = new FormGroup({
      performanceEvaluation: new FormGroup({
        firstPEstartDate: new FormControl('', [
          Validators.required
        ]), 
        firstPEendDate: new FormControl('', [Validators.required]),
        secondPEstartDate: new FormControl('', [Validators.required]),
        secondPEendDate: new FormControl('', [Validators.required]),
        shortSecondPEstartDate: new FormControl('', [Validators.required]), 
        shortSecondPEendDate: new FormControl('', [Validators.required]),
        ROstartDate: new FormControl('', [Validators.required]),
        ROendDate: new FormControl('', [Validators.required])
      })
    });

    this.jdValidationForm = new FormGroup({
      jobDescription: new FormGroup({
        rhValidation: new FormControl('', [Validators.required])
      }),
      requisition: new FormGroup({
        rhValidation: new FormControl('', [Validators.required]),
        doValidation: new FormControl('', [Validators.required]),
        dfValidation: new FormControl('', [Validators.required]),
        allocators:  this.fb.array([ this.createAllocator() ]),
        recruiters: this.fb.array([ this.createRecruiter() ])
      })
    });

  this.getDataConfiguration();
  }

  createAllocator(): FormGroup {
    return this.fb.group({
      allocatorId: ["", Validators.required]
    });
  }

  addAllocator() {
    this.allocators = this.jdValidationForm.get("requisition.allocators") as FormArray;
    this.allocators.push(this.createAllocator());
  }

  deleteAllocator(index) {
    this.allocators = this.jdValidationForm.get("requisition.allocators") as FormArray;
    this.allocators.removeAt(index);
  }

  createRecruiter(): FormGroup {
    return this.fb.group({
      recruiterId: ["", Validators.required]
    });
  }

  addRecruiter() {
    this.recruiters = this.jdValidationForm.get("requisition.recruiters") as FormArray;
    this.recruiters.push(this.createRecruiter());
  }

  deleteRecruiter(index) {
    this.recruiters = this.jdValidationForm.get("requisition.recruiters") as FormArray;
    this.recruiters.removeAt(index);
  }

getActiveUsersList() {
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

getDataConfiguration( ) {
  this.spinner.show();
  this._configService.getDataConfiguration().subscribe(
    res => {
      let performanceEvaluationConfig;
      let jobDescriptionValidationConfig;
      let requisitionConfig;
    
      if(res.length > 0) {
        performanceEvaluationConfig = res[0].performanceEvaluation || '';
        jobDescriptionValidationConfig = res[0].jobDescription || '';
        requisitionConfig = res[0].requisition || '';
        this.idConfigRegister = res[0]._id;
      }

      this.performanceEvalForm.patchValue({
        performanceEvaluation: {
          ROendDate: performanceEvaluationConfig.ROendDate || '',
          ROstartDate: performanceEvaluationConfig.ROstartDate || '',
          firstPEendDate: performanceEvaluationConfig. firstPEendDate || '',
          firstPEstartDate: performanceEvaluationConfig.firstPEstartDate || '',
          secondPEendDate: performanceEvaluationConfig.secondPEendDate || '',
          secondPEstartDate: performanceEvaluationConfig.secondPEstartDate || '',
          shortSecondPEendDate: performanceEvaluationConfig.shortSecondPEendDate || '',
          shortSecondPEstartDate: performanceEvaluationConfig.shortSecondPEstartDate || ''
        }
      });
      
      this.jdValidationForm.patchValue({
        jobDescription: {
          rhValidation: jobDescriptionValidationConfig.rhValidation._id || ''
        },
        requisition: {
          rhValidation: requisitionConfig.rhValidation._id || '',
          doValidation: requisitionConfig.doValidation._id || '',
          dfValidation: requisitionConfig.dfValidation._id || ''
        }
      });

    let allocators = this.jdValidationForm.get("requisition.allocators") as FormArray;
    while (allocators.length > 0) allocators.removeAt(0);
    
    if(requisitionConfig.allocators.length>0) {
        requisitionConfig.allocators.forEach(allocator => {

          allocators.push(
            this.fb.group({
                allocatorId: [allocator.allocatorId._id, Validators.required]
            })
          );
    
        });
      } else this.addAllocator();

    let recruiters = this.jdValidationForm.get("requisition.recruiters") as FormArray;
    while (recruiters.length > 0) recruiters.removeAt(0);
    
    if(requisitionConfig.recruiters.length>0) {
        requisitionConfig.recruiters.forEach(recruiter => {

          recruiters.push(
            this.fb.group({
                recruiterId: [recruiter.recruiterId._id, Validators.required]
            })
          );
    
        });
      } else this.addRecruiter();

      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

  saveConfig( type ) {
    this.spinner.show();
    
    if(type === 'performanceEvaluation') {
      if(this.performanceEvalForm.valid) {
        this._configService.updateDataConfiguration(this.idConfigRegister, this.performanceEvalForm.value).subscribe(
          res => {        
            this.getDataConfiguration();
            this.Toast.fire({
              type: 'success',
              title: 'Configuración de evaluación de desempeño actualizada.'
            });
          },
          err => {
            this.Toast.fire({
              type: 'error',
              title: 'Error al actualizar la configuración.'
            });
          }
        );
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
        });
      }
    } else {
      if(this.jdValidationForm.valid) {
        this._configService.updateDataConfiguration(this.idConfigRegister, this.jdValidationForm.value).subscribe(
          res => {        
            this.getDataConfiguration();
            this.Toast.fire({
              type: 'success',
              title: 'Configuración actualizada.'
            });
          },
          err => {
            this.Toast.fire({
              type: 'error',
              title: 'Error al actualizar la configuración.'
            });
          }
        );
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
        });
      }
    }
  }

}
