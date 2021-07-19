import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styles: []
})
export class PaginationComponent implements OnInit {
  
  currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() pages: number[] = [];
  @Output() selectedPage: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  changePage( page ) {
    this.currentPage = page;
    this.selectedPage.emit( page )
  }

}
