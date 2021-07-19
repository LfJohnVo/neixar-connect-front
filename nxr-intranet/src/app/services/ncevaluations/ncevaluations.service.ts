import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NcevaluationsService {
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
   * Esta función nos permite guardar el registro de evaluaciones de forma anual
   * por indicador
   */
  saveEvaluation( ncEvaluation ) {
    let url = GLOBAL.urlAPI + 'ncEvaluation';
    let data = ncEvaluation;
    let evaluations: any[] = [];
    let i = 1;
    for( ; i <= 12; i++) {    
      let month = {
        month: i.toString(),
        progress: 0,
        validated: false
      };
      evaluations.push(month);
    }
    data.evaluations = evaluations;
    
    return this.http.post( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener los registros de evaluaciones 
   * por año y/o por indicador(No requerido)
   */
  getEvaluationsByYearAndIndicator(year, indicator?) {
    let url = GLOBAL.urlAPI + `ncEvaluation/${year}`;
    if(indicator) url = url + '/' +indicator;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {        
        if(res.data.length > 0) {
          let ind = res.data[0];
          let months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
          // -------
          ind.indicator.months.forEach(m => {
            let pos = months.indexOf(m.toString());
            months.splice(pos, 1);
          });
          months.forEach(x => {
            ind.evaluations[parseInt(x)-1].progress = null;
          });
          // -------

          ind.average = ind.evaluations.reduce(
            ( total, currentValue ) => total + (currentValue.progress || 0),
            0).toFixed(2);
          
          return this.indicatorAvg(ind);
        } else {
          this.router.navigateByUrl('/sgi/indicadores');
          return
        }
      })
    );
  }

  indicatorAvg( indicatorInfo ) {
    let ind = indicatorInfo;
    let sum = ind.average;
    let months = 12;
    if( ind.indicator.frecuency === 'Mensual' ) months = 12;
    else if( ind.indicator.frecuency === 'Bimestral' ) months = 6;
    else if( ind.indicator.frecuency === 'Trimestral' ) months = 4;
    else if( ind.indicator.frecuency === 'Semestral' ) months = 2;
    else months = 1;
    ind.average = (sum/months).toFixed(2);    
    return ind;
  }

  /*
   * Esta función nos permite actualizar el progreso del 
   * mes e indicador seleccionado
   */
  updateProgress(id, data){
    let url = GLOBAL.urlAPI + 'ncEvaluationProgress/' + id;

    return this.http.put( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite validar los indicadores
   */
  validate( id, data, indicadorID ) {
    let url = GLOBAL.urlAPI + `ncEvaluationValidated/${id}/${indicadorID}` ;

    return this.http.put( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
