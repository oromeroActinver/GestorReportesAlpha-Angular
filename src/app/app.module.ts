import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AuthGuard } from './auth.guard';
import { AuthService } from './pages/login/AuthService';
import { AuthInterceptor } from './services/AuthInterceptor';
import { DispercionComponent } from './pages/dispercion/dispercion.component';
//import { NgxPaginationModule } from 'ngx-pagination';
//import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    DispercionComponent ,
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    AuthGuard,
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } 
  ],
  bootstrap: [AppComponent, DispercionComponent]
})
export class AppModule { }
