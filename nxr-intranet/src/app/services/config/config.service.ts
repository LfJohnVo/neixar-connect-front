import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
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

  getDataConfiguration() {
    let url = GLOBAL.urlAPI + 'getConfig';

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res.data;
      })
    );
  }

  updateDataConfiguration(id, configData){
    let url = GLOBAL.urlAPI + 'updateConfig/' + id;

    return this.http.put( url, configData, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
