import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from "@angular/forms";
import { PositionService, EmployeeService, RecruitmentService } from 'src/app/services/sevice.index';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-requisition-form',
  templateUrl: './requisition-form.component.html',
  styles: []
})
export class RequisitionFormComponent implements OnInit {

  @Output() dataForm: EventEmitter<any> = new EventEmitter();
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  requisitionForm: FormGroup;
  interviewers: FormArray;
  errorMessage: String;
  departments: any[];
  positions: any[];
  employees: any[];
  selectedPosition: any;
  activeJobDescriptions: any[];
  area_leader: any;
  jobDescriptionVersion: any;
  isEdit:boolean = false;
  isOperations:boolean = false;
  requisitionId: string;
  requisition: any;

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public _positionService: PositionService,
    public _employeeService: EmployeeService,
    public _recruitmentService: RecruitmentService,
    public router: Router,
    public activatedRouter: ActivatedRoute
  ) { 
    this.isEdit = this.router.url.includes('editar');
    activatedRouter.params.subscribe( params => {
      if( this.isEdit ) {
        if( params['id'] ) {
          this.requisitionId = params['id'];
        } else {
          this.requisitionId = '' ;
        }
      } 
    });
  }

  ngOnInit() {
    this.requisitionForm = new FormGroup({
      interviewers:  this.fb.array([ this.createInterviewer() ]),
      position: new FormGroup({
        positionId: new FormControl('', Validators.required)
      }),
      contract: new FormGroup({
        type: new FormControl("", Validators.required)
      }),
      work_shift: new FormControl("", Validators.required),
      vacancies: new FormControl("0", [
        Validators.required,
        Validators.min(1)
      ]),
      job_description: new FormControl("", Validators.required),
      age: new FormControl("", Validators.required),
      gender: new FormControl('Indistinto', Validators.required),
      causes: new FormControl("", Validators.required), 
      technical_test: new FormControl('true', Validators.required),
      travel: new FormControl("false", Validators.required),
      change_home: new FormControl("false", Validators.required),
      passport: new FormControl("false", Validators.required),
      equipment: new FormControl('', Validators.required),
      software: new FormControl('', Validators.required),
      email: new FormControl('com', Validators.required),
      mobile: new FormControl("false", Validators.required),
      access_card: new FormControl("false", Validators.required),
      systems_to_use: new FormControl('', Validators.required),
      access_type: new FormControl('', Validators.required),
      comments: new FormControl('')
    });

    this.getRequisitorInformation();
  }

  getRequisitorInformation() {
    this.spinner.show();
    this._employeeService.getEmployee( this._employeeService.user._id ).subscribe(
      res => {
        let requisitorArea = res.w_information.area.area
        this.defineValidatorByArea( requisitorArea );
      }, err => {
        // Ejecutar función que saca de la ruta y muestra mensaje
        this.spinner.hide();
      }
    );
  }
  
  defineValidatorByArea( requisitorArea ) {
    let areaName = requisitorArea.name.toLowerCase();
    let responsibleArea = requisitorArea.responsible;

    if( !areaName.includes('operaciones') ) {
      this.area_leader = {
        areaLeaderId: responsibleArea._id,
        areaLeaderName: `${responsibleArea.p_information.name} ${responsibleArea.p_information.firstSurname} ${responsibleArea.p_information.secondSurname}`,
        areaLeaderEmail: responsibleArea.email,
        areaLeaderPosition: responsibleArea.w_information.position.name
      };      
    } else {
      this.area_leader = null;      
    }
    
    this.getInformationForRequisition();
  }

  getInformationForRequisition() {
    let servicesToConsume = [
      this._positionService.getPositionsWithActiveJobDescriptions(),
      this._employeeService.getEmployeesbyStatus('ACTIVO')
    ];

    forkJoin( servicesToConsume ).subscribe( 
      responses => {
      this.positions = responses[0].data;
      this.employees = responses[1].data;
    
      if( this.isEdit )
        this.getPersonnelRequisition( this.requisitionId );
      else
        this.spinner.hide();
    
      }, err => {
      this.spinner.hide();
    });
  }

  getPersonnelRequisition( requisitionId ) {
    this._recruitmentService.getRequisition( requisitionId ).subscribe(
      res => {
        this.requisition = res.data[0];
        let positionId = res.data[0].position.positionId;
        this.getSelectedPosition( positionId );
        this.setFormData();
        this.spinner.hide();
      }, 
      err => {
        this.spinner.hide();
      }
    );
  }

  getSelectedPosition( positionId ) {
    this.selectedPosition = this.positions.find( position => position._id === positionId );
    this.getActiveJobDescriptionsFilter(this.selectedPosition.jobDescription);
  }

  getActiveJobDescriptionsFilter( jobDescriptions ) {
    this.activeJobDescriptions = 
      jobDescriptions.filter( jobDescription => jobDescription.status === 'Vigente' )
                              .map( activeJobDescription => {
                                return { _id: activeJobDescription._id, version: activeJobDescription.version } 
                              });

    if(this.isEdit) {
      let jobDescSelected = this.activeJobDescriptions
                                             .map( jobDesc => jobDesc.version )
                                             .indexOf( this.requisition.job_description.job_descriptionName );
      
      this.requisitionForm.patchValue({
        job_description: jobDescSelected
      });

      this.getJobDescriptionVersion(jobDescSelected);
    }
  }

  getJobDescriptionVersion( index ) {
    let jobDesc = this.activeJobDescriptions[index];
    this.jobDescriptionVersion = {
      job_descriptionId: jobDesc._id,
      job_descriptionName: jobDesc.version
    };
  }

  createInterviewer(): FormGroup {
    return this.fb.group({
      interviewer: ["", Validators.required],
      interviewerName: ["", Validators.required],
      interviewerPosition: ["", Validators.required]
    });
  }

  addInterviewer() {
    this.interviewers = this.requisitionForm.get("interviewers") as FormArray;
    this.interviewers.push(this.createInterviewer());
  }

  deleteInterviewer(index) {
    this.interviewers = this.requisitionForm.get("interviewers") as FormArray;
    this.interviewers.removeAt(index);
  }

  requestContractPeriodIfNotIndeterminate( contractType ) {
    let contractForm = this.requisitionForm.get('contract') as FormGroup;
    if( contractType === 'Indeterminado') {
      contractForm.removeControl('period');
    } else {
      contractForm.addControl('period', new FormControl('', [
        Validators.required,
        Validators.min(1)]
        ));
    }
  }

  requestSpecificCause( cause ) {
    if( cause != 'Puesto nuevo' )
      this.requisitionForm.addControl('specific_cause', new FormControl('', Validators.required));
    else
      this.requisitionForm.removeControl('specific_cause');
  }

  setCompleteInterviewerData( interviewerId, index ) {
    this.interviewers = this.requisitionForm.get("interviewers") as FormArray;
    let selectedPerson = this.employees.find(person => person._id === interviewerId);
    this.interviewers.at(index).patchValue({
      interviewerName: `${selectedPerson.p_information.name} ${selectedPerson.p_information.firstSurname} ${selectedPerson.p_information.secondSurname}`,
      interviewerPosition: `${selectedPerson.w_information.position.name}`
    });
  }

  requestPhoneService( isNeeded ) { 
    if( isNeeded )
      this.requisitionForm.addControl('phone_service', new FormControl('Básico', Validators.required));
    else 
      this.requisitionForm.removeControl('phone_service');
  }

  finishBuildingRequestData() {
    let formData = this.requisitionForm.value;
    let currentUser = this._employeeService.user;
    
    if( this.requisitionForm.valid ) {
      formData.position.positionName = this.selectedPosition.name;
      formData.position.positionType = this.selectedPosition.type;
      formData.job_description = this.jobDescriptionVersion;
      formData.salary = this.selectedPosition.salary;
      if(!this.isEdit) {
      formData.petitioner = {
        petitionerId: currentUser._id,
        petitionerName: `${currentUser.p_information.name} ${currentUser.p_information.firstSurname} ${currentUser.p_information.secondSurname}`,
        petitionerPosition: currentUser.w_information.position.name,
        petitionerDepartment: currentUser.w_information.area.name
      };      
    } else {
      formData._id = this.requisitionId;
    }
      if(this.area_leader){
        formData.area_leader = this.area_leader;
      }
      this.dataForm.emit( formData );
    } else {
      this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
  }

  setFormData() {
    this.requestContractPeriodIfNotIndeterminate( this.requisition.contract.type );
    this.requestSpecificCause( this.requisition.causes );
    this.requestPhoneService( this.requisition.mobile );
    this.requisitionForm.patchValue({
      position: {
        positionId: this.requisition.position.positionId || ''
      },
      contract: {
        type: this.requisition.contract.type || '',
        period: this.requisition.contract.period || ''
      },
      work_shift: this.requisition.work_shift || '',
      vacancies: this.requisition.vacancies || '',
      age: this.requisition.age,
      gender: this.requisition.gender,
      causes: this.requisition.causes, 
      specific_cause: this.requisition.specific_cause,
      technical_test: this.requisition.technical_test.toString(),
      travel: this.requisition.travel.toString(),
      change_home: this.requisition.change_home.toString(),
      passport: this.requisition.passport.toString(),
      equipment: this.requisition.equipment,
      software: this.requisition.software,
      email: this.requisition.email,
      mobile: this.requisition.mobile.toString(),
      phone_service: this.requisition.phone_service,
      access_card: this.requisition.access_card.toString(),
      systems_to_use: this.requisition.systems_to_use,
      access_type: this.requisition.access_type,
      comments: this.requisition.comments || ''
    });

      let interviewers = this.requisitionForm.get("interviewers") as FormArray;
      while (interviewers.length > 0) interviewers.removeAt(0);

      if(this.requisition.interviewers.length>0) {
      this.requisition.interviewers.forEach( interviewer => {
        interviewers.push(
          this.fb.group({
            interviewer: [interviewer.interviewer, Validators.required],
            interviewerName: [interviewer.interviewerName, Validators.required],
            interviewerPosition: [interviewer.interviewerPosition, Validators.required]
          })
        );
      });
    }
  }

}
