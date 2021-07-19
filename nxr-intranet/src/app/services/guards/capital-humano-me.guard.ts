import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EmployeeService } from '../employees/employee.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CapitalHumanoGuardME implements CanActivate {
  /*
    * Capital Humano - Movilidad y Evaluación
    */
  allowedRoles: string[] = ['Admin', 'CH1' ,'CH2'];
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
    
  constructor( 
      public _employeeService: EmployeeService,
      public router: Router 
      ) { }

      canActivate() {
        if(  this.allowedRoles.includes( this._employeeService.user.role ) ) {
          return true; 
        } else {
          this.router.navigateByUrl('/capital-humano');
          this.Toast.fire({
            type: 'warning',
            title: 'No cuentas con los permisos requeridos para acceder a la página.'
          });
          return false;
        }
      }
}