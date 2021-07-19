import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatesService } from 'src/app/services/sevice.index';
import Swal from "sweetalert2";

@Component({
  selector: 'app-candidate-history',
  templateUrl: './candidate-history.component.html',
  styles: []
})
export class CandidateHistoryComponent implements OnInit {
  Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000
  });
  candidateId: string;
  candidate: any = {};
  vacancies: any[] = [];
  vacancy: any = {};
  interviewReport: any = {};
  interviews: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _candidateService: CandidatesService,
    public activatedRoute: ActivatedRoute
  ) { 
    window.scrollTo(0,0);
    activatedRoute.params.subscribe( params => {
      this.candidateId = params['id'];
      this.getCandidateHistory();
    });
  }

  ngOnInit() {
  }

  getCandidateHistory( ) {
    this.spinner.show();
    this._candidateService.getCandidateHistory( this.candidateId )
    .subscribe(
      res => {        
        this.candidate = res.candidate;
        this.vacancies = res.vacancies;
        if( this.vacancies.length > 0 ) {
          this.vacancy = res.vacancies[0];
          this.interviewReport = this.vacancy.candidateReport.interviews[0];
          this.interviews = this.vacancy.candidateReport.interviews;
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this.router.navigateByUrl("/capital-humano/reclutamiento");
        this.Toast.fire({
          type: "error",
          title: "Error al recuperar información, inténtalo de nuevo."
        });
      }
    );
  }

  changeVacancy( vacancyName ) {
    this.vacancy = this.vacancies.find( vacancy => vacancy.positionName === vacancyName );
  }

}
