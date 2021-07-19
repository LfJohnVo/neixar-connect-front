import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { EmployeeService, CandidatesService } from "../../../services/sevice.index";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { CandidateFormComponent } from 'src/app/components/candidate-form/candidate-form.component';
import * as moment from "moment";
declare var $: any;

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styles: []
})
export class PortfolioComponent implements OnInit {
  @ViewChild("editCandidateForm") editCandidateComponent: CandidateFormComponent;
  Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000
  });
  candidates: any[] = [];
  candidateInfo: any;
  currentPage: number = 1;
  totalPages: number = 1;
  total: number;
  pages: number[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public _employeeService: EmployeeService,
    public _candidatesService: CandidatesService
  ) { 
    window.scrollTo(0,0);
  }

  ngOnInit() {
    this.getCandidates(1);
  }

  getCandidates(page) {
    this.spinner.show();
    this._candidatesService.getCandidatesInPortfolio(page).subscribe(
      res => {
        this.spinner.hide();
        this.candidates = res.data;
        this.total = res.total;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.pages = this._employeeService.getPages( res.totalPages, res.currentPage );
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

  getCandidate(candidateId) {
    this.spinner.show();
    this._candidatesService.getCandidateInfo(candidateId).subscribe(
      res => {
        this.candidateInfo = res.data;
        this.showInformationToEdit();
      },
      err => {
        this.spinner.hide();
        this.Toast.fire({
          type: "error",
          title: "Error al recuperar información, inténtalo de nuevo."
        });
      }
    );
  }

  showInformationToEdit() {
    this.editCandidateComponent.errorMessage = "";
    this.editCandidateComponent.candidateForm.patchValue({
      name: this.candidateInfo.name,
      firstSurname: this.candidateInfo.firstSurname,
      secondSurname: this.candidateInfo.secondSurname,
      gender: this.candidateInfo.gender,
      birthdate: moment(this.candidateInfo.birthdate).format("DD/MM/YYYY"),
      phone_number: this.candidateInfo.phone_number,
      email: this.candidateInfo.email,
      address: this.candidateInfo.address,
      marital_status: this.candidateInfo.marital_status,
      scholarship: this.candidateInfo.scholarship,
      courses: this.candidateInfo.courses,
      english_level: this.candidateInfo.english_level,
      certification: this.candidateInfo.certification.toString(),
      economic_claims: this.candidateInfo.economic_claims,
      source: this.candidateInfo.source
    });
    $("#editCandidateModal").modal("show");
    this.spinner.hide();
  }

  editCandidate(candidateData) {
    this.spinner.show();
    this._candidatesService.updateCandidate( this.candidateInfo._id, candidateData).subscribe(
      res => {
        this.spinner.hide();
        this.Toast.fire({
          type: "success",
          title: "Información editada correctamente."
        });
        $("#editCandidateModal").modal("hide");
        this.getCandidates(1);
      },
      err => {
        this.spinner.hide();
        this.editCandidateComponent.errorMessage = err.message;
        this.Toast.fire({
          type: "error",
          title: "Error al editar información, inténtalo de nuevo."
        });
      }
    );
  }

}
