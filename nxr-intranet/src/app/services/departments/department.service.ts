import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {
  token: string;

  constructor(public http: HttpClient) {
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
   * Esta función nos permite obtener los datos del localstorage 
   */
  getStorage() {
    if ( localStorage.getItem('token') ) {
      this.token = localStorage.getItem('token');
    } else {
      this.token = '';
    }
  }

  /* 
   * Esta función nos permite crear un nuevo departamento
   */
  saveDepartment( department ) {
    let url = GLOBAL.urlAPI + 'depto';

    if (!department.responsible) {
      delete department.responsible;
    }

    return this.http.post( url, department, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los departamentos de 
   * de forma paginada o sin paginar.
   */
  getDepartments(page?) {
    let url = GLOBAL.urlAPI + 'deptos';
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener el departamento requerido.
   */
  getDepartment(id) {
    let url = GLOBAL.urlAPI + 'depto/' + id;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Esta función nos permite actualizar los datos del 
   * departamento seleccionado
   */
  updateDepartment(id, department){
    let url = GLOBAL.urlAPI + 'depto/' + id;

    if (!department.responsible) {
      delete department.responsible;
    }

    return this.http.put( url, department, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
}
