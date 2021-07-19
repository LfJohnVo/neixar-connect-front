import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import Swal from 'sweetalert2';
import {
  EmployeeService,
  DepartmentsService,
  PositionService
} from "../../services/sevice.index";
import * as moment from "moment";

@Component({
  selector: "app-edit-employee",
  templateUrl: "./edit-employee.component.html",
  styles: []
})
export class EditEmployeeComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });
  userInfo: any;
  userpInfo: any;
  userwInfo: any;
  userfInfo: any;
  departments: any[];
  positions: any[];
  employeesByDepto: any[];
  employees: any[];
  id: string;
  userForm: FormGroup;
  errorMessage: String;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public _employeeService: EmployeeService,
    public _departmentService: DepartmentsService,
    public _positionService: PositionService
  ) {
    activatedRoute.params.subscribe(params => {
      this.id = params["id"];
      this.getDepartments();
      this.getInfo(this.id);
    });
  }

  ngOnInit() {
    this.userForm = new FormGroup({
      p_information: new FormGroup({
        name: new FormControl("", [
          Validators.required,
          Validators.minLength(3)
        ]),
        firstSurname: new FormControl("", [
          Validators.required,
          Validators.minLength(3)
        ]),
        secondSurname: new FormControl("", [
          Validators.required,
          Validators.minLength(3)
        ]),
        gender: new FormControl("FEMENINO"),
        birthdate: new FormControl("", [
          Validators.pattern(
            "^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$"
          )
        ]),
        birthplace: new FormControl("", [Validators.minLength(3)]),
        nationality: new FormControl("", [Validators.minLength(3)]),
        marital_status: new FormControl(""),
        ssn: new FormControl("", [Validators.pattern("^[0-9]{11}$")]),
        curp: new FormControl("", [
          Validators.pattern(
            "^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$"
          )
        ]),
        rfc: new FormControl("", [
          Validators.pattern(
            "^([A-Z,Ñ,&]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]))([A-Z|0-9]{3})?$"
          )
        ]),
        phone_number: new FormControl("", [
          Validators.pattern("^[0-9]{8,10}$")
        ]),
        address: new FormControl("", [Validators.minLength(10)]),
        emergency_contact: new FormGroup({
          name: new FormControl("", [Validators.minLength(3)]),
          phone_number: new FormControl("", [
            Validators.pattern("^[0-9]{8,10}$")
          ])
        })
      }),
      w_information: new FormGroup({
        admission_date: new FormControl("", [
          Validators.required,
          Validators.pattern(
            "^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$"
          )
        ]),
        area: new FormControl("", Validators.required),
        cost_center: new FormControl("", Validators.required),
        position: new FormControl("", Validators.required),
        payroll_periodicity: new FormControl("QUINCENAL"),
        recruitment_scheme: new FormControl("MIXTO"),
        contract_type: new FormControl("DETERMINADO"),
        contract_renewal: new FormControl("S"),
        contract_termination_date: new FormControl(""),
        immediate_boss: new FormControl(""),
        hasPerformanceBonus: new FormControl("true"),
        bonusRate: new FormControl("")
      }),
      f_information: new FormGroup({
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
        current_payer: new FormControl("NXR-COLMENARES"),
        infonavit_num_credit: new FormControl(""),
        amount_descount_infonavit: new FormControl(""),
        fonacot_num_credit: new FormControl(""),
        amount_descount_fonacot: new FormControl(""),
        bank: new FormControl("", Validators.required),
        bank_account: new FormControl("", Validators.required),
        interbank_clabe: new FormControl("", Validators.required),
        last_gross_salary: new FormControl("", Validators.required)
      }),
      email: new FormControl("", [
        Validators.required,
        Validators.pattern("^[a-z0-9._]{3,}(@neixar.com)(.mx)?$")
      ]),
      id_saf: new FormControl("", [
        Validators.required,
        Validators.pattern("^(NXR|nxr)[0-9]{4,6}$")
      ]),
      id_neixar: new FormControl("", [Validators.required, Validators.min(1)])
    });
  }

  getInfo(id) {
    this.spinner.show();
    this._employeeService.getEmployee(id).subscribe(
      res => {
        this.userInfo = res;
        this.userpInfo = res.p_information;
        this.userwInfo = res.w_information;
        this.userfInfo = res.f_information || "";
        this.getPosition(this.userwInfo.area._id);
        this.getEmployees();
        this.setData();
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

  // Esta función da el formato necesario para mongoDB a las fechas
  formatDate(data) {
    if (data.w_information.contract_termination_date)
      data.w_information.contract_termination_date = moment(
        data.w_information.contract_termination_date,
        "DD/MM/YYYY"
      ).toISOString();
    if (data.w_information.admission_date)
      data.w_information.admission_date = moment(
        data.w_information.admission_date,
        "DD/MM/YYYY"
      ).toISOString();
    if (data.p_information.birthdate)
      data.p_information.birthdate = moment(
        data.p_information.birthdate,
        "DD/MM/YYYY"
      ).toISOString();

    return data;
  }

  editUser() {
    this.spinner.show();
    let user = this.formatDate(this.userForm.value);
    user.w_information.status = "ACTIVO";
    if (this.userForm.valid) {
      this._employeeService.updateEmployee(this.id, user).subscribe(
        res => {
          this.router.navigateByUrl("/capital-humano/plantilla/activos");
          this.spinner.hide();
          this.Toast.fire({
            type: 'success',
            title: 'Información actualizada correctamente.'
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
        "Información incompleta, todos los campos obligatorios deben estar llenos.";
      this.spinner.hide();
      this.Toast.fire({
        type: 'error',
        title: 'Información incompleta, todos los campos obligatorios deben estar llenos.'
      });
    }
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

  getEmployees() {
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

  fillDropDowns(depto) {
    this.getPosition(depto);
    //this.getEmployeesByDepto(depto);
    this.getEmployees()
    this.userForm.patchValue({
      w_information: {
        position: "",
        immediate_boss: ""
      }
    });
  }

  /*
  * Verifica que tipo de contrato tiene y asigna validaciones a la fecha de finalización
  * del contrato.
  */
  checkContractType(type) {
    if (type === "INDETERMINADO") {
      this.userForm
        .get("w_information.contract_termination_date")
        .clearValidators();
      this.userForm
        .get("w_information.contract_termination_date")
        .updateValueAndValidity();
      this.userForm.patchValue({
        w_information: {
          contract_termination_date: ""
        }
      });
    } else {
      this.userForm
        .get("w_information.contract_termination_date")
        .setValidators([
          Validators.required,
          Validators.pattern(
            "^(0[1-9]|1[0-9]|2[0-9]|3[0-1])(/)(0[1-9]|1[0-2])(/)([0-9]{4})$"
          )
        ]);
      this.userForm
        .get("w_information.contract_termination_date")
        .updateValueAndValidity();
    }
  }

  /*
  * Verifica si se tiene el beneficio de bono y asigna validaciones a la proporción del bono
  */
  checkBonus(opc) {
    if (!opc) {
      this.userForm.get("w_information.bonusRate").clearValidators();
      this.userForm.get("w_information.bonusRate").updateValueAndValidity();
      this.userForm.patchValue({
        w_information: {
          bonusRate: ""
        }
      });
    } else {
      this.userForm
        .get("w_information.bonusRate")
        .setValidators(Validators.required);
      this.userForm.get("w_information.bonusRate").updateValueAndValidity();
    }
  }

  setData() {
    this.userForm.patchValue({
      p_information: {
        name: this.userpInfo.name || "",
        firstSurname: this.userpInfo.firstSurname || "",
        secondSurname: this.userpInfo.secondSurname || "",
        birthdate:
          this.userpInfo.birthdate === null ||
          this.userpInfo.birthdate === undefined
            ? ""
            : moment(this.userpInfo.birthdate).format("DD/MM/YYYY") || "",
        gender: this.userpInfo.gender || "",
        birthplace: this.userpInfo.birthplace || "",
        nationality: this.userpInfo.nationality || "",
        marital_status: this.userpInfo.marital_status || "",
        ssn: this.userpInfo.ssn || "",
        curp: this.userpInfo.curp || "",
        rfc: this.userpInfo.rfc || "",
        phone_number: this.userpInfo.phone_number || "",
        address: this.userpInfo.address || "",
        emergency_contact: {
          name: this.userpInfo.emergency_contact.name || "",
          phone_number: this.userpInfo.emergency_contact.phone_number || ""
        }
      },
      w_information: {
        admission_date:
          this.userwInfo.admission_date === null ||
          this.userwInfo.admission_date === undefined
            ? ""
            : moment(this.userwInfo.admission_date).format("DD/MM/YYYY") || "",
        area: this.userwInfo.area._id || "",
        cost_center: this.userwInfo.cost_center || "",
        position: this.userwInfo.position._id || "",
        payroll_periodicity: this.userwInfo.payroll_periodicity || "",
        recruitment_scheme: this.userwInfo.recruitment_scheme || "",
        contract_type: this.userwInfo.contract_type || "",
        contract_renewal: this.userwInfo.contract_renewal || "N",
        contract_termination_date:
          this.userwInfo.contract_termination_date === null ||
          this.userwInfo.contract_termination_date === undefined
            ? ""
            : moment(this.userwInfo.contract_termination_date).format(
                "DD/MM/YYYY"
              ),
        immediate_boss: 
          this.userwInfo.immediate_boss === null ||
          this.userwInfo.immediate_boss === undefined
            ? "" : this.userwInfo.immediate_boss._id,
        hasPerformanceBonus:
          this.userwInfo.hasPerformanceBonus.toString() || "",
        bonusRate: this.userwInfo.bonusRate || ""
      },
      f_information: {
        monthly_salary_saf: this.userfInfo.monthly_salary_saf || "",
        daily_salary_saf: this.userfInfo.daily_salary_saf || "",
        amount_sdi_saf: this.userfInfo.amount_sdi_saf || "",
        current_payer: this.userfInfo.current_payer || "NXR-COLMENARES",
        infonavit_num_credit: this.userfInfo.infonavit_num_credit || "",
        amount_descount_infonavit:
          this.userfInfo.amount_descount_infonavit || "",
        fonacot_num_credit: this.userfInfo.fonacot_num_credit || "",
        amount_descount_fonacot: this.userfInfo.amount_descount_fonacot || "",
        bank: this.userfInfo.bank || "",
        bank_account: this.userfInfo.bank_account || "",
        interbank_clabe: this.userfInfo.interbank_clabe || "",
        last_gross_salary: this.userfInfo.last_gross_salary || ""
      },
      id_neixar: this.userInfo.id_neixar,
      id_saf: this.userInfo.id_saf,
      email: this.userInfo.email
    });
  }
}
