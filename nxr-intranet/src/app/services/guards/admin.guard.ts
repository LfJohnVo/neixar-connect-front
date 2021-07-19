import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EmployeeService } from '../employees/employee.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    public _employeeService: EmployeeService,
    public router: Router
  ) {

  }

  canActivate() {

    if( this._employeeService.user.role === 'Admin'  || this._employeeService.user.role === 'DesTa' ) {
      return true; 
    } else {
      this.router.navigateByUrl('/inicio');
      return true;
    }
  }
}
