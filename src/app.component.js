import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      @if (auth.currentUser()) {
        <header class="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 z-20 shadow-lg shadow-black/20 shrink-0">
          <div class="flex items-center gap-3 cursor-pointer group" routerLink="/dashboard">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <span class="text-sm font-extrabold">LH</span>
            </div>
            <span class="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">LearnHub<span class="text-blue-500 neon-text">LMS</span></span>
          </div>
          
          <nav class="flex items-center gap-6">
            <a routerLink="/dashboard" class="text-slate-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] text-sm font-medium transition-all">Dashboard</a>
            @if(auth.currentUser()?.role === 'admin') {
              <a routerLink="/admin" class="text-slate-400 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] text-sm font-medium transition-all">Admin Panel</a>
            }
            <div class="flex items-center gap-3 pl-6 border-l border-white/10">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-200">
                {{ auth.currentUser()?.name?.charAt(0) }}
              </div>
              <button (click)="logout()" class="text-xs text-red-400 hover:text-red-300 font-medium tracking-wide">LOGOUT</button>
            </div>
          </nav>
        </header>
      }
      
      <main class="flex-1 overflow-hidden relative">
        <div class="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none"></div>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  router = inject(Router) as Router;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}