import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {
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

  getStorage() {
    if ( localStorage.getItem('token') ) {
      this.token = localStorage.getItem('token');
    } else {
      this.token = '';
    }
  }

  saveCandidate( candidate ) {
    let url = GLOBAL.urlAPI + 'candidates';
    
    return this.http.post( url, candidate, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getNewAndInProcessCandidates( page? ) {
    let url = GLOBAL.urlAPI + 'getCandidates';
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCandidatesToAssign( page? ) {
    let url = GLOBAL.urlAPI + 'getCandidatesToAssign';
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCandidateInfo( candidateId ) {
    let url = GLOBAL.urlAPI + `getCandidateInformation/${candidateId}`;

    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  updateCandidate(candidateId, candidateInfo) {
    let url = GLOBAL.urlAPI + 'updateCandidateInfo/' + candidateId;

    return this.http.put( url, candidateInfo, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCandidatesInPortfolio( page? ) {
    let url = GLOBAL.urlAPI + 'getCandidatesInPortfolio';
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCandidateHistory( candidateId ) {
    let url = GLOBAL.urlAPI + `candidateInfo/${candidateId}`;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        let candidate: any = {};
        let vacancies: any[] = [];
        
        if(res.data) {
          candidate = res.data[0].candidates[0].candidate;
          
          vacancies = res.data.map( vacancy => {
            let candidateReport = vacancy.candidates[0];
            delete candidateReport.candidate;

            let vacancyInfo = {
              positionName: vacancy.position.positionName,
              candidateReport
            };
            return vacancyInfo;
          }); 
        } else {
          candidate = res.info
        }

        let response = {
          candidate,
          vacancies
        };

        return response;
      })
    );
  }

  candidateRejection( vacancyId, candidateId, data ) {
    let url = GLOBAL.urlAPI + `refuseCandidate/${ vacancyId }/${ candidateId }`;

    return this.http.put( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  candidateApproval( vacancyId, candidateId, data ) {
    let url = GLOBAL.urlAPI + `approveCandidate/${ vacancyId }/${ candidateId }`;

    return this.http.put( url, data, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
