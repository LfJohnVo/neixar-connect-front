import { Injectable } from '@angular/core';
import { EmployeeService } from '../employees/employee.service';

@Injectable()

export class HeaderService {

  menu: any[] = [];
  
  // menu: any = [
  //   { title: 'Inicio', url: '/inicio'},
  //   { title: 'Mi Perfil', url: '/perfil'},
  //   { title: 'Equipo', url: '/equipo'},
  //   { title: 'Desarrollo de Talento', url: '/talento'}
  // ];

  constructor( public _employeeService: EmployeeService ) {
  }
  
   showMenu() {
     this.menu = this._employeeService.menu;
   }
}
