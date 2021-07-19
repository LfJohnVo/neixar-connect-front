import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AreasService {
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
   * Esta función nos permite crear una nueva área
   */
  saveArea( area ) {
    let url = GLOBAL.urlAPI + 'area';

    if (!area.responsible) {
      delete area.responsible;
    }

    return this.http.post( url, area, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener todas las áreas de 
   * de forma paginada o sin paginar.
   */
  getAreas(page?) {
    let url = GLOBAL.urlAPI + 'areas';
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /*
   * Está función nos permite obtener el área requerida.
   */
  getArea(id) {
    let url = GLOBAL.urlAPI + 'area/' + id;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
  
  /*
   * Esta función nos permite actualizar los datos del 
   * área seleccionada 
   */
  updateArea(id, area){
    let url = GLOBAL.urlAPI + 'area/' + id;

    if (!area.responsible) {
      delete area.responsible;
    }

    return this.http.put( url, area, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
}
