import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PositionService, DepartmentsService, EmployeeService } from '../../services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from "moment";
import { GLOBAL } from '../../config'
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styles: []
})
export class PromotionComponent implements OnInit {

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });

  PromotionForm: FormGroup;
  errorMessage: String;
  id: String;
  userInfo: any;
  departments: any[];
  positions: any[];
  promotions: any[];

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public _employeeService: EmployeeService,
    public _positionService: PositionService,
    public _departmentService: DepartmentsService
  ) { 
    activatedRoute.params.subscribe( params => {
      this.id = params['id'];
      this.getInfo(params['id']); 
    });
  }

  ngOnInit() {
    this.PromotionForm = new FormGroup({
      promotion: new FormGroup({
        new_position: new FormControl('', Validators.required)
      }),
      newData: new FormGroup({
        area: new FormControl('', Validators.required),
        contract_type: new FormControl('DETERMINADO'),
        contract_termination_date: new FormControl('', [
          Validators.required,
          Validators.pattern("^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)([0-9]{4})$")
        ]),
        monthly_salary_saf: new FormControl("", [
          Validators.required,
          Validators.min(1)
        ]),
        daily_salary_saf: new FormControl("", [
          Validators.required,
          Validators.min(1)
        ]),
        amount_sdi_saf: new FormControl("", [
          Validators.required,
          Validators.min(1)
        ]),
      }),
    });
    this.getDepartments();
  }

  getInfo(id) {
    this.spinner.show();
    this._employeeService.getEmployee(id)
    .subscribe(
      res => {        
        this.userInfo = res;
        this.setData();
        this.getPosition(res.w_information.area._id);  
        this.promotions = res.promotions;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl("/capital-humano/plantilla/activos");
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

  fillDropDowns(depto) {
    this.getPosition(depto);
    this.PromotionForm.patchValue({
      promotion: {
        new_position: ""
      }
    });
  }

  setData() {
    this.errorMessage = '';
    this.PromotionForm.patchValue({
      promotion: {
        new_position: this.userInfo.w_information.position._id || ""
      },
      newData: {
        area: this.userInfo.w_information.area._id || "",
        contract_type: this.userInfo.w_information.contract_type || "",
        contract_termination_date:
          this.userInfo.w_information.contract_termination_date === null ||
          this.userInfo.w_information.contract_termination_date === undefined ? "" 
          : moment(this.userInfo.w_information.contract_termination_date).format("DD/MM/YYYY"),
          monthly_salary_saf: "",
          daily_salary_saf: "",
          amount_sdi_saf: ""
      }
    });
    this.checkContractType(this.userInfo.w_information.contract_type);
  }

  /*
  * Verifica que tipo de contrato tiene y asigna validaciones a la fecha de finalización
  * del contrato.
  */
 checkContractType(type) {
  if (type === "INDETERMINADO") {
    this.PromotionForm
      .get("newData.contract_termination_date")
      .clearValidators();
    this.PromotionForm
      .get("newData.contract_termination_date")
      .updateValueAndValidity();
    this.PromotionForm.patchValue({
      newData: {
        contract_termination_date: ""
      }
    });
  } else {
    this.PromotionForm
      .get("newData.contract_termination_date")
      .setValidators([
        Validators.required,
        Validators.pattern(
          "^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$"
        )
      ]);
    this.PromotionForm
      .get("newData.contract_termination_date")
      .updateValueAndValidity();
  }
}

savePromotion() {
  this.spinner.show();
  if(this.PromotionForm.valid) {
    let data = this.PromotionForm.value;
    if(this.userInfo.w_information.position._id != data.promotion.new_position) {
      if( !this.userInfo.f_information ) {
        
        this.spinner.hide();
        this.errorMessage  = 'El colaborador no tiene registrado un salario actual, registrálo primero.';
        this.Toast.fire({
          type: 'error',
          title: 'El colaborador no tiene registrado un salario actual, registrálo primero.'
        });

        return;

  }
    data.newData.position = data.promotion.new_position;
    data.newData.last_gross_salary = this.userInfo.f_information.monthly_salary_saf;
    data.promotion.prev_position = this.userInfo.w_information.position._id;
    data.promotion.prev_salary = this.userInfo.f_information.monthly_salary_saf;
    data.promotion.new_salary = data.newData.monthly_salary_saf
    data.promotion.date = moment().toISOString();
    data.newData.contract_termination_date ? 
    data.newData.contract_termination_date = moment( data.newData.contract_termination_date,"DD/MM/YYYY").toISOString() : 
    data.newData.contract_termination_date = '';
    let year =  ( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) ? moment().year() - 1 : moment().year();
    this._employeeService.addPromotion(this.id, data, year).subscribe(
      res => {
        this.getInfo(this.id); 
        $('#NewPromotionModal').modal('hide');
        this.spinner.hide();
        this.Toast.fire({
          type: 'success',
          title: 'Colaborador promovido, favor de verificar.'
        });
      },
      err => {
        this.errorMessage = err.error.message;
        this.spinner.hide();
        this.Toast.fire({
          type: 'error',
          title: err.error.message
        });
      }
    );
    } else {
      this.errorMessage =
        "El colaborador ya desempeña el puesto seleccionado actualmente, asegúrese de seleccionar otro.";
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'El colaborador ya desempeña el puesto seleccionado actualmente, asegúrese de seleccionar otro.'
      });
    }
  } else {
    this.errorMessage = "Información incompleta, todos los campos obligatorios deben estar llenos.";
    this.spinner.hide();
    this.Toast.fire({
      type: 'error',
      title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
    });
  }
    
}

}
