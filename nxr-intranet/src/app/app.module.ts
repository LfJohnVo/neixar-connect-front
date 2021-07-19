import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

// Rutas
import { APP_ROUTING } from './app.routes';

// Módulos
import { SharedModule } from './shared/shared.module';

// Componentes
import { AppComponent } from './app.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoginComponent } from './login/login.component';
import { ResetPassComponent } from './login/reset-pass.component';
import { PagesComponent } from './pages/pages.component';

// Servicios
import { ServiceModule } from './services/service.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ResetPassComponent,
    PagesComponent
  ],
  imports: [
    BrowserModule,
    APP_ROUTING,
    ServiceModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
