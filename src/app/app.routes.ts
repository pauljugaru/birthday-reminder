import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent) 
  },
   { 
    path: 'dashboard', 
    canActivate: [AuthGuard], 
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent) 
  }
];