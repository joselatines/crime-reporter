import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NewsComponent } from './pages/news/news.component';
import { NotesComponent } from './pages/notes/notes.component';
import { MapComponent } from './pages/map/map.component';
import { OcrComponent } from './pages/ocr/ocr.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guard/auth.guard';
import { ConfiguracionesComponent } from './configuraciones/configuraciones.component';
import { adminAuthGuard } from './guard/admin-auth.guard';
import { PoliceReportComponent } from './pages/police-report/police-report.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { FieldInterviewComponent } from './pages/field-interview/field-interview.component';

export const routes: Routes = [
    { path: "", redirectTo: "/dashboard", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent, canActivate: [adminAuthGuard] },
    { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
    { path: "news", component: NewsComponent, canActivate: [authGuard] },
    { path: "report", component: PoliceReportComponent, canActivate: [authGuard] },
    { path: "map", component: MapComponent, canActivate: [authGuard] },
    { path: "ocr", component: OcrComponent, canActivate: [authGuard] },
    { path: "unauthorized", component: UnauthorizedComponent },
    { path: 'configuraciones', component: ConfiguracionesComponent, canActivate: [authGuard] },
    { path: 'entrevista_de_campo', component: FieldInterviewComponent, canActivate: [authGuard] },
];
