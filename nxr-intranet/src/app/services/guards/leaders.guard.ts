import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EmployeeService } from '../employees/employee.service';
import { GLOBAL } from '../../config';


@Injectable({
  providedIn: 'root'
})
export class LeadersGuard implements CanActivate {
  career_key = this._employeeService.user.w_information.position.career_key;

  constructor(
    public _employeeService: EmployeeService,
    public router: Router
  ) {

  }
  
  canActivate() {  
    if( GLOBAL.leaderKeys.indexOf( this.career_key ) > -1 ) {
      return true; 
    } else {
      this.router.navigateByUrl('/perfil');
      return false;
    }
  }
}