import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
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
   * Esta función nos permite solicitar el envío de notificación por correo cuando el jefe directo
   * ha finalizado la evaluación de desempeño de su colaborador.
   */
    performanceEvaluationFinish( email ) {
    let url = GLOBAL.urlAPI + 'sendMailToEmployee';

    return this.http.post( url, email, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite solicitar el envío de notificación por correo cuando el colaborador
   * ha finalizado de registrar el avance  de sus objetivos en la evaluación de desempeño.
   */
   nxrobjectiveRegistered( email ) {
    let url = GLOBAL.urlAPI + 'sendMailToBoss';

    return this.http.post( url, email, this.generateHeaders() ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite solicitar el envío de notificación por correo para el 
   * restablecimiento de la contraseña.
   */
  resetPass( email ) {
    let url = GLOBAL.urlAPI + 'sendMailResetPass';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite solicitar el envío de notificación por correo para el 
   * hacerle saber al jefe directo que su colaborador ha registrado sus objetivos.
   */
  nxrApproveObjectives( email ) {
    let url = GLOBAL.urlAPI + 'sendMailApprovalObjectives';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite solicitar el envío de notificación por correo 
   * de la creación de una nueva DP
   */
  newJobDescription( email ) {
    let url = GLOBAL.urlAPI + 'sendMailCreatedDP';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

   /* 
   * Esta función nos permite solicitar el envío de notificación por correo 
   * de la edición de una DP
   */
  editJobDescription( email ) {
    let url = GLOBAL.urlAPI + 'sendMailEditedDP';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite solicitar el envío de notificación por correo 
   * del rechazo de una DP
   */
  rejectJobDescription( email ) {
    let url = GLOBAL.urlAPI + 'sendMailRejectedDP';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  /* 
   * Esta función nos permite solicitar el envío de notificación por correo 
   * de la aprobación de una DP
   */
  validateJobDescription( email ) {
    let url = GLOBAL.urlAPI + 'sendMailValidatedDP';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendNotificationNewPersonnelRequisition( email ) {
    let url = GLOBAL.urlAPI + 'sendMailCreatedRecruitment';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendNotificationEditPersonnelRequisition( email ) {
    let url = GLOBAL.urlAPI + 'sendMailEditRecruitment';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendNotificationPersonnelRequisitionApproved( email ) {
    let url = GLOBAL.urlAPI + 'sendMailRecruitmentApproved';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendNotificationPersonnelRequisitionRejected( email ) {
    let url = GLOBAL.urlAPI + 'sendMailRejectionRecruitment';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendNotificationRequisitionAssigned( email ) {
    let url = GLOBAL.urlAPI + 'sendMailAssignRecruitmentToRecruitment';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }
  
  sendMailRegisterEvaluation( email ) {
    let url = GLOBAL.urlAPI + 'sendMailRegisterEvaluation';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendMailRequisitionCovered( email ) {
    let url = GLOBAL.urlAPI + 'sendMailRequisitionCovered';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendMailNewEmployee( email ) {
    let url = GLOBAL.urlAPI + 'sendMailNewEmployee';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

  sendMailRequisitionClosed( email ) {
    let url = GLOBAL.urlAPI + 'sendMailRequisitionClosed';

    return this.http.post( url, email ).pipe(
      map( (res: any) => {
        return res;
      })
    );
  }

}
