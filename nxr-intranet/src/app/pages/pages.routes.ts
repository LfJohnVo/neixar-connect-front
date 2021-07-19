import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeamComponent } from './team/team.component';
import { EmployeesComponent } from './employees/employees.component';
import { RrhhComponent } from './rrhh/rrhh.component';
import { EditEmployeeComponent } from './employees/edit-employee.component';
import { DetailsEmployeeComponent } from './employees/details-employee.component';
import {
    LoginGuardGuard,
    AdminGuard,
    TokenVerificationGuard,
    NormativityGuard,
    // LeadersGuard, // NECESARIO PARA MÓDULO RECLUTAMIENTO
    CapitalHumanoGuardME,
    CapitalHumanoGuard,
    // RecruitmentGuard, // NECESARIO PARA MÓDULO RECLUTAMIENTO
    SafGuard,
    CvpdfGuard } from '../services/sevice.index';
import { AreasComponent } from './areas/areas.component';
import { DepartmentsComponent } from './departments/departments.component';
import { PositionsComponent } from './positions/positions.component';
import { AddObjectivesComponent } from './employees/add-objectives.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { SummaryComponent } from './evaluation/summary.component';
import { MyinfoComponent } from './profile/myinfo.component';
import { NormativityComponent } from './normativity/normativity.component';
import { SgiCalendarComponent } from './sgi/sgi-calendar.component';
import { SgiIndicatorsComponent } from './sgi/sgi-indicators.component';
import { EmployeeSummaryComponent } from './evaluation/employee-summary.component';
import { SgiResponsableViewComponent } from './sgi/sgi-responsable-view.component';
import { SgiGeneralViewComponent } from './sgi/sgi-general-view.component';
import { AddobjectivesComponent } from './evaluation/addobjectives.component';
import { PromotionComponent } from './employees/promotion.component';
import { CompanyComponent } from './team/company.component';
// import { AllrequisitionsComponent } from './recruitment/allrequisitions.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { RequisitionComponent } from './recruitment/requisition.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { RecruitmentComponent } from './recruitment/recruitment.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
import { PositionInfoComponent } from './positions/position-info.component';
import { JobDescriptionComponent } from './positions/job-description.component';
// import { EditJobDescriptionComponent } from './positions/edit-job-description.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
import { AdminComponent } from './admin/admin.component';
import { CompetenciesComponent } from './competencies/competencies.component';
import { NewCompetencyComponent } from './competencies/new-competency.component';
import { EditCompetencyComponent } from './competencies/edit-competency.component';
// import { RequisitionsToValidateComponent } from './recruitment/requisitions-to-validate.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { EditRequisitionComponent } from './recruitment/edit-requisition.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { AssignmentsComponent } from './recruitment/vacancies/assignments.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { MyVacanciesComponent } from './recruitment/vacancies/my-vacancies.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { CurrentVacanciesComponent } from './recruitment/vacancies/current-vacancies.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { ExpiredVacanciesComponent } from './recruitment/vacancies/expired-vacancies.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { CompletedVacanciesComponent } from './recruitment/vacancies/completed-vacancies.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { VacancyInfoComponent } from './recruitment/vacancies/vacancy-info.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { CandidatesComponent } from './recruitment/candidates/candidates.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { PortfolioComponent } from './recruitment/candidates/portfolio.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { InterviewsComponent } from './interviews/interviews.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { CandidateHistoryComponent } from './recruitment/candidates/candidate-history.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
// import { ClosedVacanciesComponent } from './recruitment/vacancies/closed-vacancies.component'; // NECESARIO PARA MÓDULO RECLUTAMIENTO
import { CurriculumComponent } from './curriculum/curriculum.component';
import { SearchCvComponent } from './curriculum/search-cv.component';
import { CurriculumDetailsComponent } from './curriculum/curriculum-details.component';


const pagesRoutes: Routes = [
            {
                path: 'inicio',
                component: DashboardComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Inicio'], route: ['/inicio'] }
            },
            {
                path: 'perfil',
                component: ProfileComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil'], route: ['/perfil'] }
            },
            {
                path: 'perfil/datos',
                component: MyinfoComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Mis Datos'], route: ['/perfil', 'perfil/datos'] }
            },
            {
                path: 'perfil/cv',
                component: CurriculumComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Curriculum'], route: ['/perfil', 'perfil/cv'] }
            },
            {
                path: 'perfil/buscar-cv',
                component: SearchCvComponent,
                canActivate: [TokenVerificationGuard, CvpdfGuard],
                data: { title: ['Mi Perfil', 'Buscar Curriculum'], route: ['/perfil', 'perfil/buscar-cv'] }
            },
            {
                path: 'perfil/buscar-cv/:id',
                component: CurriculumDetailsComponent,
                canActivate: [TokenVerificationGuard, CvpdfGuard],
                data: { title: ['Mi Perfil', 'Buscar Curriculum', 'Curriculum'], route: ['/perfil', '/perfil/buscar-cv', ''] }
            },
            {
                path: 'perfil/indicadores',
                component: SgiResponsableViewComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Indicadores'], route: ['/perfil', 'perfil/indicadores'] }
            },
            {
                path: 'perfil/indicadores/:id/:year',
                component: SgiCalendarComponent,
                canActivate: [ TokenVerificationGuard ],
                data: { title: ['Mi Perfil', 'Indicadores', 'Registro de Cumplimiento'], route: ['/perfil', '/perfil/indicadores', ''] }
            },
            {
                path: 'perfil/indicadores/general',
                component: SgiGeneralViewComponent,
                canActivate: [ TokenVerificationGuard ],
                data: {
                    title: ['Mi Perfil', 'Indicadores', 'Registro General de Indicadores'],
                    route: ['/perfil', '/perfil/indicadores', '/perfil/indicadores/vista/general']
                }
            },
            {
                path: 'perfil/evaluaciones',
                component: EmployeeSummaryComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Evaluaciones'], route: ['/perfil', 'perfil/evaluaciones'] }
            },
            {
                path: 'perfil/evaluaciones/objetivos',
                component: AddobjectivesComponent,
                canActivate: [TokenVerificationGuard ],
                data: { title: ['Mi Perfil', 'Evaluaciones', 'Mis Objetivos SMART'], route: ['/perfil', '/perfil/evaluaciones'] }
            },
            {
                path: 'perfil/evaluaciones/desempeño',
                component: EvaluationComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Evaluaciones', 'Evaluación de desempeño'], route: ['/perfil', '/perfil/evaluaciones'] }
            },
            {
                path: 'perfil/evaluaciones/equipo',
                component: TeamComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Evaluaciones', 'Equipo'], route: ['/perfil', '/perfil/evaluaciones'] }
            },
            {
                path: 'perfil/evaluaciones/equipo/evaluacion/:id',
                component: EvaluationComponent,
                canActivate: [TokenVerificationGuard],
                data: {
                    title: ['Mi Perfil', 'Evaluaciones', 'Equipo', 'Evaluación de desempeño'],
                    route: ['/perfil', '/perfil/evaluaciones', '/perfil/evaluaciones/equipo']
                }
            },
            /*{ // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones',
                component: AllrequisitionsComponent,
                canActivate: [LeadersGuard, TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Contrataciones'], route: ['/perfil', '/perfil/contrataciones'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones/nueva_descripcion',
                component: JobDescriptionComponent,
                canActivate: [ LeadersGuard, TokenVerificationGuard ],
                data: {
                    title: ['Mi Perfil', 'Contrataciones', 'Nueva Descripción de Puesto'],
                    route: ['/perfil', '/perfil/contrataciones']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones/descripcion/:id',
                component: PositionInfoComponent,
                canActivate: [ LeadersGuard, TokenVerificationGuard ],
                data: { title: ['Mi Perfil', 'Contrataciones', 'Descripción de Puesto'], route: ['/perfil', '/perfil/contrataciones'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones/descripcion/:id/editar',
                component: EditJobDescriptionComponent,
                canActivate: [ LeadersGuard, TokenVerificationGuard ],
                data: { title: ['Mi Perfil', 'Contrataciones', 'Editar Descripción'], route: ['/perfil', '/perfil/contrataciones'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones/requisicion',
                component: RequisitionComponent,
                canActivate: [LeadersGuard, TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Contrataciones', 'Nueva requisición'], route: ['/perfil', '/perfil/contrataciones'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones/editar-requisicion/:id',
                component: EditRequisitionComponent,
                canActivate: [LeadersGuard, TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Contrataciones', 'Editar requisición'], route: ['/perfil', '/perfil/contrataciones'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/contrataciones/validar-requisiciones',
                component: RequisitionsToValidateComponent,
                canActivate: [LeadersGuard, TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Contrataciones', 'Requisiciones por Validar'], route: ['/perfil', '/perfil/contrataciones'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'perfil/entrevistas',
                component: InterviewsComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Mi Perfil', 'Entrevistas'], route: ['/perfil'] }
            },*/
            {
                path: 'neixar',
                component: CompanyComponent,
                canActivate: [TokenVerificationGuard],
                data: { title: ['Familia NEIXAR'], route: ['/neixar'] }
            },
            {
                path: 'capital-humano',
                component: RrhhComponent,
                canActivate: [ CapitalHumanoGuard, TokenVerificationGuard ],
                data: { title: ['Capital Humano'], route: ['/capital-humano'] }
            },
            {
                path: 'capital-humano/plantilla/:id',
                component: EmployeesComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Plantilla'], route: ['/capital-humano'] }
            },
            {
                path: 'capital-humano/plantilla/activos/editar/:id',
                component: EditEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Editar Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/activos']
                }
            },
            {
                path: 'capital-humano/plantilla/activos/detalle/:id',
                component: DetailsEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Detalle Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/activos']
                }
            },
            {
                path: 'capital-humano/plantilla/activos/historia/:id',
                component: PromotionComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Historia Laboral'],
                    route: ['/capital-humano', '/capital-humano/plantilla/activos']
                }
            },
            {
                path: 'capital-humano/evaluaciones',
                component: SummaryComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Evaluaciones'], route: ['/capital-humano'] }
            },
            {
                path: 'capital-humano/evaluaciones/competencias',
                component: CompetenciesComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Evaluaciones' , 'Competencias'],
                    route: ['/capital-humano', '/capital-humano/evaluaciones']
                }
            },
            {
                path: 'capital-humano/evaluaciones/competencias/nueva_competencia',
                component: NewCompetencyComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Evaluaciones' , 'Competencias', 'Nueva Competencia'],
                    route: ['/capital-humano', '/capital-humano/evaluaciones', '/capital-humano/evaluaciones/competencias']
                }
            },
            {
                path: 'capital-humano/evaluaciones/competencias/editar/:id',
                component: EditCompetencyComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Evaluaciones' , 'Competencias', 'Editar Competencia'],
                    route: ['/capital-humano', '/capital-humano/evaluaciones', '/capital-humano/evaluaciones/competencias']
                }
            },
            {
                path: 'capital-humano/plantilla/evaluacion/objetivos/:id',
                component: AddObjectivesComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Evaluaciones', 'Plantilla', 'Asignar Objetivos'],
                    route: ['/capital-humano', '/capital-humano/evaluaciones', '/capital-humano/plantilla/evaluacion']
                }
            },
            {
                path: 'capital-humano/plantilla/bajas/detalle/:id',
                component: DetailsEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Detalle Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/bajas']
                }
            },
            {
                path: 'capital-humano/plantilla/determinado/detalle/:id',
                component: DetailsEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Detalle Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/determinado']
                }
            },
            {
                path: 'capital-humano/plantilla/indeterminado/detalle/:id',
                component: DetailsEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Detalle Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/indeterminado']
                }
            },
            {
                path: 'capital-humano/plantilla/mujeres/detalle/:id',
                component: DetailsEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Detalle Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/mujeres']
                }
            },
            {
                path: 'capital-humano/plantilla/hombres/detalle/:id',
                component: DetailsEmployeeComponent,
                canActivate: [ SafGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Plantilla', 'Detalle Colaborador'],
                    route: ['/capital-humano', '/capital-humano/plantilla/hombres']
                }
            },
            {
                path: 'capital-humano/areas',
                component: AreasComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Áreas'], route: ['/capital-humano'] }
            },
            {
                path: 'capital-humano/departamentos',
                component: DepartmentsComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Departamentos'], route: ['/capital-humano'] }
            },
            {
                path: 'capital-humano/puestos',
                component: PositionsComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Puestos'], route: ['/capital-humano'] }
            },
            {
                path: 'capital-humano/puestos/validar-descripcion/:id',
                component: PositionInfoComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Puestos', 'Descripción de Puesto'],
                    route: ['/capital-humano', '/capital-humano/puestos']
                }
            },
            {
                path: 'capital-humano/puestos/:id',
                component: PositionInfoComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Puestos', 'Descripción de Puesto'],
                    route: ['/capital-humano', '/capital-humano/puestos']
                }
            },
            {
                path: 'capital-humano/puestos/:id/nueva_descripcion',
                component: JobDescriptionComponent,
                canActivate: [ CapitalHumanoGuardME, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Puestos', 'Nueva Descripción'], route: ['/capital-humano', '/capital-humano/puestos'] }
            },
            /*{ // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento',
                component: RecruitmentComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: { title: ['Capital Humano', 'Reclutamiento'], route: ['/capital-humano'] }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/asignaciones',
                component: AssignmentsComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Asignaciones'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/asignaciones/:id',
                component: VacancyInfoComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Asignaciones', 'Detalles'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/asignaciones']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/mis-vacantes',
                component: MyVacanciesComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Mis Vacantes'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/mis-vacantes/:id',
                component: VacancyInfoComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Mis Vacantes', 'Detalles'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/mis-vacantes']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-vigentes',
                component: CurrentVacanciesComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Vigentes'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-vigentes/:id',
                component: VacancyInfoComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Vigentes', 'Detalles'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/vacantes-vigentes']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-vencidas',
                component: ExpiredVacanciesComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Vencidas'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-vencidas/:id',
                component: VacancyInfoComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Vencidas', 'Detalles'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/vacantes-vencidas']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-cubiertas',
                component: CompletedVacanciesComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Cubiertas'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-cubiertas/:id',
                component: VacancyInfoComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Cubiertas', 'Detalles'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/vacantes-cubiertas']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-cerradas',
                component: ClosedVacanciesComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Cerradas'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/vacantes-cerradas/:id',
                component: VacancyInfoComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Vacantes Cerradas', 'Detalles'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/vacantes-cerradas']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/candidatos',
                component: CandidatesComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Candidatos'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/candidatos/:id',
                component: CandidateHistoryComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Candidatos', 'Historial del Candidato'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/candidatos']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/cartera-neixar',
                component: PortfolioComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Cartera NEIXAR'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento']
                }
            },
            { // NECESARIO PARA MÓDULO RECLUTAMIENTO
                path: 'capital-humano/reclutamiento/cartera-neixar/:id',
                component: CandidateHistoryComponent,
                canActivate: [ RecruitmentGuard, TokenVerificationGuard ],
                data: {
                    title: ['Capital Humano', 'Reclutamiento', 'Cartera NEIXAR', 'Historial del Candidato'],
                    route: ['/capital-humano', '/capital-humano/reclutamiento', '/capital-humano/reclutamiento/cartera-neixar']
                }
            },*/
            {
                path: 'sgi',
                component: NormativityComponent,
                canActivate: [ NormativityGuard, TokenVerificationGuard ],
                data: { title: ['SGI'], route: ['/sgi'] }
            },
            {
                path: 'sgi/indicadores',
                component: SgiIndicatorsComponent,
                canActivate: [ NormativityGuard, TokenVerificationGuard ],
                data: { title: ['SGI', 'Indicadores'], route: ['/sgi'] }
            },
            {
                path: 'sgi/indicadores/:id/:year',
                component: SgiCalendarComponent,
                canActivate: [ NormativityGuard, TokenVerificationGuard ],
                data: { title: ['SGI', 'Indicadores', 'Registro de Evaluaciones'], route: ['/sgi', '/sgi/indicadores', ''] }
            },
            {
                path: 'administrador',
                component: AdminComponent,
                canActivate: [ AdminGuard, TokenVerificationGuard ],
                data: { title: ['Administrador'], route: ['/administrador'] }
            },
            { path: '', pathMatch: 'full', redirectTo: 'inicio' }
];

export const PAGES_ROUTES = RouterModule.forChild( pagesRoutes );
