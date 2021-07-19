import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ObjectiveService {
  token: string;

  constructor( public http: HttpClient,
               public router: Router) { 
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
   * Está función nos permite obtener los objetivos de 
   * un colaborador en particular 
   */
  getObjectives(id, year) {
    let url = GLOBAL.urlAPI + `nxrobjectives/${id}/${year}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Está función nos permite obtener el objetivo
   */
  getObjective(id) {
    let url = GLOBAL.urlAPI + `nxrobjective/${id}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Está función nos permite obtener el número de los objetivos
   * validados y no validados de un colaborador en particular.
   */
  getObjectivesStatus(id, year) {
    let url = GLOBAL.urlAPI + `nxrstatus/${id}/${year}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }
  
  /* 
   * Esta función nos permite guardar los objetivos
   */
  saveObjectives( objectives ) {
    let url = GLOBAL.urlAPI + 'objectives';

    return this.http.post( url, objectives, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite actualizar el avance de los objetivos
   */
  updateProgress( objectiveID, progress ) {
    let url = GLOBAL.urlAPI + 'nxrprogress/' + objectiveID ;

    return this.http.put( url, progress, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite validar los objetivos
   */
  validate( objectiveID, progress ) {
    let url = GLOBAL.urlAPI + 'nxrvalidate/' + objectiveID ;

    return this.http.put( url, progress, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite eliminar los objetivos de 
   * un colaborador en particular 
   */
  deleteObjectives(id) {
    let url = GLOBAL.urlAPI + `objectives/${id}`;

    return this.http.delete( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /* 
   * Esta función nos permite actualizar el objetivo
   */
  updateObjective( objectiveID, data ) {
    let url = GLOBAL.urlAPI + 'nxrobjective/' + objectiveID ;

    return this.http.put( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite dar el VoBo a los objetivos
   */
  voboObjectives( objectiveID ) {
    let url = GLOBAL.urlAPI + 'nxrvalidateObjs/' + objectiveID ;

    return this.http.put( url, '', this.generateHeaders() ).pipe(
      map( (res: any) => {
        console.log(res);
        return res;
      })
    );
  }
}
