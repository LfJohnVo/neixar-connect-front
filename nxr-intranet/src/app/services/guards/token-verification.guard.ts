import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EmployeeService } from '../employees/employee.service';

@Injectable({
  providedIn: 'root'
})

export class TokenVerificationGuard implements CanActivate {
  
  constructor(
    public _employeeService: EmployeeService,
    public router: Router
  ) {

  }
  
  canActivate(): Promise<boolean> | boolean {
    let token = this._employeeService.token;
    let payload = JSON.parse( atob( token.split('.')[1] ) );

    let expired = this.expired( payload.exp );

    if( expired ) {
      this._employeeService.logout();  
      return false;
    } 

    return this.needsRenew( payload.exp );

  }

  needsRenew( expDate: number ): Promise<boolean> {
    return new Promise( (resolve, reject) => {
      let tokenExp = new Date( expDate * 1000 );
      let now = new Date();

      now.setTime( now.getTime() + ( 10 * 60 * 1000) ) // Para saber si está a 10 minuto de que caduque el token

      //console.log( "Expira: ", tokenExp )

      // if( tokenExp.getTime() > now.getTime() ) {
      //   console.log("Aún no va a expirar")
      // } else { 
      //   console.log("Por expirar")
      // }

      // resolve(true);

      if( tokenExp.getTime() > now.getTime() ) {
        resolve(true);
      } else {

        // Si está por expirar lo renueva
        this._employeeService.renewToken()
          .subscribe( () => {
            resolve(true);
          }, () => {
            this._employeeService.logout();
            reject(false);
          });

      }

    })
  }

  expired( expDate: number ) {
    let now = new Date().getTime() / 1000;

    if( expDate < now ) {
      return true;
    } else {
      return false;
    }
  }
}
