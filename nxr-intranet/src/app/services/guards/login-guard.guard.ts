import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EmployeeService } from '../employees/employee.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardGuard implements CanActivate {

  constructor( public _employeeService: EmployeeService,
               public router: Router ) {}

  canActivate() {
    if( this._employeeService.isLogged()) {
      console.log('Aprobado por el Login Guard');
      return true;
    } else {
      console.log('Bloqueado por el Login Guard');
      this.router.navigateByUrl('/login');
      return false;
    }

  }
}