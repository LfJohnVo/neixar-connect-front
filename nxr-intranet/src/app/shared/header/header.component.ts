import { Component, OnInit } from '@angular/core';
import { HeaderService, EmployeeService } from '../../services/sevice.index';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit {

  constructor( public _header: HeaderService,
              public _employeeService: EmployeeService) { }

  ngOnInit() {
    this._header.showMenu();
  }

}
