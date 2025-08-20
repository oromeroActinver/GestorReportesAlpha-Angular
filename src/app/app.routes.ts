import { Routes } from '@angular/router';
import { LabsComponent } from './pages/labs/labs.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ReporUploadComponent } from './repor-upload/repor-upload.component';
import { AuthGuard } from './auth.guard';
import { RendimientosComponent } from './pages/rendimientos/rendimientos.component';
import { MenuHomeComponent } from './pages/menu-home/menu-home.component';
import { DispercionAlphaComponent } from './pages/dispercion-alpha/dispercion-alpha.component';
import { CalculaRendimientosComponent } from './pages/calcula-rendimientos/calcula-rendimientos.component';
import { ReportesAlphaComponent } from './pages/reportes-alpha/reportes-alpha.component';
import { ContratosAlphaComponent } from './pages/contratos-alpha/contratos-alpha.component';
import { BenchmarkComponent } from './pages/benchmark/benchmark.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reporUpload',
    component: ReporUploadComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rendimientos',
    component: RendimientosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'newHome',
    component: MenuHomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'DispercionAlpha',
    component: DispercionAlphaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'CalculaRend',
    component: CalculaRendimientosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ReporteAlpha',
    component: ReportesAlphaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ContracAlpha',
    component: ContratosAlphaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'BenchAlpha',
    component: BenchmarkComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'labs',
    component: LabsComponent,
    canActivate: [AuthGuard]
  }
  //CalculaRendimientosComponent
  
];
