import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { 
  HeaderService,
  SharedService,
  EmployeeService,
  AreasService,
  DepartmentsService,
  PositionService,
  ObjectiveService,
  NxrevaluationsService,
  LoginGuardGuard,
  AdminGuard,
  TokenVerificationGuard,
  NcindicatorsService,
  NcevaluationsService,
  NormativityGuard,
  UploadImageService,
  ChartsService,
  EmailService,
  ExcelService,
  RecruitmentService,
  LeadersGuard,
  ConfigService,
  CompetenciesService,
  CandidatesService,
  CapitalHumanoGuardME,
  CapitalHumanoGuard,
  RecruitmentGuard,
  SafGuard,
  CurriculumService,
  CvpdfGuard
 } from './sevice.index';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    HeaderService,
    SharedService,
    EmployeeService,
    AreasService,
    DepartmentsService,
    PositionService,
    ObjectiveService,
    NxrevaluationsService,
    LoginGuardGuard,
    AdminGuard,
    TokenVerificationGuard,
    NcindicatorsService,
    NcevaluationsService,
    NormativityGuard,
    UploadImageService,
    ChartsService,
    EmailService,
    ExcelService,
    RecruitmentService,
    LeadersGuard,
    ConfigService,
    CompetenciesService,
    CandidatesService,
    CapitalHumanoGuardME,
    CapitalHumanoGuard,
    RecruitmentGuard,
    SafGuard,
    CurriculumService,
    CvpdfGuard
  ],
  declarations: []
})
export class ServiceModule { }
