import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompetenciesService {
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

  saveCompetency( competency ) {
    let url = GLOBAL.urlAPI + 'competency';

    return this.http.post( url, competency, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCompetenciesByTypePosition( typePosition ) {
    let url = GLOBAL.urlAPI +  `getCompetenciesByTypePosition/${ typePosition }`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getAllCompetencies( page? ) {
    let url = GLOBAL.urlAPI + 'getCompetencies';
    if(page) url = url + '/' +page;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return this.typePositionFormatting(res);
      })
    );
  }

  typePositionFormatting( APIresponse ) {
    APIresponse.data = APIresponse.data.map( competency => {
      competency.typePosition = competency.typePosition.join(", ");
      return competency;
    })
    return APIresponse;
  }

  getCompetency( competencyId ) {
    let url = GLOBAL.urlAPI + 'getCompetency/' + competencyId;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  updateCompetency(id, competency){
    let url = GLOBAL.urlAPI + 'updateCompetencies/' + id;

    return this.http.put( url, competency, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
  

}
