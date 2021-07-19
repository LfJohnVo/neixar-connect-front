import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EmployeeService } from '../employees/employee.service';

@Injectable({
  providedIn: 'root'
})
export class NormativityGuard implements CanActivate {

  constructor(
    public _employeeService: EmployeeService,
    public router: Router
  ) {

  }
  
  canActivate() {

    if( this._employeeService.user.role === 'Admin'  || this._employeeService.user.role === 'NorCum' || this._employeeService.user.role === 'DG' ) {
      return true; 
    } else {
      this.router.navigateByUrl('/inicio');
      return true;
    }
  }
}