import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AuthGuard } from './auth.guard';
import { AuthService } from './pages/login/AuthService';
import { AuthInterceptor } from './services/AuthInterceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from './app.component';
import { DispercionComponent } from './pages/dispercion/dispercion.component';
<<<<<<< HEAD
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { RendimientosComponent } from './pages/rendimientos/rendimientos.component';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { MatMenuModule } from '@angular/material/menu';
//import { CardComponent } from './card.component';


registerLocaleData(localeEs, 'es');

// Definir los formatos de fecha en español
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

=======
import { MessageDialogComponent } from './message-dialog/message-dialog.component'; // Conservando este componente
>>>>>>> bef7ed8fe65805fe20396315734200105ff2bd61

@NgModule({
  declarations: [
    AppComponent,
<<<<<<< HEAD
    RendimientosComponent,
    DispercionComponent
=======
    DispercionComponent,
    MessageDialogComponent // Componente del branch remoto
>>>>>>> bef7ed8fe65805fe20396315734200105ff2bd61
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    AuthGuard,
    MatDatepickerModule,
    AuthService,
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
