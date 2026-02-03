import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <!-- Background Effect -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse delay-700"></div>
      </div>

      <div class="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl z-10 relative overflow-hidden group">
        <!-- Glow border effect -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        
        <div class="text-center mb-10">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-6 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
              LH
            </div>
            <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">LearnHub LMS</h1>
            <p class="text-slate-400 text-sm">By Code with vrush a.k.a vruhsang Patel</p>
        </div>

        <form (submit)="handleLogin($event)" class="space-y-5">
          <div class="group/input">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within/input:text-cyan-400 transition-colors">Email Address</label>
            <input 
              type="email" 
              name="email"
              [(ngModel)]="email" 
              class="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              placeholder="user@learnhub.com"
              required
            >
          </div>

          <div class="group/input">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within/input:text-cyan-400 transition-colors">Password</label>
            <input 
              type="password" 
              name="password"
              [(ngModel)]="password" 
              class="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              placeholder="••••••••"
              required
            >
          </div>
          
          @if (error()) {
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium animate-pulse">
              {{ error() }}
            </div>
          }
          
          <button 
            type="submit"
            class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-white/5 text-center">
            <p class="text-xs text-slate-500 mb-2">Default Credentials:</p>
            <div class="inline-flex gap-4 text-[10px] text-slate-400 bg-slate-900/50 px-4 py-2 rounded-lg">
                <div class="text-left">
                    <span class="block text-cyan-400 font-bold">Admin</span>
                    admin@learnhub.com <br> pass: admin
                </div>
                <div class="w-px bg-white/10"></div>
                <div class="text-left">
                    <span class="block text-blue-400 font-bold">Student</span>
                    student@learnhub.com <br> pass: user
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  
  auth = inject(AuthService);
  router = inject(Router) as Router;

  handleLogin(event: Event) {
    event.preventDefault();
    this.error.set('');
    
    if (this.auth.login(this.email, this.password)) {
      const role = this.auth.currentUser()?.role;
      this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
    } else {
      this.error.set('Invalid credentials. Please try again.');
    }
  }
}