import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from "../../services/sevice.index";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-rrhh',
  templateUrl: './rrhh.component.html',
  styles: []
})
export class RrhhComponent implements OnInit {
  employees: number = 0;
  unemployees: number = 0;
  temporal_contracts: number = 0;
  permanent_contracts: number = 0;
  women: number = 0;
  men: number = 0;

  constructor(
    private router: Router,
    public _employeeService: EmployeeService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.getEmployees('ACTIVO');
    this.getEmployees('BAJA');
    this.getEmployeesByGender('FEMENINO');
    this.getEmployeesByGender('MASCULINO');
    this.getTemporalContracts('DETERMINADO');
  }

/*
 * Obtiene los empleados por estatus
 */
  getEmployees(status) {
    this.spinner.show();
    this._employeeService.getEmployeesbyStatus(status).subscribe(
      res => {
        if(status==='ACTIVO')
        this.employees = res.total;
        else
        this.unemployees = res.total;
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
getTemporalContracts(type) {
  this.spinner.show();
  this._employeeService.getEmployeesbyContract(type).subscribe(
    res => {
      if(type==='DETERMINADO')
      this.temporal_contracts = res.total;
      else
      this.permanent_contracts = res.total;
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
getEmployeesByGender(gender) {
  this.spinner.show();
  this._employeeService.getEmployeesbyGender(gender).subscribe(
    res => {
      if(gender==='FEMENINO')
      this.women = res.total;
      else
      this.men = res.total;
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}
  
  viewEmployees() {
    this.router.navigateByUrl('/capital-humano/plantilla/activos');
  }
  
  viewContracts() {
    this.router.navigateByUrl('/capital-humano/plantilla/determinado');
  }

  viewLeaves() {
    this.router.navigateByUrl('/capital-humano/plantilla/bajas');
  }

  viewFemale() {
    this.router.navigateByUrl('/capital-humano/plantilla/mujeres');
  }

  viewMale() {
    this.router.navigateByUrl('/capital-humano/plantilla/hombres');
  }
}
