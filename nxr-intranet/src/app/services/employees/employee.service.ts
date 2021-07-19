import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  user: any;
  menu: any[] = [];
  token: string;
  pc: string;
  pa: string;
  timeofservice = {
    'years': 0,
    'months': 0,
    'days': 0
  };

  constructor( public http: HttpClient,
               public router: Router ) {
    this.getStorage();
  }
  
  generateHeaders(){
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.token
      })
    };
    
    return httpOptions;
  }

  /*
   * Esta función nos permite almacenar en localstorage los datos
   * del usuario que ha iniciado sesión.
   */
  login( user ) {
    let url = GLOBAL.urlAPI + 'login';

    return this.http.post( url, user ).pipe(
      map( (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        localStorage.setItem('menu', JSON.stringify(res.menu));
        res.data.passChanged == undefined || res.data.passChanged == false ? 
          localStorage.setItem('pc', 'false') : localStorage.setItem('pc', 'true');
        
        res.data.policiesAccepted == undefined || res.data.policiesAccepted == false ? 
          localStorage.setItem('pa', 'false') : localStorage.setItem('pa', 'true');

        this.user = res.data;
        this.token = res.token;
        this.menu = res.menu;

        return true;
      })
    )
  }

  /*
   * Esta función nos permite renovar el token
   */

   renewToken() {
    let url = GLOBAL.urlAPI + 'token';

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        this.token = res.token;
        localStorage.setItem('token', res.token);
        return true;
      })
    );
   }

  /*
   * Esta función nos permite obtner un valor true si un usuario ha iniciado
   * sesión al corroborar que un token existe en el localstorage 
   */
  isLogged() {
    return ( this.token.length > 5 )? true : false;
  }

  /*
   * Esta función nos permite obtener los datos del localstorage 
   */
  getStorage() {
    if ( localStorage.getItem('token') ) {
      this.token = localStorage.getItem('token');
      this.user = JSON.parse( localStorage.getItem('user') );
      this.menu = JSON.parse( localStorage.getItem('menu') );
      this.pc = localStorage.getItem('pc');
      this.pa = localStorage.getItem('pa');
      let admission_date = moment( this.user.w_information.admission_date );
        let today = moment();
        
        let years = today.diff(admission_date, 'years');
        admission_date = admission_date.add(years, 'y');
        let months = today.diff(admission_date, 'months');
        admission_date = admission_date.add(months, 'M');
        let days = today.diff(admission_date, 'days');

        this.timeofservice.years = years;
        this.timeofservice.months = months;
        this.timeofservice.days = days;
    } else {
      this.token = '';
      this.user = null;
      this.menu = [];
      this.timeofservice.years = 0;
      this.timeofservice.months = 0;
      this.timeofservice.days = 0;
    }
  }

  /*
   * Esta función sirve para cerrar sesión y eliminar los datos del
   * localstorage 
   */
  logout() {
    this.user = null;
    this.token = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('menu');
    localStorage.removeItem('pc');
    localStorage.removeItem('pa');

    this.router.navigateByUrl('/login');
  }

  /* 
   * Esta función nos permite crear un nuevo ingreso
   */
  saveEmployee( employee ) {
    let url = GLOBAL.urlAPI + 'user';

    if (!employee.w_information.immediate_boss) {
      delete employee.w_information.immediate_boss;
    }

    return this.http.post( url, employee );
  }

  /*
   * Está función nos permite obtener todos los datos de 
   * un colaborador en particular 
   */
  getEmployee(id) {
    let url = GLOBAL.urlAPI + 'user/' + id;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Esta función nos permite actualizar los datos del 
   * colaborador seleccionado 
   */
  updateEmployee(id, employee){
    let url = GLOBAL.urlAPI + 'user/' + id;
    
    if (employee.w_information) {
      if (!employee.w_information.immediate_boss) {
        delete employee.w_information.immediate_boss;
      }
    }

    return this.http.put( url, employee, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Esta función nos permite crear una promoción para el colaborador seleccionado
   */
  addPromotion(id, promotion, year){
    //let url = GLOBAL.urlAPI + `promotion/${id}/${year}`;
    let url = GLOBAL.urlAPI + `promotion/${id}/${year}`;
    
    return this.http.put( url, promotion, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite cambiar la contraseña
   */
  changePass( id, pass ) {
    let url = GLOBAL.urlAPI + 'pass/' + id;

    return this.http.put( url, pass, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite resetear la contraseña
   */
  resetPass( id ) {
    let url = GLOBAL.urlAPI + 'resetPass/' + id;

    return this.http.put( url, '', this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Esta función nos permite actualizar los datos del 
   * colaborador seleccionado PARA DARLO DE BAJA
   */
  deleteEmployee(id, employee){
    let url = GLOBAL.urlAPI + 'user/' + id;

    return this.http.put( url, employee, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de forma paginada o sin paginar por búsqueda.
   */
  search(term, page?) {
    let url = GLOBAL.urlAPI + '/search/all/' + term;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
  
  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de forma paginada o sin paginar.
   */
  getEmployees(page?) {
    let url = GLOBAL.urlAPI + 'users';
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de forma paginada o sin paginar por STATUS.
   */
  getEmployeesbyStatus(status, page?) {
    let url = GLOBAL.urlAPI + 'userByStatus/' + status;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de forma paginada o sin paginar por CONTRACT TYPE.
   */
  getEmployeesbyContract(type, page?) {
    let url = GLOBAL.urlAPI + 'userByContract/' + type;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de forma paginada o sin paginar por DEPARTMENT.
   */
  getEmployeesbyDepartment(department, page?) {
    let url = GLOBAL.urlAPI + 'userByDepartment/' + department;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de forma paginada o sin paginar por GENDER.
   */
  getEmployeesbyGender(gender, page?) {
    let url = GLOBAL.urlAPI + 'userByGender/' + gender;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * por jefe inmediato concatenando la evaluación.
   */
  getTeam(user, year, period) {
    let url = GLOBAL.urlAPI + `getTeam/${user}/${year}/${period}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los colaboradores de 
   * de la empresa agrupados por área.
   */
  getCompany() {
    let url = GLOBAL.urlAPI + 'usersByArea';

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los cumpleaños de 
   * un mes en particular 
   */
  getBirthdays(month) {
    let url = GLOBAL.urlAPI + 'userByBirthday/' + month;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

   /*
   * Está función nos permite obtener todos los aniversarios de 
   * un mes en particular 
   */
  getanniversaries(month) {
    let url = GLOBAL.urlAPI + 'userByAdmission/' + month;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {

        let reformattedArray = res.data.filter( obj => moment(obj.w_information.admission_date).year() < moment().year() )

        reformattedArray = reformattedArray.map( (obj) => { 
          let rObj = obj;
          let years = moment().year() - moment(obj.w_information.admission_date).year();
          rObj.years = years <= 1 ? '1 año' : `${years} años`;
          return rObj;
       })        
        return reformattedArray;
      })
    );
  }

  /* 
   * Esta función permite restablecr la contraseña desde la casilla ¿Olvidaste tu contraseña?
   */
  resetPassFromEmp( token, pass ) {
    let url = GLOBAL.urlAPI + 'resetPassFromEmp';

    return this.http.put( url, pass, {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': token
      })
    } ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener el arreglo de las páginas 
   * a mostrar en pantalla.
   */
  getPages( totalPages, currentPage ): any[] {
    let pages = [];
    if (totalPages <= GLOBAL.pagination) {
      for (let i = 0; i < totalPages; i++) { pages.push(i + 1); }
    } else {
      if (currentPage <= GLOBAL.pagination ) {
        for (let i = 0; i < GLOBAL.pagination; i++) { pages.push(i + 1); }
      } else {
        for (let i = (GLOBAL.pagination - 1); i >= 0; i--) { pages.push(currentPage - i); }
      }
    }
    return pages;
  }
  
}