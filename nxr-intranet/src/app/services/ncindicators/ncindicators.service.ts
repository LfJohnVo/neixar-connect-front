import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NcindicatorsService {
  token: string;

  constructor(
    public http: HttpClient,
    public router: Router
  ) { 
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
   * Esta función nos permite guardar los indicadores
   */
  saveIndicator( indicator ) {
    let url = GLOBAL.urlAPI + 'ncindicators';
    /*
      * Se estructura el JSON a enviar de la manera requerida por el API
      */
    let data = indicator;
    data.type==='SGI' ? delete data.objective.process : delete data.objective.standard;
    let trafficLight: any[] = [
    { value: 'green',
      min: data.green.min,
      max: data.green.max },
      { value: 'yellow',
      min: data.yellow.min,
      max: data.yellow.max },
      { value: 'red',
      min: data.red.min,
      max: data.red.max }
    ];
  data.trafficLight = trafficLight;
  delete data.green;
  delete data.yellow;
  delete data.red;

    return this.http.post( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener los indicadores por tipo
   * paginados o no
   */
  getIndicatorsType(type, year, page?) {
    let url = GLOBAL.urlAPI + `ncindicatorsByType/${type}/${year}`;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener los indicadores por tipo
   * y de un colaborador en particular o de todos. Se puede paginar.
   */
  getIndicatorsTypeResponsable(type, responsable, page?) {
    let url = GLOBAL.urlAPI + `ncindicatorsByTypeResponsable/${type}/${responsable}`;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

   /*
   * Está función nos permite obtener los indicadores por tipo
   * paginados o no
   */
  getIndicator( id ) {
    let url = GLOBAL.urlAPI + `ncindicator/${id}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Esta función nos permite actualizar los datos del 
   * indicador seleccionado 
   */
  updateIndicator(id, indicator){
    let url = GLOBAL.urlAPI + 'ncindicator/' + id;
    /*
      * Se estructura el JSON a enviar de la manera requerida por el API
      */
     let data = indicator;
     data.type==='SGI' ? delete data.objective.process : delete data.objective.standard;
     let trafficLight: any[] = [
     { value: 'green',
       min: data.green.min,
       max: data.green.max },
       { value: 'yellow',
       min: data.yellow.min,
       max: data.yellow.max },
       { value: 'red',
       min: data.red.min,
       max: data.red.max }
     ];
   data.trafficLight = trafficLight;
   delete data.green;
   delete data.yellow;
   delete data.red;

    return this.http.put( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Esta función nos permite actualizar el estatus del indicador a baja
   */
  deleteIndicator(id){
    let url = GLOBAL.urlAPI + 'ncindicatorDelete/' + id;
    
    return this.http.put( url, '', this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

   /*
   * Está función nos permite obtener los registros de evaluaciones 
   * por año de todos los indicadores y por responsable
   */
  getEvaluationsByResponsable(year, type, id?) {
    let url = GLOBAL.urlAPI + `ncEvaluationsByResponsable/${year}/${type}`;
    if(id) url = url + '/' + id;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        if(res.data.length > 0) {
          let indicators = res.data;
          let months = [];
          for (let ind of indicators) {
            months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
            // -------
            ind.months.forEach(m => {
              let pos = months.indexOf(m.toString());
              months.splice(pos, 1);
            });
            months.forEach(x => {
              ind.evaluation.evaluations[parseInt(x)-1].progress = null;
            });
            // -------            
          }
          return indicators;
        } else {
          return [];
        }
      })
    );
  }

  /*
   * Está función nos permite obtener los procesos del año solicitado
   */
  getProcesses( year ) {
    let url = GLOBAL.urlAPI + `ncprocesses/${year}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Está función nos permite obtener los responsables del año solicitado
   */
  getResponsables( year? ) {
    let url = GLOBAL.urlAPI + 'ncresponsables';
    if(year) url = url + '/' +year;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Esta función obtiene todos las años de evaluación de indicadores registrados
   */
  getYears( ) {
    let url = GLOBAL.urlAPI + `ncindicatorsYears`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

   /*
   * Está función nos permite obtener los registros de evaluaciones 
   * por año de todos los indicadores y por proceso
   */
  getEvaluationsByProcess(year, process) {
    let url = GLOBAL.urlAPI + `ncEvaluationsByProcess/${year}/${process}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        if(res.data.length > 0) {
          let indicators = res.data;
          let months = [];
          for (let ind of indicators) {
            months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
            // -------
            ind.months.forEach(m => {
              let pos = months.indexOf(m.toString());
              months.splice(pos, 1);
            });
            months.forEach(x => {
              ind.evaluation.evaluations[parseInt(x)-1].progress = null;
            });
            // -------            
          }
          return indicators;
        } else {
          return [];
        }  
      })
    );
  }

  /*
   * Está función nos permite obtener el promedio los procesos del año solicitado
   */
  getAverage( year ) {
    let url = GLOBAL.urlAPI + `ncAverageByProcess/${year}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

}