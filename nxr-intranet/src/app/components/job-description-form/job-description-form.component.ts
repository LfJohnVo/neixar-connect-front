import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GLOBAL } from '../../config';
import { NgxSpinnerService } from 'ngx-spinner';
import { PositionService, DepartmentsService, EmployeeService, CompetenciesService } from '../../services/sevice.index';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as moment from "moment";

@Component({
  selector: 'app-job-description-form',
  templateUrl: './job-description-form.component.html',
  styles: []
})
export class JobDescriptionFormComponent implements OnInit {

  @Output() dataForm: EventEmitter<any> = new EventEmitter();
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  
  isEdit:boolean = false;
  isHR: boolean = false;
  actionType: 'NPUESTO' | 'NVERSION' = 'NVERSION';
  typeForm: FormGroup;
  descriptionForm: FormGroup;
  subordinates: FormArray;
  responsabilities: FormArray;
  functions: FormArray;
  experience: FormArray;
  softwareAndTools: FormArray;
  organizationalCompetencies: FormArray;
  specificCompetencies: FormArray;
  positions: any[];
  allowedPositions: any[];
  departments: any[];
  employees: any[];
  hasEmp = false;
  specCompNum: number = 6;
  specComp: string[] = GLOBAL.strategic;
  errorMessage: String;
  total: number = 0;
  positionId: String = '';
  position: String;
  jobDescID: String;
  jobDescription: any;
  arrayComp: any[] = [];
  orgCompetencies: any[] = [];
  speCompetencies: any[] = [];
  typePosition: string; 
  
  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    private fb: FormBuilder,
    public _positionService: PositionService,
    public _departmentService: DepartmentsService,
    public _employeeService: EmployeeService,
    public activatedRouter: ActivatedRoute,
    public _competenciesService: CompetenciesService
  ) { 
    this.isEdit = this.router.url.includes('editar');
    activatedRouter.params.subscribe( params => {
    
      if( !this.isEdit ) { // Crear una nueva DP
        if( params['id'] ) {
          this.isHR = true;
          this.positionId = params['id'];
          this.getPos( params['id'] );
          this.getUsers();
        } else {
          this.isHR = false;
          this.positionId = '' ;
          this.getDepartments();
        }
      } else { // Editar DP
        this.jobDescID = params['id'];
        this.isHR = true;
        this.getUsers();
        //this.getJobDescription( params['id'] );
      }

    });
  }

  ngOnInit() {
    this.getPosition();
    this.typeForm = new FormGroup({
      type: new FormControl('NVERSION', Validators.required)
    })
    this.descriptionForm = new FormGroup({
      position: new FormControl('', Validators.required),
      jobDescription: new FormGroup({
        version: new FormControl(moment().format('YYYYMMDD'), Validators.required),
        elaboratedBy: new FormControl('', Validators.required),
        immediate_boss: new FormControl('', Validators.required),
        subordinates: this.fb.array([ ]),
        mission: new FormControl('Llevar a cabo todas las adecuaciones, cambios y/o modificaciones en el flujo de procesos que se tengan programados en la operación del WLA, mediante un correcto análisis, para la automatización de las tareas y flujos de trabajo.', Validators.required),
        responsabilities: this.fb.array([ this.createResponsability(), this.createResponsability(), this.createResponsability() ]),
        minimumEducation: new FormControl('Pasante en Sistemas Computacionales, en Informática, Telecomunicaciones o a fin.', Validators.required),
        desirableEducation: new FormControl('Licenciatura o Ingeniería en Sistemas Computacionales, en Informática, Telecomunicaciones o a fin.', Validators.required),
        minimumEnglish: new FormControl('Básico', Validators.required),
        desirableEnglish: new FormControl('Intermedio', Validators.required),
        experience: this.fb.array([ this.createExperience() ]),
        softwareAndTools: this.fb.array([ this.createSoftwareTools() ]),
        organizationalCompetencies: this.fb.array([]),
        specificCompetencies: this.fb.array([ ])
      })
    });
    
    // Conteo de responsabilidades
    this.descriptionForm.get("jobDescription.responsabilities").valueChanges
    .subscribe( responsability => {
      this.total = responsability.reduce( (acc, curr) => {
        return acc + curr.weighing;
      }, 0);
    });

    if( this.isEdit )
    this.getJobDescription( this.jobDescID );
  }

/*****************************************************
****** Esta función obtiene los puestos disponibles. *****
******************************************************/
getPosition() {
  this.spinner.show();
  this._positionService.getPositions().subscribe(
    res => {
      // Valida que exista un tipo de puesto asignado (Sirve para definir el # de competencias)
      this.allowedPositions = res.data.filter( pos => pos.type );
      this.positions = res.data;
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

/**********************************************************
  ****** Esta función permite obtener la DP seleccionada *****
  *********************************************************/
 getJobDescription( id ) {
  this.spinner.show();
  this._positionService.getJobDescription( id ).subscribe(
    res => {

      if( this.isEdit ) this.checkPosType( res.data[0].type );
      this.descriptionForm.removeControl('position');
      this.jobDescription = res.data[0].jobDescription[0];
      this.position = res.data[0].name;
      this.typePosition = res.data[0].type;
      this.setData();

      this.spinner.hide();
    },
    err => {
      this.spinner.hide();
    }
  );
}

/*****************************************************
****** Esta función obtiene los empleados disponibles. *****
******************************************************/
getUsers() {
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

/*****************************************************
****** Esta función obtiene el puesto solicitado. *****
******************************************************/
getPos( id ) {
  this.spinner.show();
  this._positionService.getPosition( id ).subscribe(
    res => {
      this.position = res.data.name;
      this.descriptionForm.removeControl('position');
      this.checkPosType( res.data.type || 'default' );
      this.spinner.hide();
      this.getCompetenciesByTypePosition( res.data.type );
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

/*****************************************************
****** Esta función obtiene los deptos disponibles. *****
******************************************************/
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

/***************************************************************
****** Esta función obtiene el tipo de puesto del seleccionado. *****
****************************************************************/
changePosition( i ) {
  let position = this.allowedPositions[i];
  this.position = position.name;
  this.checkPosType( position.type ? position.type : 'default' );
  this.getCompetenciesByTypePosition( position.type );
  this.arrayComp = [];
}

getCompetenciesByTypePosition( typePosition ) {
  this.spinner.show();
  this._competenciesService.getCompetenciesByTypePosition( typePosition ) .subscribe(
    res => { 
       this.orgCompetencies = res.data.filter( comp => { return comp.type === "Organizacionales"} );
       this.speCompetencies = res.data.filter( comp => comp.type === "Específicas" );
       let org = this.descriptionForm.get("jobDescription.organizationalCompetencies") as FormArray;
        while (org.length > 0) org.removeAt(0);
       this.addOrgCompetences();
       if(this.isEdit) {
        let org = this.descriptionForm.get("jobDescription.organizationalCompetencies") as FormArray;
        while (org.length > 0) org.removeAt(0);
        let spec = this.descriptionForm.get("jobDescription.specificCompetencies") as FormArray;
        while (spec.length > 0) spec.removeAt(0);
        if(this.jobDescription.organizationalCompetencies.length>0) {
          this.jobDescription.organizationalCompetencies.forEach(element => {
            org.push(
              this.fb.group({
                competition: [element.competition._id || "", Validators.required],
                level: [element.level, Validators.required]
              })
            );
          });
        } else this.addOrgCompetences();
      
        if(this.jobDescription.specificCompetencies.length>0) {
          this.jobDescription.specificCompetencies.forEach(element => {
            spec.push(
              this.fb.group({
                competition: [element.competition._id || "", Validators.required],
                level: [element.level, Validators.required]
              })
            );
          });
        } else this.addOrgCompetences();
        
        this.arrayComp = this.jobDescription.specificCompetencies.map( x => x.competition._id);
       }
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

/****************************************************
    ****** VALIDACIONES SEGÚN TIPO DE REQUISICIÓN *****
    ***************************************************/
   checkType( type ) {
    this.actionType = type;

    if( type === 'NVERSION' ) {
      
      this.descriptionForm.removeControl('department');
      this.descriptionForm.removeControl('name');
      this.descriptionForm.removeControl('type');

      this.descriptionForm.addControl('position', new FormControl('', Validators.required));  

    } else if( type === 'NPUESTO' ) {

      this.descriptionForm.removeControl('position');

      this.descriptionForm.addControl('department', new FormControl('', Validators.required));
      this.descriptionForm.addControl('name', new FormControl('', Validators.required));
      this.descriptionForm.addControl('type', new FormControl('', Validators.required));

    }
  }

  /******************************************************
    ****** VALIDACIONES SI CUENTA CON SUBORDINADOS *****
    ******************************************************/
   checkEmp( hasEmp ) {
    if( hasEmp ) {
      this.addSubordinate();
    } 
    if( !hasEmp ){
      this.hasEmp = false;
      this.subordinates = this.descriptionForm.get("jobDescription.subordinates") as FormArray;
      
      while (this.subordinates.length !== 0) {
        this.subordinates.removeAt(0);
      }

    }
  }

  /***************************************************************************
    ****** DEFINE NÚM DE COMPETENCIAS ESPECÍFICAS SEGÚN TIPO DE PUESTO *****
    ***************************************************************************/
   checkPosType( type ) {
    this.specificCompetencies = this.descriptionForm.get("jobDescription.specificCompetencies") as FormArray;
      
      while (this.specificCompetencies.length !== 0) {
        this.specificCompetencies.removeAt(0);
      }

    if( type === 'Estratégico' ) {
      this.specCompNum = 10;
    } else if( type === 'Táctico' ){
      this.specCompNum = 8;
    } else if( type === 'Operativo' ) {
      this.specCompNum = 6;
    } else {
      this.specCompNum = 6
    }
    this.getCompetenciesByTypePosition(type);
    this.addSpecCompetences(this.specCompNum);
  }

  /*************************************************
    ****** DEFINICIÓN DE SUBORDINADOS DIRECTOS *****
    **************************************************/
   createSubordinate(): FormGroup {
    return this.fb.group({
      position: ["", Validators.required]     
    });
  }
  
  /*******************************************************
  ****** Esta función agrega un subordinado al arreglo. *****
  ********************************************************/
  addSubordinate() {
    this.subordinates = this.descriptionForm.get("jobDescription.subordinates") as FormArray;
    this.subordinates.push(this.createSubordinate());
  }
  
  /********************************************************
  ****** Esta función elimina un subordinado al arreglo. *****
  *********************************************************/
  deleteSubordinate(index) {
    this.subordinates = this.descriptionForm.get("jobDescription.subordinates") as FormArray;
    this.subordinates.removeAt(index);
  }

  /**********************************************
    ****** DEFINICIÓN DE RESPONSABILIDADES *****
    *********************************************/
   // Esta función crea el formulario para un colaborador.
   createResponsability(): FormGroup {
    return this.fb.group({
      responsability: ["Diseñar y crear los programas que ejecuten las tareas de los flujos de trabajo.", Validators.required],
      weighing: [0, [Validators.required, Validators.min(1), Validators.max(100)] ],
      kpi: ['Implementar de manera correcta el 100% de las peticiones para la automatización de tareas', Validators.required],
      functionsDescription: this.fb.array([ this.createFunction() ])
    });
  }

  /************************************************************
  ****** Esta función agrega una responsabilidad al arreglo. *****
  *************************************************************/
 addResponsability() {
  this.responsabilities = this.descriptionForm.get("jobDescription.responsabilities") as FormArray;
  this.responsabilities.push(this.createResponsability());
}

/********************************************************
****** Esta función elimina una responsabilidad al arreglo. *****
*************************************************************/
deleteResponsability(index) {
  this.responsabilities = this.descriptionForm.get("jobDescription.responsabilities") as FormArray;
  this.responsabilities.removeAt(index);
}

  /**********************************************************
    ****** DEFINICIÓN DE FUNCIONES POR RESPONSABILIDAD *****
    **********************************************************/
   // Esta función crea el formulario para un colaborador.
   createFunction(): FormGroup {
    return this.fb.group({
      function: ["Crear Jobs que realicen la tarea o flujo de trabajo", Validators.required],
      authority:  ["Elaborar en la herramienta de WLA las tareas, folders, calendarios, recursos, condiciones y acciones.", Validators.required],
      interaction:  ["Las áreas de Servicios administrados (mesa de servicio), para el seguimiento de los tickets; así como de Fábrica de Software para desarrollos nuevos.", Validators.required]
    });
  }

  /****************************************************
  ****** Esta función agrega una función al arreglo. *****
  *****************************************************/
 addFunction( control ) {
  control.push(this.createFunction());
}

/****************************************************
****** Esta función elimina una función al arreglo. *****
*****************************************************/
deleteFunction( control, index ) {  
  control.removeAt(index);
}

 /***************************************
    ****** DEFINICIÓN DE EXPERIENCIA *****
    **************************************/
   // Esta función crea el formulario para registrar experiencia.
   createExperience(): FormGroup {
    return this.fb.group({
      minimumRequire: ["Diseño y planificación de Flujos de procesos", Validators.required],
      timeRequire: ["1 año", Validators.required],
      desirable: ["Diseño y planificación de Flujos WLA", Validators.required],
      timeDesirable: ["2 años", Validators.required]
    });
  }
  
  /*******************************************************
  ****** Esta función agrega una experiencia al arreglo. *****
  ********************************************************/
  addExperience() {
    this.experience = this.descriptionForm.get("jobDescription.experience") as FormArray;
    this.experience.push(this.createExperience());
  }
  
  /********************************************************
  ****** Esta función elimina una experiencia al arreglo. *****
  *********************************************************/
  deleteExperience(index) {
    this.experience = this.descriptionForm.get("jobDescription.experience") as FormArray;
    this.experience.removeAt(index);
  }

  /*****************************************************
    ****** DEFINICIÓN DE SOFTWARE Y HERRAMIENTAS *****
    *****************************************************/
   // Esta función crea el formulario para registrar experiencia.
   createSoftwareTools(): FormGroup {
    return this.fb.group({
      minimumKnowledge: ["Sistemas Operativos Unix/Linux", Validators.required],
      levelOfKnowledge: ["Medio", Validators.required],
      desirableKnowledge: ["Desarrollo de Scripts (Shell y bat)", Validators.required],
      levelDesirable: ["Avanzado", Validators.required]
    });
  }
  
  /******************************************************************
  ****** Esta función agrega un software o herramienta al arreglo. *****
  ******************************************************************/
  addSofwareTool() {
    this.softwareAndTools = this.descriptionForm.get("jobDescription.softwareAndTools") as FormArray;
    this.softwareAndTools.push(this.createSoftwareTools());
  }
  
  /******************************************************************
  ****** Esta función elimina un software o herramienta al arreglo. *****
  *******************************************************************/
  deleteSofwareTool(index) {
    this.softwareAndTools = this.descriptionForm.get("jobDescription.softwareAndTools") as FormArray;
    this.softwareAndTools.removeAt(index);
  }

  /***********************************************************
    ****** DEFINICIÓN DE COMPETENCIAS ORGANIZACIONALES *****
    **********************************************************/
   createOrgCom( competence? ): FormGroup {
    return this.fb.group({
      competition: [competence || "", Validators.required],
      level: ["", Validators.required]
    });
  }

  /***************************************************************
  ****** Esta función agrega las competencias organizacionales. *****
  ****************************************************************/
 addOrgCompetences() {

  this.organizationalCompetencies = this.descriptionForm.get("jobDescription.organizationalCompetencies") as FormArray;
  let competencies =  this.orgCompetencies;

  for (const com of competencies) {
    this.organizationalCompetencies.push(this.createOrgCom( com._id ));
  }

}

  /**********************************************************
  ****** Esta función agrega las competencias específicas. *****
  ***********************************************************/
 addSpecCompetences( index ) {
  this.specificCompetencies = this.descriptionForm.get("jobDescription.specificCompetencies") as FormArray;

  for (let i = 0; i < index; i++) {
    this.specificCompetencies.push(this.createOrgCom()); 
  }
}

/*****************************************************************************************
****** Esta función actualiza arreglo de competencias seleccionadas para hacer DISABLED. *****
******************************************************************************************/
changeComp( i ) {
  let spec = this.descriptionForm.get("jobDescription.specificCompetencies") as FormArray;
  this.arrayComp = spec.value.map( x => x.competition);
}

  /******************************************************
  ****** Esta función obtiene los datos del formulario. *****
  *******************************************************/
 getFormData() {
  if( !this.isHR ) {
    this.descriptionForm.get('jobDescription.elaboratedBy').clearValidators();
    this.descriptionForm.get('jobDescription.elaboratedBy').updateValueAndValidity();
  }

  if( this.descriptionForm.valid ) {
    if (this.total < 100 || this.total > 100) {
      this.errorMessage = "El porcentaje total de ponderación de responsabilidades clave debe ser igual a 100.";
      this.spinner.hide();
    } else {
      let dataForm = this.descriptionForm.value;
      if( !this.isEdit ) {
      if( this.actionType === 'NVERSION' ) {

        let position = this.isHR ? this.positionId : this.allowedPositions[ dataForm.position ]._id;
        let data = dataForm.jobDescription;
        if( !this.isHR ) data.elaboratedBy = this._employeeService.user._id;
        let payload: any = {
          actionType: this.actionType,
          positionId: position,
          positionName: this.position,
          data: data
        };
        
        this.dataForm.emit( payload );
      }
  
      if( this.actionType === 'NPUESTO' ) {
        let jobDesData = dataForm.jobDescription;
        jobDesData.elaboratedBy = this._employeeService.user._id;
        
        let payload: any = {
          actionType: this.actionType,
          positionName: dataForm.name,
          data: {
                      name: dataForm.name,
                      department: dataForm.department,
                      type: dataForm.type,
                      jobDescription: [ jobDesData ]
          }
        }
        
        this.dataForm.emit( payload );
      }
      } else {
        
        let data = dataForm.jobDescription;
        data.elaborationDate = this.jobDescription.elaborationDate;
        let payload: any = {
          jobDescId: this.jobDescID,
          positionName: this.position,
          description: data
        };
        this.dataForm.emit( payload );
      }

    }

  } else {
    this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';    
    this.Toast.fire({
      type: 'error',
      title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
    });
  }
 }

  /******************************************************************************
  ****** Esta función agrega los datos de la DP en el formulario para su edición. *****
  *******************************************************************************/
 setData( ) {
  this.descriptionForm.patchValue({ 
    jobDescription: {
      version: this.jobDescription.version || '',
      elaboratedBy: this.jobDescription.elaboratedBy._id || '',
      immediate_boss: this.jobDescription.immediate_boss._id || '',
      mission: this.jobDescription.mission || '',
      minimumEducation: this.jobDescription.minimumEducation || '',
      desirableEducation: this.jobDescription.desirableEducation || '',
      minimumEnglish: this.jobDescription.minimumEnglish || '',
      desirableEnglish: this.jobDescription.desirableEnglish || ''
    }
  });
  
  this.getCompetenciesByTypePosition(this.typePosition);

  let sub = this.descriptionForm.get("jobDescription.subordinates") as FormArray;
  while (sub.length > 0) sub.removeAt(0);
  let resp = this.descriptionForm.get("jobDescription.responsabilities") as FormArray;
  while (resp.length > 0) resp.removeAt(0);
  let exp = this.descriptionForm.get("jobDescription.experience") as FormArray;
  while (exp.length > 0) exp.removeAt(0);
  let soft = this.descriptionForm.get("jobDescription.softwareAndTools") as FormArray;
  while (soft.length > 0) soft.removeAt(0);

  if(this.jobDescription.subordinates.length>0) {
    this.jobDescription.subordinates.forEach(element => {
      this.hasEmp = true;
      sub.push(
        this.fb.group({
           position: [element.position._id, Validators.required]     
        })
      );
    });
  } else this.checkEmp( false );

  if(this.jobDescription.responsabilities.length>0) {
    this.jobDescription.responsabilities.forEach(element => {

      let functionsArray =  this.fb.array([]);
      element.functionsDescription.forEach(func => {
        functionsArray.push(
          this.fb.group({
            function: [func.function, Validators.required],
            authority:  [func.authority, Validators.required],
            interaction:  [func.interaction, Validators.required]
          })
        );
      });

      resp.push(
        this.fb.group({
          responsability: [element.responsability, Validators.required],
          weighing: [parseInt(element.weighing), [Validators.required, Validators.min(1), Validators.max(100)] ],
          kpi: [element.kpi, Validators.required],
          functionsDescription: functionsArray
        })
      );

    });
  } else this.addResponsability();

  if(this.jobDescription.experience.length>0) {
    this.jobDescription.experience.forEach(element => {
      exp.push(
        this.fb.group({
           minimumRequire: [element.minimumRequire, Validators.required],
           timeRequire: [element.timeRequire, Validators.required],
           desirable: [element.desirable, Validators.required],
           timeDesirable: [element.timeDesirable, Validators.required]
        })
      );
    });
  } else this.addExperience()   

  if(this.jobDescription.softwareAndTools.length>0) {
    this.jobDescription.softwareAndTools.forEach(element => {
      soft.push(
        this.fb.group({
          minimumKnowledge: [element.minimumKnowledge, Validators.required],
          levelOfKnowledge: [element.levelOfKnowledge, Validators.required],
          desirableKnowledge: [element.desirableKnowledge, Validators.required],
          levelDesirable: [element.levelDesirable, Validators.required]
        })
      );
    });
  } else this.addSofwareTool();
  
}

}
