import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'client/login',
    pathMatch: 'full'
  },
  {
    path: 'client/login',
    loadComponent: () =>
      import('./client/login/login').then(m => m.ClientLoginComponent)
  },
  {
    path: 'artist/login',
    loadComponent: () =>
      import('./artist/login/login').then(m => m.ArtistLoginComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/login/login').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/admindashboard/admindashboard').then(m => m.AdminDashboardComponent)
  },
];