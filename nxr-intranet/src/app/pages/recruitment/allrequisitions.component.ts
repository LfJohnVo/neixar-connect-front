import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { PositionService, EmployeeService, RecruitmentService, ConfigService } from 'src/app/services/sevice.index';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-allrequisitions',
  templateUrl: './allrequisitions.component.html',
  styles: []
})
export class AllrequisitionsComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
  });
  myJobDescriptions: any[] = [];
  myPersonnelRequisitions: any[] = [];
  pagesJD: number[] = [];
  currentPageJD: number = 1;
  totalPagesJD: number = 1;
  currentPageReq: number = 1;
  totalPagesReq: number = 1;
  pagesReq: number[] = [];
  user: any = this._employeeService.user;
  requisitionShown: any; 
  isValidator: boolean = false;
  validator: string;
  

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _positionService: PositionService,
    public _employeeService: EmployeeService,
    public _recruitmentService: RecruitmentService,
    public _configService: ConfigService
  ) { 
    this.isRequisitionValidator();
  }

  ngOnInit() {
    this.getDPByCreator(1);
    this.getRequisitionsByPetitioner(1);
  }

  /**************************************************************
****** Esta función obtiene las DPs creadas por el colaborador *****
****** que tiene la sesión iniciada.                                              *****
****************************************************************/
getDPByCreator( page? ) {
  this.spinner.show();
  this._positionService.getDPByCreator(this.user._id, page).subscribe(
    res => {
      this.myJobDescriptions = res.data;
      this.currentPageJD = res.currentPage;
      this.totalPagesJD = res.totalPages;
      this.pagesJD = this._employeeService.getPages(res.totalPages, res.currentPage);
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

getRequisitionsByPetitioner( page ) {
  this.spinner.show();
  this._recruitmentService.getRequisitionsByPetitioner(this.user._id, page).subscribe(
    res => {
      this.myPersonnelRequisitions = res.data;
      if ( page === 1 ) this.requisitionShown = res.data[0];
      this.currentPageReq = res.currentPage;
      this.totalPagesReq = res.totalPages;
      this.pagesReq = this._employeeService.getPages(res.totalPages, res.currentPage);
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

getPersonnelRequisition( requisitionId ) {
  this.spinner.show();
  this._recruitmentService.getRequisition( requisitionId ).subscribe(
    res => {
      this.requisitionShown = res.data[0];
      this.spinner.hide();
    }, 
    err => {
      this.spinner.hide();
    }
  );
}

isRequisitionValidator( ) {
  this.spinner.show();
  this._recruitmentService.isRequisitionValidator( this.user._id ).subscribe(
    res => {
      this.spinner.hide();
      this.isValidator = res.validator ? true : false;
    },
    err => {
      this.configurationNotRecovered();
    }
  );
}

// isRequisitionValidator( config ){
//   switch (this.user._id) {
//     case config.rhValidation._id:
//         this.isValidator = true;
//         this.validator = 'hr';
//       break;

//     case config.doValidation._id:
//         this.isValidator = true;
//         this.validator = 'do';
//       break;
  
//     case config.dfValidation._id:
//         this.isValidator = true;
//         this.validator = 'df';
//       break;

//     default:
//         this.isValidator = false;
//         this.validator = null;
//       break;
//   }
// }

configurationNotRecovered(){
  this.spinner.hide();
  this.router.navigateByUrl('/perfil/contrataciones');
  this.Toast.fire({
    type: 'error',
    title: 'Error al recuperar información, inténtalo de nuevo.'
  });
}

}
