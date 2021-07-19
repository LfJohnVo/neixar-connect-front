import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
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
   * Esta función nos permite crear un nuevo puesto
   */
  saveRequisition( requisition ) {
    let url = GLOBAL.urlAPI + 'recruitment';
    
    return this.http.post( url, requisition, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getRequisitionsByPetitioner( petitionerId, page? ) {
    let url = GLOBAL.urlAPI + 'recruitmentsByPetitioner/' + petitionerId;
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        let response = res;
        response.data = res.data.map( (requisition, index) => {
          return index === 0 ? requisition : { _id: requisition._id, position: { positionName: requisition.position.positionName} };
        });
        
        return response;
      })
    );
  }

  getRequisition( requisitionId ) {
    let url = GLOBAL.urlAPI + 'recruitments/' + requisitionId;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getRecruitmentsToValidate( areaCode, userId, page? ) {
    let url = GLOBAL.urlAPI + `getRecruitmentsToValidate/${areaCode}/${userId}`;
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        let response = res;
        response.data = res.data.map( (requisition, index) => {
          return index === 0 ? requisition : { _id: requisition._id, position: { positionName: requisition.position.positionName} };
        });
        
        return response;
      })
    );
  }

  requisitionValidation( requisitionId, validatorCode, validatorName ) {
    let url = GLOBAL.urlAPI + `validatedRecruitment/${requisitionId}/${validatorCode}`;

    return this.http.put( url, validatorName, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  updateRequisition(id, requisition){
    let url = GLOBAL.urlAPI + 'updateRecruitment/' + id;

    return this.http.put( url, requisition, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  requisitionRejection( id, cause, validatorCode ) {
    let url = GLOBAL.urlAPI + `refuseRequisition/${id}/${validatorCode}`;

    return this.http.put( url, cause, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  isRequisitionValidator( employeeId ) {
    let url = GLOBAL.urlAPI + 'validatedLeaderOrValidator/' + employeeId;    
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  assignRequisition( requisitionId, recruiter ) {
    let url = GLOBAL.urlAPI + `assignRecruiter/${requisitionId}`;

    return this.http.put( url, recruiter, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  reassignRequisition( requisitionId, recruiter ) {
    let url = GLOBAL.urlAPI + `reassignRecruiter/${requisitionId}`;

    return this.http.put( url, recruiter, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getRecruitmentsToBeAssigned( page? ) {
    let url = GLOBAL.urlAPI + 'getRecruitmentsToBeAssigned';
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  recruitmentsByRecruiter( recruiterId, page? ) {
    let url = GLOBAL.urlAPI + `recruitmentsByRecruiter/${recruiterId}`;
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
  
  getAllAssignmentsByStatus( page? ) {
    let url = GLOBAL.urlAPI + 'recrutmentsStatus';
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCurrentRecruitments( id ,page? ) {
    let url = GLOBAL.urlAPI + `currentRecruitments/${id}`;
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getExpiredRecruitments( id ,page? ) {
    let url = GLOBAL.urlAPI + `expiredRecruitments/${id}`;
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCompletedRecruitments( id ,page? ) {
    let url = GLOBAL.urlAPI + `recruitmentCovered/${id}`;
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getClosedRecruitments( page? ) {
    let url = GLOBAL.urlAPI + 'recruitmentClosed';
    if(page) url = url + '/' +page;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  assignCandidate( requisitionId, candidate ) {
    let url = GLOBAL.urlAPI + `assignCandidate/${requisitionId}`;
    
    return this.http.post( url, candidate, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getRecruitmentDashboardInfo( userId? ) {
    let url = GLOBAL.urlAPI + 'dashboardRecruitments';
    if(userId) url = url + '/' +userId;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getRequisitionCandidateInfo( candidateId ) {
    let url = GLOBAL.urlAPI + `candidateInfo/${candidateId}`;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  storeEvaluationsOfCandidate( candidateId, comments ) {
    let url = GLOBAL.urlAPI + `storeEvaluationsOfCandidate/${candidateId}`;
    
    return this.http.post( url, comments, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  getCandidatesToInterview( interviewerId ) {
    let url = GLOBAL.urlAPI + `getCandidatesToInterview/${interviewerId}`;
    
    return this.http.get( url, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  saveInterview( vacancyId, candidateId, interviewReport ) {
    let url = GLOBAL.urlAPI + `interviews/${vacancyId}/${candidateId}`;
    
    return this.http.post( url, interviewReport, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  closeVacant( vacancyId, candidates ) {
    let url = GLOBAL.urlAPI + `vacantCover/${ vacancyId }`;

    return this.http.put( url, candidates, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  earlyCloseVacant( vacancyId, comments ) {
    let url = GLOBAL.urlAPI + `closedRecruitment/${ vacancyId }`;

    return this.http.put( url, comments, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
