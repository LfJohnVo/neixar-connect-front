import { Component, OnInit } from '@angular/core';
import { CurriculumService, EmployeeService } from 'src/app/services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-search-cv',
  templateUrl: './search-cv.component.html',
  styleUrls: []
})
export class SearchCvComponent implements OnInit {

  employees: any[] = [];
  term: String = '';
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  total: number;
  searched: Boolean =  false;

  constructor(
    private spinner: NgxSpinnerService,
    public _cvService: CurriculumService,
    public _employeeService: EmployeeService
  ) { }

  ngOnInit() {
  }

  search(page) {
    if(this.term.length > 0) {
      this.spinner.show();
      this.searched = true;
      this._cvService.searchKnowledge(this.term, page).subscribe(
        res => {
          this.employees = res.data;
          this.total = res.total;
          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          this.pages = this._employeeService.getPages(res.totalPages, res.currentPage );
          this.spinner.hide();
        },
        err => {
          this.spinner.hide();
        }
      );
    } else this.searched = false;
  }

}
