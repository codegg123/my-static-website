import { Component, inject, computed } from '@angular/core';
import { DataService, Course } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, DatePipe } from '@angular/common';
import { ActivityChartComponent } from './activity-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, ActivityChartComponent, DatePipe],
  template: `
    <div class="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-24 relative z-10 custom-scrollbar">
      
      <!-- Hero Section with Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <!-- Welcome Card -->
        <div class="lg:col-span-2 bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700"></div>
            
            <div class="relative z-10">
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                    Welcome back, <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{{ auth.currentUser()?.name?.split(' ')?.[0] }}</span>
                </h1>
                <p class="text-slate-400 text-lg mb-8 max-w-md">You're on a {{ streak() }} day streak! Keep pushing your limits.</p>
                
                <div class="flex flex-wrap gap-4">
                     <div class="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/5">
                        <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div>
                             <div class="text-2xl font-bold text-white leading-none">{{ data.getTotalHoursLearned() }}h</div>
                             <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hours Learned</div>
                        </div>
                     </div>

                     <div class="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/5">
                        <div class="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div>
                             <div class="text-2xl font-bold text-white leading-none">{{ data.getCompletedLessonsCount() }}</div>
                             <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lessons Done</div>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        <!-- Activity Chart Card -->
        <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-white text-sm uppercase tracking-wide">Weekly Activity</h3>
                <span class="text-xs text-cyan-400 font-mono">{{ today | date:'MMM d' }}</span>
            </div>
            <div class="flex-1 w-full min-h-[150px]">
                <app-activity-chart [data]="activityData()" />
            </div>
        </div>
      </div>

      <!-- Course Grid -->
      <div class="mb-6 flex items-center justify-between">
         <h2 class="text-2xl font-bold text-white">Continue Learning</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (course of data.courses(); track course.id; let i = $index) {
          <div class="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group flex flex-col hover:-translate-y-1">
            <!-- Course Thumbnail -->
            <div class="relative aspect-video bg-slate-800 overflow-hidden">
              <img [ngSrc]="course.thumbnailUrl" [priority]="i < 6" width="400" height="225" class="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt="{{course.title}}">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              
              <!-- Batch Badge -->
              <div class="absolute top-4 right-4">
                 <span class="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400 text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                  {{ course.batch }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 flex-1 flex flex-col relative">
              <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <h3 class="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors">{{ course.title }}</h3>
              <p class="text-sm text-slate-400 mb-8 line-clamp-2 flex-1">{{ course.description }}</p>

              <!-- Progress -->
              <div class="mb-6 relative">
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span class="text-slate-500">Completion</span>
                  <span class="text-cyan-400">{{ getProgress(course.id) }}%</span>
                </div>
                <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    class="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    [style.width.%]="getProgress(course.id)"
                  ></div>
                </div>
              </div>

              <a [routerLink]="['/course', course.id]" class="w-full block text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:border-transparent group-hover:shadow-lg">
                {{ getProgress(course.id) > 0 ? 'Resume Course' : 'Start Learning' }}
              </a>
            </div>
          </div>
        }
      </div>
      
      @if (data.courses().length === 0) {
        <div class="text-center py-24 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed backdrop-blur-sm">
          <p class="text-slate-500 text-lg">No courses available yet.</p>
          <p class="text-slate-600 text-sm mt-2">Check back later or contact admin.</p>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  data = inject(DataService);
  auth = inject(AuthService);
  
  today = new Date();
  
  // Computed stats
  activityData = computed(() => this.data.getDailyActivity());
  
  // Mock streak calculation based on activity > 0
  streak = computed(() => {
     const activity = this.activityData();
     let streak = 0;
     for (let i = activity.length - 1; i >= 0; i--) {
         if (activity[i].value > 0) streak++;
         else break;
     }
     return streak > 0 ? streak : 1; // Start with 1 for motivation
  });

  getProgress(courseId: string) {
    return this.data.getCourseProgress(courseId);
  }
}