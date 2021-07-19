import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class NxrevaluationsService {
  token: string;
  year: Number;
  period: String;
  nextEval: String;

  constructor( public http: HttpClient) { 
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
    * Determina el periodo y año de evaluación para realizar la petición de los datos
    */
   getPeriodAndYear() {
     /* En ocasiones el segundo periodo de evaluación se lleva a cabo al año siguiente del primer periodo. Debemos determinar si eso pasa para saber que año 
       * es que se debe solicitar en las peticiones.
       */
        let firstEval = moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss').month();
        let secondEval = moment(GLOBAL.shortSecondPEstartDate, 'DD/MM').month();
        let year, period, nextEval;
        /*
          * // Sí el número de mes (1 al 12) de la segunda evaluación es posterior al número de mes (1 al 12) de la primera significa que no pertenecen al mismo año
          */
        if (secondEval < firstEval) { // AÑO DIFERENTE
          if( moment().isBetween(moment(GLOBAL.shortSecondPEstartDate, 'DD/MM'), moment(GLOBAL.shortSecondPEendDate, 'DD/MM'), null, "[]") ) {
            year = moment().year() - 1;
            period = '2';
            nextEval = `${moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year + 1}  - ${moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year + 1}`;
          } else {
             year = moment().year();
             period = '1';
             if(moment().isBefore(moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss'))) {
              nextEval = `${moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year}  - ${moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year}`; 
            } else {
             nextEval = `${moment(GLOBAL.shortSecondPEstartDate, 'DD/MM').format('DD/MM').toString()}/${year + 1} - ${moment(GLOBAL.shortSecondPEendDate, 'DD/MM').format('DD/MM').toString()}/${year + 1}`;
            }
          }
        } else { //MISMO AÑO
            year = moment().year();
            period = ( moment().isBetween(moment(GLOBAL.secondPEstartDate, 'DD/MM hh:mm:ss'), moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss')) ) ? '2' : '1';

            if(period === '2') {
              nextEval =`${moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year + 1} - ${moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year + 1}`;
            } else {
              if(moment().isBefore(moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss'))) {
                nextEval =`${moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year} - ${moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year}`;
              } else {
                nextEval = `${moment(GLOBAL.shortSecondPEstartDate, 'DD/MM').format('DD/MM').toString()}/${year} -  ${moment(GLOBAL.shortSecondPEendDate, 'DD/MM').format('DD/MM').toString()}/${year}`;
              }
            }

            // period == '1' ? nextEval = `${moment(GLOBAL.shortSecondPEstartDate, 'DD/MM').format('DD/MM').toString()}/${year} -  ${moment(GLOBAL.shortSecondPEendDate, 'DD/MM').format('DD/MM').toString()}/${year}` :
            // nextEval =`${moment(GLOBAL.firstPEstartDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year + 1} - ${moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss').format('DD/MM').toString()}/${year + 1}`;
        }
        
        this.year = year;
        this.period = period;
        this.nextEval = nextEval;
   }

  /*
   * Está función nos permite obtener la evaluación por usuario, año y periodo
   */
  getEvaluation(id, year, period) {
    let url = GLOBAL.urlAPI + `nxreval/${id}/${year}/${period}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  /*
   * Está función nos permite obtener las evaluación por año y periodo
   */
  getEvaluations(year, period, page?) {
    let url = GLOBAL.urlAPI + `nxrevals/${year}/${period}`;
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener el histórico las evaluación
   * por año y periodo paginadas o no.
   */
  getEvalHistory(page?) {
    let url = GLOBAL.urlAPI + 'nxrevalHist';
    if(page) url = url + '/' + page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener el histórico las evaluación
   * por año y periodo paginadas o no.
   */
  getEmployeesEval(year, period) {
    let url = GLOBAL.urlAPI + `nxremployEval/${year}/${period}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite guardar la evaluación
   */
  saveEvaluation( evaluation ) {
    let url = GLOBAL.urlAPI + 'nxreval';

    return this.http.post( url, evaluation, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener las evaluación por año y por empleado
   */
  getEvaluationsByEmp(id, year) {
    let url = GLOBAL.urlAPI + `nxrEvalByEmp/${id}/${year}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
