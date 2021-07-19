import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
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
   * Está función nos permite obtener todos los puestos de 
   * de forma paginada o sin paginar.
   */
  getPositions(page?) {
    let url = GLOBAL.urlAPI + 'positions';
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todos los puestos de 
   * de forma paginada o sin paginar por departamento.
   */
  getPositionsByDepartment(depto, page?) {
    let url = GLOBAL.urlAPI + 'positionByDepto/' + depto;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener el puesto requerido.
   */
  getPosition(id) {
    let url = GLOBAL.urlAPI + 'position/' + id;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite crear un nuevo puesto
   */
  savePosition( position ) {
    let url = GLOBAL.urlAPI + 'position';

    return this.http.post( url, position, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Esta función nos permite actualizar los datos del
   * puesto seleccionado
   */
  updatePosition(id, position){
    let url = GLOBAL.urlAPI + 'position/' + id;

    return this.http.put( url, position, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

/* 
   * Esta función nos permite crear una nueva descripción de puesto
   */
  saveJobDescription( id, jobDescription ) {
    let url = GLOBAL.urlAPI + 'storeDP/' + id;

    return this.http.post( url, jobDescription, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

    /*
   * Esta función nos permite actualizar los datos del
   * puesto seleccionado
   */
  updateJobDescription(id, jobDescription){
    let url = GLOBAL.urlAPI + 'updateDP/' + id;

    return this.http.post( url, jobDescription, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite obtener la descripción de puesto solicitada
   */
  getJobDescription( id ) {
    let url = GLOBAL.urlAPI + 'getDP/' + id;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite obtener las descripciones de puesto 
   * creadas por un colaborador en particular.
   */
  getDPByCreator( id, page? ) {
    let url = GLOBAL.urlAPI + 'getDPByCreator/' + id;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

   /* 
   * Esta función nos permite validar una DP
   */
  jdValidation( id, dataToUpdate ) {
    let url = GLOBAL.urlAPI + `validatedDP/${id}`;

    return this.http.put( url, dataToUpdate, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite rechazar una DP
   */
  jdRejection( id, cause ) {
    let url = GLOBAL.urlAPI + `rejectedDP/${id}`;

    return this.http.put( url, cause, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite obtener las descripciones de puesto por validar
   */
  getJobDescriptionToValidate( page? ) {
    let url = GLOBAL.urlAPI + 'toValidate';    
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  deleteJobDescription(id){
    let url = GLOBAL.urlAPI + 'deleteDP/' + id;

    return this.http.post( url, '', this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getPositionsWithActiveJobDescriptions() {
    let url = GLOBAL.urlAPI + 'getPositionsDpValidated';        

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
