import { Component, OnInit } from '@angular/core';
import {
  EmployeeService,
  NxrevaluationsService,
  ExcelService
} from "../../services/sevice.index";
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styles: []
})
export class SummaryComponent implements OnInit {
  errorMessage: String;
  evaluations: any[];
  excelData: any[];
  evalHist: any[];
  evalHist2: any[];
  // yearSelected: number = moment().year();
  periodSelected: number = (moment().month() <= 5 ) ? 2 : 1;
  // periodSelected: number = (moment().isAfter( moment(GLOBAL.secondPEendDate, 'DD/MM hh:mm:ss') ) ) ? 2 : 1; 
  yearSelected: number = moment().isAfter( moment(GLOBAL.firstPEendDate, 'DD/MM hh:mm:ss') ) ? moment().year() : moment().year() -1 ; 
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pages2: number[] = [];
  currentPage2: number = 1;
  totalPages2: number = 1;
  doughnutChartLabels:string[] = ['Evaluados', 'Sin Evaluar'];
  doughnutChartData:number[] = [];

  constructor(
    public _employeeService: EmployeeService,
    public _evaluationService: NxrevaluationsService,
    private spinner: NgxSpinnerService,
    public router: Router,
    private excelService: ExcelService) {      
      console.log(this.periodSelected, this.yearSelected);
     }

  ngOnInit() {
    this.getEvalHistory();
    this.getEvalHistory(1);
    this.getEvals(this.yearSelected, this.periodSelected, 1);
    this.getEmployeesEval(this.yearSelected, this.periodSelected);
  }

  getEvals(year, period, page?) {
    this.spinner.show();
    this._evaluationService.getEvaluations(year, period, page).subscribe(
      res => {
        if(page) {
        this.evaluations = res.data;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.pages = this._employeeService.getPages(res.totalPages, res.currentPage);
        } else {
          this.excelData = res.data;
          this.generateExcel();
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getEvalHistory(page?) {
    this.spinner.show();
    this._evaluationService.getEvalHistory(page).subscribe(
      res => {
        page ? this.evalHist = res.data : this.evalHist2 = res.data;
        this.currentPage2 = res.currentPage;
        this.totalPages2 = res.totalPages;
        this.pages2 = this._employeeService.getPages(res.totalPages, res.currentPage);
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  getEmployeesEval(year, period) {
    this.spinner.show();
    this._evaluationService.getEmployeesEval(year, period).subscribe(
      res => {
        let evaluated = res.data[0].evaluated;        
        let total = res.data[0].employees.total + res.counter;
        let noEvaluated = total - evaluated;
        this.doughnutChartData = [evaluated, noEvaluated];
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  fillChart(evaluation){
    let yearPeriod = evaluation.split('-');
    this.getEmployeesEval(yearPeriod[0], yearPeriod[1]);
    this.getEvals(yearPeriod[0], yearPeriod[1], 1);
    this.yearSelected = yearPeriod[0];
    this.periodSelected = yearPeriod[1];
  }

  generateExcel(){    
    this.spinner.show();
    let data: any[] = [];
    // Se preparan los datos en el formato requerido para la generación del Excel
    this.excelData.map( x => {
      let register = {
        id: x.user.id_saf,
        name: `${x.user.p_information.name} ${x.user.p_information.firstSurname} ${x.user.p_information.secondSurname}`,
        date: moment(x.date).format('DD/MM/YYYY'),
        progress: x.total,
        bonus: x.amount,
        trafficLight: x.trafficLight
      };
      data.push(register);
    });
    
    this.excelService.generateExcel(this.yearSelected, data);
  }

}
