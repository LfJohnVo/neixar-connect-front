import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-interview-report-details',
  templateUrl: './interview-report-details.component.html',
  styles: []
})
export class InterviewReportDetailsComponent implements OnInit {

  @Input() report: any;  
  @Input() reports: any[] = [];
  showCandidateAndVacancy: boolean = true;

  constructor(
    public router: Router
  ) { 
    if( this.router.url.indexOf('/candidatos') > -1 || this.router.url.indexOf('/cartera-neixar') > -1 ) this.showCandidateAndVacancy = false;
  }

  ngOnInit() {
  }

  changeReport( interviewer ) {
    this.report = this.reports.find( report => report.interviewerName === interviewer );
  }

}
