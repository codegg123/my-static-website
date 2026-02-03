import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CoursePlayerComponent } from './components/player/course-player.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { LoginComponent } from './components/auth/login.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router) as Router;
  if (auth.currentUser()) return true;
  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'course/:courseId', component: CoursePlayerComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] }, // Simplified guard for demo
  { path: '**', redirectTo: 'dashboard' }
];