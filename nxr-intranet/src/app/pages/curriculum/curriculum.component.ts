import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { EmployeeService, CurriculumService } from 'src/app/services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-curriculum',
  templateUrl: './curriculum.component.html',
  styleUrls: []
})
export class CurriculumComponent implements OnInit {

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  cvForm: FormGroup;
  certifications: FormArray;
  courses: FormArray;
  soft_skills: FormArray;
  technical_abilities: FormArray;
  languages: FormArray;
  working_experience: FormArray;
  activities: FormArray;
  professional_license: Boolean = false;
  user = this._employeeService.user;
  softSkills = [
    'Calidad',
    'Orientación al Logro',
    'Iniciativa',
    'Trabajo en Equipo',
    'Planeación y Organización',
    'Liderazgo', 'Comunicación',
    'Innovación'
  ];
  chosenSoftSkills: any[] = [];
  errorMessage: String = '';
  existingCV: Boolean = false;
  existingCVdata: any = {};

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    private fb: FormBuilder,
    public _employeeService: EmployeeService,
    public _cvService: CurriculumService
  ) { }

  ngOnInit() {
    this.getCurriculum();
    const position = this.user.w_information.position.name;
    const name = this.user.p_information.name + ' ' + this.user.p_information.firstSurname + ' ' + this.user.p_information.secondSurname;
    this.cvForm = new FormGroup({
      name: new FormControl(name, Validators.required),
      position: new FormControl(position, Validators.required),
      overview: new FormControl('', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?\"#$%&()-_\/.,:;\']+$)')
      ]),
      education: new FormGroup({
        career: new FormControl('', [
          Validators.required,
          Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-_\/.,:;\']+$)')
        ]),
        school: new FormControl('', [
          Validators.required,
          Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-_\/.,:;\']+$)')
        ]),
        certified: new FormControl('false', Validators.required),
        professional_license: new FormControl('')
      }),
      certifications: this.fb.array([this.createCertification()]),
      courses: this.fb.array([this.createCourse()]),
      soft_skills: this.fb.array([
        this.createAbility(),
        this.createAbility(),
        this.createAbility(),
        this.createAbility(),
        this.createAbility()
      ]),
      technical_abilities: this.fb.array([
        this.createAbility(),
      ]),
      languages: this.fb.array([this.createLanguage()]),
      working_experience: this.fb.array([this.createJob()])
    });
  }

  createCertification(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
      active: ['false', Validators.required]
    });
  }

  addCertification() {
    this.certifications = this.cvForm.get('certifications') as FormArray;
    // this.certifications.push(this.createCertification());
    this.certifications.insert(0, this.createCertification());
    
  }

  deleteCertification(index) {
    this.certifications = this.cvForm.get('certifications') as FormArray;
    this.certifications.removeAt(index);
  }

  createCourse(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
      studies_proof: ['']
    });
  }

  addCourse() {
    this.courses = this.cvForm.get('courses') as FormArray;
    // this.courses.push(this.createCourse());
    this.courses.insert(0, this.createCourse());
  }

  deleteCourse(index) {
    this.courses = this.cvForm.get('courses') as FormArray;
    this.courses.removeAt(index);
  }

  createLanguage(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
      level: ['', Validators.required]
    });
  }

  createAbility(): FormGroup {
    return this.fb.group({
      ability: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
    });
  }

  addAbility() {
    this.technical_abilities = this.cvForm.get('technical_abilities') as FormArray;
    this.technical_abilities.insert(0, this.createAbility());
  }

  deleteAbility(index) {
    this.technical_abilities = this.cvForm.get('technical_abilities') as FormArray;
    this.technical_abilities.removeAt(index);
  }

  addLanguage() {
    this.languages = this.cvForm.get('languages') as FormArray;
    this.languages.push(this.createLanguage());
  }

  deleteLanguage(index) {
    this.languages = this.cvForm.get('languages') as FormArray;
    this.languages.removeAt(index);
  }

  createJob(): FormGroup {
    return this.fb.group({
      job_name: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
      job_position: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
      period: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
      activities: this.fb.array([ this.createActivity() ])
    });
  }

  addJob() {
    this.working_experience = this.cvForm.get('working_experience') as FormArray;
    // this.working_experience.push(this.createJob());
    this.working_experience.insert(0, this.createJob());
  }

  deleteJob(index) {
    this.working_experience = this.cvForm.get('working_experience') as FormArray;
    this.working_experience.removeAt(index);
  }

  createActivity(): FormGroup {
    return this.fb.group({
      activity: ['', [
        Validators.required,
        Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
      ]],
    });
  }

  addActivity( control ) {
    control.push(this.createActivity());
  }

  deleteActivity( control, index ) {
    control.removeAt(index);
  }

  checkStudies( certified ) {
    if ( certified ) {
      this.cvForm.get('education.professional_license').setValidators([
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern('^[0-9]+$')
      ]);
      this.professional_license = true;
    } else {
      this.cvForm.get('education.professional_license').clearValidators();
      this.professional_license = false;
    }

    this.cvForm.get('education.professional_license').updateValueAndValidity();
  }

  selectSoftSkill( i ) {
    const skills = this.cvForm.get('soft_skills') as FormArray;
    this.chosenSoftSkills = skills.value.map( comp => comp.ability);
  }

  saveCurriculum() {
    this.spinner.show();
    if ( this.cvForm.valid ) {
      let data = { ...this.cvForm.value, user: this.user._id };
      data = JSON.parse(JSON.stringify(data).replace(/"\s+|\s+"/g, '"'));
      console.log(data);
      if (!this.existingCV) {
        this._cvService.newCurriculum( data ).subscribe(
          res => {
            this.errorMessage = '';
            this.spinner.hide();
            this.Toast.fire({
              type: 'success',
              title: 'Curriculum registrado correctamente.'
            });
            this.router.navigateByUrl('/perfil');
          },
          err => {
            this.errorMessage = err;
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al registrar el curriculum.'
            });
          }
        );
      } else  {
        this._cvService.updateCurriculum(this.existingCVdata._id, data ).subscribe(
          res => {
            this.errorMessage = '';
            this.spinner.hide();
            this.Toast.fire({
              type: 'success',
              title: 'Curriculum actualizado correctamente.'
            });
            this.router.navigateByUrl('/perfil');
          },
          err => {
            this.errorMessage = err;
            this.spinner.hide();
            this.Toast.fire({
              type: 'error',
              title: 'Error al actualizar el curriculum.'
            });
          }
        );
      }
    } else {
      this.errorMessage = 'Información incompleta, todos los campos obligatorios deben estar llenos.';
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
  }

  setDataForm() {
    this.cvForm.patchValue({
      name: this.existingCVdata.name || '',
      position: this.existingCVdata.position || '',
      overview: this.existingCVdata.overview || '',
      education: {
        career: this.existingCVdata.education.career || '',
        school: this.existingCVdata.education.school || '',
        certified: this.existingCVdata.education.certified.toString(),
        professional_license: this.existingCVdata.education.professional_license || ''
      }
    });

    this.professional_license = this.existingCVdata.education.certified;
    this.checkStudies(this.professional_license);

      const cert = this.cvForm.get('certifications') as FormArray;
      while (cert.length > 0) { cert.removeAt(0); }
      const courses = this.cvForm.get('courses') as FormArray;
      while (courses.length > 0) { courses.removeAt(0); }
      const soft = this.cvForm.get('soft_skills') as FormArray;
      while (soft.length > 0) { soft.removeAt(0); }
      const tech = this.cvForm.get('technical_abilities') as FormArray;
      while (tech.length > 0) { tech.removeAt(0); }
      const lan = this.cvForm.get('languages') as FormArray;
      while (lan.length > 0) { lan.removeAt(0); }
      const jobs = this.cvForm.get('working_experience') as FormArray;
      while (jobs.length > 0) { jobs.removeAt(0); }

      if (this.existingCVdata.certifications.length > 0) {
        this.existingCVdata.certifications.forEach(element => {

          cert.push(
            this.fb.group({
              name: [element.name, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
              active: [element.active.toString(), Validators.required ]
            })
          );

        });
      } else { this.addCertification(); }

      if (this.existingCVdata.courses.length > 0) {
        this.existingCVdata.courses.forEach(element => {

          courses.push(
            this.fb.group({
              name: [element.name, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
              studies_proof: [element.studies_proof, Validators.required ]
            })
          );

        });
      } else { this.addCourse(); }

      if (this.existingCVdata.soft_skills.length > 0) {
        this.existingCVdata.soft_skills.forEach(element => {

          soft.push(
            this.fb.group({
              ability: [element.ability, Validators.required]
            })
          );

        });
        this.selectSoftSkill('');
      }

      if (this.existingCVdata.technical_abilities.length > 0) {
        this.existingCVdata.technical_abilities.forEach(element => {

          tech.push(
            this.fb.group({
              ability: [element.ability, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
            })
          );

        });
      } else { this.addAbility(); }

      if (this.existingCVdata.languages.length > 0) {
        this.existingCVdata.languages.forEach(element => {

          lan.push(
            this.fb.group({
              name: [element.name, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
              level: [element.level, Validators.required]
            })
          );

        });
      } else { this.addAbility(); }

      if (this.existingCVdata.working_experience.length > 0) {
        this.existingCVdata.working_experience.forEach(element => {

          const actArray =  this.fb.array([]);
          element.activities.forEach(act => {
            actArray.push(
              this.fb.group({
                activity: [act.activity, [
                  Validators.required,
                  Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
                ]],
              })
            );
          });

          jobs.push(
            this.fb.group({
              job_name: [element.job_name, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
              job_position: [element.job_position, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
              period: [element.period, [
                Validators.required,
                Validators.pattern('(^[a-zÀ-ÿñ A-ZÑ0-9 !¡¿?"#$%&()-.,:;\']+$)')
              ]],
              activities: actArray
            })
          );

        });
      } else { this.addJob(); }
      this.spinner.hide();
  }

  getCurriculum() {
    this.spinner.show();
    this._cvService.getCurriculum(this.user._id).subscribe(
      res => {
        this.existingCV = true;
        this.existingCVdata = res.data;
        this.setDataForm();
      },
      err => {
        this.existingCV = false;
        this.spinner.hide();
      }
    );
  }

}
