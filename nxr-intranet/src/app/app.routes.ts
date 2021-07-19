import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { NopagefoundComponent } from './shared/nopagefound/nopagefound.component';
import { ResetPassComponent } from './login/reset-pass.component';
import { PagesComponent } from './pages/pages.component';
import { LoginGuardGuard } from './services/sevice.index';

const APP_ROUTES: Routes = [

    { path: 'login', component: LoginComponent, data: { title: ['NEIXAR CONNECT'] }},
    { path: 'restablecer_contraseña/:token', component: ResetPassComponent, data: { title: ['Restablecer contraseña'] }},
    {
        path: '',
        component: PagesComponent,
        canActivate: [ LoginGuardGuard ],
        loadChildren: './pages/pages.module#PagesModule'
    },
    { path: '**', component: NopagefoundComponent },
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
