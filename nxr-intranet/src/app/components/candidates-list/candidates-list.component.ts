import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeService } from 'src/app/services/sevice.index';

@Component({
  selector: 'app-candidates-list',
  templateUrl: './candidates-list.component.html',
  styles: []
})
export class CandidatesListComponent implements OnInit {

  @Input() candidates: any[] = []; 
  @Input() currentPage: number;
  @Output() getCandidate: EventEmitter<string> = new EventEmitter();
  isRecruiter: boolean = false;

  constructor(
    public _employeeService: EmployeeService
  ) {
    this.isRecruiter = this._employeeService.user.role === 'CH4' ? true : false;
   }

  ngOnInit() {
  }

  getCandidateInfo( id ) {
    this.getCandidate.emit( id )
  }

}
