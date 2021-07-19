import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EmployeeService } from '../employees/employee.service';

@Injectable({
  providedIn: 'root'
})
export class CvpdfGuard implements CanActivate {
  role = this._employeeService.user.role;
  searchCVroles = ['Admin', 'CH1', 'CH2', 'CO2'];

  constructor(
    public _employeeService: EmployeeService,
    public router: Router
  ) {
    
  }

  canActivate() {
    if ( this.searchCVroles.indexOf(this.role) > -1 ) {
      return true;
    } else {
      this.router.navigateByUrl('/perfil');
      return false;
    }
  }
}
