import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {

  token: string;

  constructor(public http: HttpClient) {
    this.getStorage();
   }

  generateHeaders() {
    const httpOptions = {
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

  newCurriculum( cv ) {
    const url = GLOBAL.urlAPI + 'curriculum';
    return this.http.post( url, cv, this.generateHeaders() ).pipe(
      map( (res: any) => {
        console.log(res);
        return res;
      }),
      catchError( err => {
        return throwError(err.error.message);
      })
    );
  }

  getCurriculum(userId) {
    const url = GLOBAL.urlAPI + 'getCurriculum/' + userId;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
        return throwError(err.error.message);
      })
    );
  }

  updateCurriculum(cvId, cv) {
    const url = GLOBAL.urlAPI + 'updateCurriculum/' + cvId;

    return this.http.put( url, cv, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
        return throwError(err.error.message);
      })
    );
  }

  searchKnowledge(term, page?) {
    let url = GLOBAL.urlAPI + 'searchKnowledge/' + term;
    if (page) { url = url + '/' + page; }

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      }),
      catchError( err => {
        return throwError(err.error.message);
      })
    );
  }

}
