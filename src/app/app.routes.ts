import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NewsComponent } from './pages/news/news.component';
import { NotesComponent } from './pages/notes/notes.component';
import { MapComponent } from './pages/map/map.component';

export const routes: Routes = [
    { path: "login", component: LoginComponent },
    { path: "dashboard", component: DashboardComponent },
    { path: "news", component: NewsComponent },
    { path: "notes", component: NotesComponent },
    { path: "map", component: MapComponent },
];
