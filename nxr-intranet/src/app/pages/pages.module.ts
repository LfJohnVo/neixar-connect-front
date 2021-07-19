import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Rutas
import { PAGES_ROUTES } from './pages.routes';

// Módulos
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';

// Componentes
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { EmployeesComponent } from './employees/employees.component';
import { TeamComponent } from './team/team.component';
import { RrhhComponent } from './rrhh/rrhh.component';
import { EditEmployeeComponent } from './employees/edit-employee.component';
import { DetailsEmployeeComponent } from './employees/details-employee.component';
import { AreasComponent } from './areas/areas.component';
import { SummaryComponent } from './evaluation/summary.component';
import { DoughnutChartComponent } from '../components/doughnut-chart/doughnut-chart.component';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { MyinfoComponent } from './profile/myinfo.component';
import { GaugeChartComponent } from '../components/gauge-chart/gauge-chart.component';
import { RequisitionComponent } from './recruitment/requisition.component';
import { AllrequisitionsComponent } from './recruitment/allrequisitions.component';


// Spinner Module
import { NgxSpinnerModule } from 'ngx-spinner';

// Pipe Module
import { PipesModule } from '../pipes/pipes.module';
import { DepartmentsComponent } from './departments/departments.component';
import { PositionsComponent } from './positions/positions.component';
import { AddObjectivesComponent } from './employees/add-objectives.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { NormativityComponent } from './normativity/normativity.component';
import { SgiCalendarComponent } from './sgi/sgi-calendar.component';
import { SgiIndicatorsComponent } from './sgi/sgi-indicators.component';
import { EmployeeSummaryComponent } from './evaluation/employee-summary.component';
import { SgiResponsableViewComponent } from './sgi/sgi-responsable-view.component';
import { SgiGeneralViewComponent } from './sgi/sgi-general-view.component';
import { AddobjectivesComponent } from './evaluation/addobjectives.component';
import { PromotionComponent } from './employees/promotion.component';
import { CompanyComponent } from './team/company.component';
import { RecruitmentComponent } from './recruitment/recruitment.component';
import { PositionInfoComponent } from './positions/position-info.component';
import { JobDescriptionComponent } from './positions/job-description.component';
import { JobDescriptionFormComponent } from '../components/job-description-form/job-description-form.component';
import { EditJobDescriptionComponent } from './positions/edit-job-description.component';
import { AdminComponent } from './admin/admin.component';
import { ConfigurationsComponent } from './admin/configurations.component';
import { CompetenciesComponent } from './competencies/competencies.component';
import { CompetenciesFormComponent } from '../components/competencies-form/competencies-form.component';
import { NewCompetencyComponent } from './competencies/new-competency.component';
import { EditCompetencyComponent } from './competencies/edit-competency.component';
import { RequisitionFormComponent } from '../components/requisition-form/requisition-form.component';
import { RequisitionsToValidateComponent } from './recruitment/requisitions-to-validate.component';
import { RequisitionDetailsComponent } from '../components/requisition-details/requisition-details.component';
import { EditRequisitionComponent } from './recruitment/edit-requisition.component';
import { AssignmentsComponent } from './recruitment/vacancies/assignments.component';
import { VacanciesListComponent } from '../components/vacancies-list/vacancies-list.component';
import { MyVacanciesComponent } from './recruitment/vacancies/my-vacancies.component';
import { CurrentVacanciesComponent } from './recruitment/vacancies/current-vacancies.component';
import { ExpiredVacanciesComponent } from './recruitment/vacancies/expired-vacancies.component';
import { CompletedVacanciesComponent } from './recruitment/vacancies/completed-vacancies.component';
import { VacancyInfoComponent } from './recruitment/vacancies/vacancy-info.component';
import { CandidatesComponent } from './recruitment/candidates/candidates.component';
import { CandidatesListComponent } from '../components/candidates-list/candidates-list.component';
import { CandidateFormComponent } from '../components/candidate-form/candidate-form.component';
import { PortfolioComponent } from './recruitment/candidates/portfolio.component';
import { SgiIndicatorsChartComponent } from '../components/sgi-indicators-chart/sgi-indicators-chart.component';
import { InterviewsComponent } from './interviews/interviews.component';
import { InterviewReportDetailsComponent } from '../components/interview-report-details/interview-report-details.component';
import { CandidateHistoryComponent } from './recruitment/candidates/candidate-history.component';
import { ClosedVacanciesComponent } from './recruitment/vacancies/closed-vacancies.component';
import { CurriculumComponent } from './curriculum/curriculum.component';
import { SearchCvComponent } from './curriculum/search-cv.component';
import { CurriculumDetailsComponent } from './curriculum/curriculum-details.component';

@NgModule({
    declarations: [
        DashboardComponent,
        ProfileComponent,
        EmployeesComponent,
        TeamComponent,
        RrhhComponent,
        EditEmployeeComponent,
        DetailsEmployeeComponent,
        AreasComponent,
        DepartmentsComponent,
        PositionsComponent,
        AddObjectivesComponent,
        EvaluationComponent,
        SummaryComponent,
        DoughnutChartComponent,
        PaginationComponent,
        MyinfoComponent,
        NormativityComponent,
        SgiCalendarComponent,
        SgiIndicatorsComponent,
        EmployeeSummaryComponent,
        SgiResponsableViewComponent,
        SgiGeneralViewComponent,
        AddobjectivesComponent,
        PromotionComponent,
        GaugeChartComponent,
        CompanyComponent,
        RequisitionComponent,
        AllrequisitionsComponent,
        RecruitmentComponent,
        PositionInfoComponent,
        JobDescriptionComponent,
        JobDescriptionFormComponent,
        EditJobDescriptionComponent,
        AdminComponent,
        ConfigurationsComponent,
        CompetenciesComponent,
        CompetenciesFormComponent,
        NewCompetencyComponent,
        EditCompetencyComponent,
        RequisitionFormComponent,
        RequisitionsToValidateComponent,
        RequisitionDetailsComponent,
        EditRequisitionComponent,
        AssignmentsComponent,
        VacanciesListComponent,
        MyVacanciesComponent,
        CurrentVacanciesComponent,
        ExpiredVacanciesComponent,
        CompletedVacanciesComponent,
        VacancyInfoComponent,
        CandidatesComponent,
        CandidatesListComponent,
        CandidateFormComponent,
        PortfolioComponent,
        SgiIndicatorsChartComponent,
        InterviewsComponent,
        InterviewReportDetailsComponent,
        CandidateHistoryComponent,
        ClosedVacanciesComponent,
        CurriculumComponent,
        SearchCvComponent,
        CurriculumDetailsComponent
    ],
    exports: [
        DashboardComponent,
        ProfileComponent,
        EmployeesComponent,
        TeamComponent,
        RrhhComponent,
        EditEmployeeComponent,
        DetailsEmployeeComponent,
        AreasComponent,
        DepartmentsComponent,
        PositionsComponent,
        AddObjectivesComponent,
        EvaluationComponent,
        SummaryComponent,
        MyinfoComponent,
        NormativityComponent,
        EmployeeSummaryComponent,
        SgiCalendarComponent,
        SgiIndicatorsComponent,
        SgiResponsableViewComponent,
        SgiGeneralViewComponent,
        AddobjectivesComponent,
        PromotionComponent,
        CompanyComponent,
        RequisitionComponent,
        AllrequisitionsComponent,
        RecruitmentComponent,
        PositionInfoComponent,
        JobDescriptionComponent,
        JobDescriptionFormComponent,
        EditJobDescriptionComponent,
        AdminComponent,
        ConfigurationsComponent,
        CompetenciesComponent,
        CompetenciesFormComponent,
        NewCompetencyComponent,
        EditCompetencyComponent,
        RequisitionFormComponent,
        RequisitionsToValidateComponent,
        RequisitionDetailsComponent,
        EditRequisitionComponent,
        AssignmentsComponent,
        VacanciesListComponent,
        MyVacanciesComponent,
        CurrentVacanciesComponent,
        ExpiredVacanciesComponent,
        CompletedVacanciesComponent,
        VacancyInfoComponent,
        CandidatesComponent,
        CandidatesListComponent,
        CandidateFormComponent,
        PortfolioComponent,
        SgiIndicatorsChartComponent,
        InterviewReportDetailsComponent,
        CandidateHistoryComponent,
        ClosedVacanciesComponent,
        CurriculumComponent,
        SearchCvComponent,
        CurriculumDetailsComponent

    ],
    imports: [
        SharedModule,
        PAGES_ROUTES,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        PipesModule,
        ChartsModule
    ]
})
export class PagesModule {}
