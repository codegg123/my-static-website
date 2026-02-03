import { Component, inject, signal, effect } from '@angular/core';
import { DataService, Course, Module, Lesson } from '../../services/data.service';
import { LocalContentService } from '../../services/local-content.service';
import { AuthService, User } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type AdminTab = 'courses' | 'users' | 'settings';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="h-full overflow-y-auto bg-slate-950 p-8 pb-32 custom-scrollbar">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Admin Dashboard</h1>
            <p class="text-slate-400">Manage your digital empire</p>
          </div>
          
          <!-- Tab Navigation -->
          <div class="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
             <button 
                (click)="activeTab.set('courses')"
                class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
                [class.bg-blue-600]="activeTab() === 'courses'"
                [class.text-white]="activeTab() === 'courses'"
                [class.text-slate-400]="activeTab() !== 'courses'"
                [class.shadow-lg]="activeTab() === 'courses'"
                [class.hover:text-white]="activeTab() !== 'courses'"
             >Courses</button>
             <button 
                (click)="activeTab.set('users')"
                class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
                [class.bg-blue-600]="activeTab() === 'users'"
                [class.text-white]="activeTab() === 'users'"
                [class.text-slate-400]="activeTab() !== 'users'"
                [class.shadow-lg]="activeTab() === 'users'"
                [class.hover:text-white]="activeTab() !== 'users'"
             >Users</button>
             <button 
                (click)="activeTab.set('settings')"
                class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
                [class.bg-blue-600]="activeTab() === 'settings'"
                [class.text-white]="activeTab() === 'settings'"
                [class.text-slate-400]="activeTab() !== 'settings'"
                [class.shadow-lg]="activeTab() === 'settings'"
                [class.hover:text-white]="activeTab() !== 'settings'"
             >Settings</button>
          </div>
        </div>

        <!-- TAB: COURSES -->
        @if (activeTab() === 'courses') {
            <div class="mb-6 flex justify-end animate-fade-in">
                 <button (click)="createNewCourse()" class="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 hover:scale-105">
                    <span class="text-xl">+</span> New Course
                 </button>
            </div>

            <div class="grid gap-6 animate-fade-in">
            @for (course of data.courses(); track course.id) {
                <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 relative group hover:border-cyan-500/30 transition-all backdrop-blur-sm">
                <div class="flex justify-between items-start">
                    <div class="flex gap-6">
                    <div class="w-24 h-24 bg-slate-800 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/5">
                        <img [src]="course.thumbnailUrl" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-white mb-2">{{ course.title }}</h3>
                        <p class="text-sm text-slate-500 mb-2">{{ course.batch }} • {{ course.modules.length }} Modules</p>
                        <p class="text-sm text-slate-600 line-clamp-1 max-w-lg">{{ course.description }}</p>
                    </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                    <button (click)="editCourse(course)" class="px-5 py-2 bg-slate-800 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">Edit Details</button>
                    <button (click)="deleteCourse(course.id, $event)" class="px-5 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 border border-red-500/50 rounded-lg text-sm font-bold transition-all z-10 cursor-pointer">Delete</button>
                    </div>
                </div>

                <!-- Inline Editor (If selected) -->
                @if (editingCourseId() === course.id) {
                    <div class="mt-8 pt-8 border-t border-white/5 animate-fade-in">
                    
                    <!-- Metadata Section -->
                    <div class="mb-10">
                        <h4 class="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm shadow-lg shadow-blue-500/30">1</span>
                        Course Metadata
                        </h4>
                        <div class="grid grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Title</label>
                            <input [(ngModel)]="course.title" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors">
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Batch</label>
                            <input [(ngModel)]="course.batch" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors">
                        </div>
                        <div class="space-y-1 col-span-2">
                            <label class="text-xs font-bold text-slate-500 uppercase">Thumbnail URL</label>
                            <input [(ngModel)]="course.thumbnailUrl" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors">
                        </div>
                        </div>
                    </div>

                    <!-- Content Section -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                        <h4 class="text-lg font-bold text-white flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm shadow-lg shadow-purple-500/30">2</span>
                            Modules & Content
                        </h4>
                        <div class="flex gap-2">
                            <!-- Static Import Button -->
                            <div class="relative overflow-hidden inline-block">
                                <button class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    Import Folder Structure (Static)
                                </button>
                                <input type="file" webkitdirectory directory multiple (change)="onFolderSelected($event, course)" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer">
                            </div>

                            <button (click)="addModule(course)" class="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border border-blue-500/20">
                                + Add Module
                            </button>
                        </div>
                        </div>

                        <div class="space-y-6">
                        @for (module of course.modules; track module.id; let i = $index) {
                            <div class="bg-slate-950/30 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                              <div class="flex items-center gap-3 mb-4">
                                  <div class="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-400">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                  </div>
                                  
                                  <!-- Module Title & Settings -->
                                  <div class="flex-1 flex flex-col md:flex-row gap-4">
                                    <input [(ngModel)]="module.title" class="bg-transparent text-white font-bold border-none focus:ring-0 p-0 flex-1 text-lg placeholder-slate-600" placeholder="Module Title">
                                    <div class="flex items-center gap-2">
                                      <label class="text-[10px] uppercase font-bold text-slate-500">Default:</label>
                                      <select [(ngModel)]="module.defaultLessonType" class="bg-slate-900 border border-white/10 text-xs rounded px-2 py-1 text-slate-300">
                                        <option value="dynamic">Dynamic (Links)</option>
                                        <option value="static">Static (Local Files)</option>
                                      </select>
                                    </div>
                                  </div>

                                  <!-- Reordering -->
                                  <div class="flex items-center gap-1 bg-slate-900 rounded p-1">
                                    <button (click)="moveModule(course, i, -1)" [disabled]="i === 0" class="p-1 hover:bg-white/10 rounded disabled:opacity-20 text-slate-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
                                    <button (click)="moveModule(course, i, 1)" [disabled]="i === course.modules.length - 1" class="p-1 hover:bg-white/10 rounded disabled:opacity-20 text-slate-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></button>
                                  </div>

                                  <button (click)="deleteModule(course, module.id)" class="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors p-2 rounded">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                              </div>
                            
                              <!-- Lessons -->
                              <div class="space-y-2 pl-4 border-l-2 border-slate-800">
                                  @for (lesson of module.lessons; track lesson.id; let j = $index) {
                                  <div class="flex flex-col md:flex-row md:items-center gap-3 group/lesson bg-slate-900/50 p-3 rounded hover:bg-slate-800/50 transition-colors border border-transparent hover:border-white/5">
                                      <div class="flex gap-2">
                                        <select [(ngModel)]="lesson.type" class="bg-slate-950 text-xs text-cyan-400 font-bold uppercase tracking-wider border border-white/10 rounded px-2 py-1 outline-none">
                                          <option value="video">Video</option>
                                          <option value="pdf">PDF</option>
                                        </select>
                                        
                                        <!-- Source Toggle -->
                                        <select [(ngModel)]="lesson.isLocal" [ngModelOptions]="{standalone: true}" class="bg-slate-950 text-xs text-blue-400 font-bold uppercase tracking-wider border border-white/10 rounded px-2 py-1 outline-none w-24">
                                          <option [ngValue]="false">Dynamic</option>
                                          <option [ngValue]="true">Static</option>
                                        </select>
                                      </div>
                                      
                                      <input [(ngModel)]="lesson.title" class="bg-transparent text-slate-200 text-sm border-none focus:ring-0 p-0 flex-1 placeholder-slate-600 font-medium" placeholder="Lesson Title">
                                      
                                      <!-- Dynamic URL Input -->
                                      @if (!lesson.isLocal) {
                                        <input [(ngModel)]="lesson.url" class="bg-slate-950 text-slate-400 text-xs border border-white/5 rounded px-2 py-1.5 w-full md:w-1/3 truncate focus:w-1/2 transition-all placeholder-slate-700" placeholder="https://example.com/video.mp4">
                                      } 
                                      <!-- Static File Status & Upload -->
                                      @else {
                                        <div class="flex items-center gap-2 text-xs text-slate-500 w-full md:w-1/3 border border-white/5 rounded px-2 py-1.5 bg-slate-950/50 relative overflow-hidden group/upload">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                          <span class="truncate">{{ lesson.url ? 'File Linked' : 'Click to Upload' }}</span>
                                          @if (!lesson.url) {
                                             <span class="text-red-500 text-[10px] ml-auto">Empty</span>
                                          }
                                          <!-- File Input Overlay -->
                                          <input type="file" (change)="onFileSelected($event, course, lesson)" class="absolute inset-0 opacity-0 cursor-pointer" title="Upload File">
                                        </div>
                                      }
                                      
                                      <div class="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
                                        <!-- Reordering Lessons -->
                                        <div class="flex items-center bg-slate-950 rounded border border-white/5">
                                            <button (click)="moveLesson(course, module, j, -1)" [disabled]="j === 0" class="p-1 hover:bg-white/10 disabled:opacity-20 text-slate-500 hover:text-white"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
                                            <div class="w-px h-3 bg-white/10"></div>
                                            <button (click)="moveLesson(course, module, j, 1)" [disabled]="j === module.lessons.length - 1" class="p-1 hover:bg-white/10 disabled:opacity-20 text-slate-500 hover:text-white"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></button>
                                        </div>

                                        <button 
                                        (click)="lesson.isLocked = !lesson.isLocked" 
                                        class="p-1.5 rounded transition-colors"
                                        [class.text-red-500]="lesson.isLocked"
                                        [class.bg-red-500/10]="lesson.isLocked"
                                        [class.text-slate-600]="!lesson.isLocked"
                                        [class.hover:text-slate-400]="!lesson.isLocked"
                                        title="Toggle Lock"
                                        >
                                          @if(lesson.isLocked) {
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                          } @else {
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                          }
                                        </button>
                                        
                                        <button (click)="deleteLesson(course, module, lesson.id)" class="text-slate-500 hover:text-white bg-slate-800 hover:bg-red-600 transition-all p-1.5 rounded">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                      </div>
                                  </div>
                                  }
                                  <div class="pt-3">
                                  <button (click)="addLesson(module)" class="text-xs text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                                      + Add Lesson
                                  </button>
                                  </div>
                              </div>
                            </div>
                        }
                        </div>
                    </div>

                    <div class="mt-8 flex justify-end gap-3 sticky bottom-0 bg-slate-950/80 backdrop-blur-xl p-4 border-t border-white/10 -mx-6 -mb-6 rounded-b-xl z-20">
                        <button (click)="saveChanges(course)" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg shadow-green-600/20 hover:scale-105">Save Changes</button>
                    </div>
                    </div>
                }
                </div>
            }
            </div>
        } 
        
        <!-- TAB: USERS -->
        @else if (activeTab() === 'users') {
             <div class="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- User List -->
                <div class="lg:col-span-2 space-y-4">
                    <h3 class="text-xl font-bold text-white mb-4">Registered Users</h3>
                    
                    @for (user of auth.users(); track user.id) {
                        <div class="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-lg"
                                     [class.from-blue-600]="user.role === 'admin'"
                                     [class.to-purple-600]="user.role === 'admin'"
                                     [class.from-slate-700]="user.role !== 'admin'"
                                     [class.to-slate-600]="user.role !== 'admin'"
                                >
                                    {{ user.name.charAt(0) }}
                                </div>
                                <div>
                                    <div class="font-bold text-white text-sm">{{ user.name }}</div>
                                    <div class="text-xs text-slate-500">{{ user.email }}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider"
                                    [class.bg-blue-500/20]="user.role === 'admin'"
                                    [class.text-blue-400]="user.role === 'admin'"
                                    [class.bg-slate-700/50]="user.role === 'user'"
                                    [class.text-slate-400]="user.role === 'user'"
                                >
                                    {{ user.role }}
                                </span>
                                @if (user.id !== auth.currentUser()?.id) {
                                    <button (click)="deleteUser(user.id)" class="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded p-1.5 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                }
                            </div>
                        </div>
                    }
                </div>

                <!-- Add User Form -->
                <div class="bg-slate-900/60 border border-white/5 rounded-2xl p-6 h-fit sticky top-6">
                    <h3 class="text-lg font-bold text-white mb-6">Add New User</h3>
                    
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input [(ngModel)]="newUser.name" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors" placeholder="John Doe">
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input [(ngModel)]="newUser.email" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors" placeholder="john@example.com">
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Password</label>
                            <input [(ngModel)]="newUser.password" type="text" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors" placeholder="Secret123">
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Role</label>
                            <select [(ngModel)]="newUser.role" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors outline-none">
                                <option value="user">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button (click)="addUser()" class="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-600/20">
                            Create User
                        </button>
                    </div>
                </div>
             </div>
        }

        <!-- TAB: SETTINGS -->
        @else {
             <div class="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <!-- Import / Export Section -->
                <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm h-fit col-span-1 md:col-span-2">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg class="text-green-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Data Backup & Restoration
                    </h3>
                    <p class="text-slate-400 text-sm mb-6">Backup your entire LMS configuration including users, passwords, course structures, and progress.</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <button (click)="exportData()" class="flex flex-col items-center justify-center p-6 bg-slate-950 border border-white/10 rounded-xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all group">
                             <svg class="text-cyan-500 mb-3 group-hover:scale-110 transition-transform" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                             <span class="font-bold text-white">Export Data (JSON)</span>
                             <span class="text-xs text-slate-500 mt-1">Downloads users & courses</span>
                        </button>
                        
                        <div class="relative">
                            <button class="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 border border-white/10 rounded-xl hover:bg-slate-800 hover:border-green-500/50 transition-all group">
                                <svg class="text-green-500 mb-3 group-hover:scale-110 transition-transform" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <span class="font-bold text-white">Import Data (JSON)</span>
                                <span class="text-xs text-slate-500 mt-1">Restores backup file</span>
                            </button>
                            <input type="file" accept=".json" (change)="importData($event)" class="absolute inset-0 opacity-0 cursor-pointer">
                        </div>
                    </div>
                </div>

                <!-- Password Settings -->
                <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm h-fit">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg class="text-cyan-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Admin Security
                    </h3>
                    
                    <p class="text-slate-400 text-sm mb-6">Change your administrator password here. This will update the password for your current account.</p>

                    <div class="space-y-4">
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">New Password</label>
                            <input [(ngModel)]="newAdminPassword" type="password" class="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors">
                        </div>
                        
                        <div class="flex justify-end pt-4">
                            <button (click)="updateAdminPassword()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                                Update Password
                            </button>
                        </div>
                        
                        @if (passwordMessage()) {
                            <div class="text-center text-sm font-bold animate-pulse text-green-400 mt-4">
                                {{ passwordMessage() }}
                            </div>
                        }
                    </div>
                </div>

                <!-- Storage Stats -->
                <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-sm h-fit">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg class="text-amber-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Storage Management
                    </h3>
                    
                    <p class="text-slate-400 text-sm mb-6">Manage local data (cookies, local storage, and static content files stored in the browser).</p>
                    
                    <div class="space-y-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <div class="text-2xl font-bold text-white">{{ localStorageUsage() }}</div>
                                <div class="text-[10px] uppercase font-bold text-slate-500">Local Storage Items</div>
                            </div>
                            <div class="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <div class="text-2xl font-bold text-white">{{ indexedDbFileCount() }}</div>
                                <div class="text-[10px] uppercase font-bold text-slate-500">Static Files (DB)</div>
                            </div>
                        </div>

                        <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <h4 class="text-red-400 font-bold text-sm mb-2">Danger Zone</h4>
                            <p class="text-slate-400 text-xs mb-4">Clearing storage will remove all static course videos, user progress, and user accounts from this browser.</p>
                            <button (click)="clearAllStorage()" class="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg shadow-red-600/20">
                                Clear All Data
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        }
      </div>
      
      <!-- Future Sync Footer -->
      <footer class="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/5 p-4 z-50">
         <div class="max-w-6xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div class="text-xs text-slate-400 font-medium">Admin Mode Active</div>
            </div>
            <button class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:border-cyan-500/50 hover:text-cyan-400 group">
               <svg class="text-slate-500 group-hover:text-cyan-400 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
               Sync to GitHub (Future)
            </button>
         </div>
      </footer>
    </div>
  `
})
export class AdminDashboardComponent {
  data = inject(DataService);
  localContent = inject(LocalContentService);
  auth = inject(AuthService);
  
  editingCourseId = signal<string | null>(null);
  activeTab = signal<AdminTab>('courses');
  
  // User Management
  newUser: Partial<User> = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  };

  // Settings
  newAdminPassword = '';
  passwordMessage = signal('');
  
  // Storage Stats
  indexedDbFileCount = signal(0);
  localStorageUsage = signal(0);

  constructor() {
    effect(() => {
        if (this.activeTab() === 'settings') {
            this.updateStorageStats();
        }
    });
  }

  createNewCourse() {
    const newCourse: Course = {
      id: 'c' + Date.now(),
      title: 'New Course',
      batch: 'Batch ' + new Date().getFullYear(),
      description: 'Description here...',
      thumbnailUrl: 'https://picsum.photos/400/225',
      modules: []
    };
    this.data.addCourse(newCourse);
    this.editingCourseId.set(newCourse.id);
  }

  deleteCourse(id: string, event?: Event) {
    if (event) {
        event.stopPropagation();
    }
    if(confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.data.deleteCourse(id);
      if (this.editingCourseId() === id) {
        this.editingCourseId.set(null);
      }
    }
  }

  editCourse(course: Course) {
    if (this.editingCourseId() === course.id) {
      this.editingCourseId.set(null);
    } else {
      this.editingCourseId.set(course.id);
    }
  }

  addModule(course: Course) {
    course.modules.push({
      id: 'm' + Date.now(),
      title: 'New Module',
      lessons: [],
      isOpen: true,
      defaultLessonType: 'dynamic' // Default to dynamic URL
    });
  }

  deleteModule(course: Course, moduleId: string) {
    if (confirm('Delete this module? All lessons inside will be removed.')) {
        // Use DataService to handle logic + cleanup
        this.data.deleteModule(course.id, moduleId);
    }
  }

  moveModule(course: Course, index: number, direction: number) {
      const newIndex = index + direction;
      this.data.reorderModules(course.id, index, newIndex);
  }

  addLesson(module: Module) {
    module.lessons.push({
      id: 'l' + Date.now(),
      title: 'New Lesson',
      type: 'video',
      url: '',
      isLocal: module.defaultLessonType === 'static' // Use module preference
    });
  }

  deleteLesson(course: Course, module: Module, lessonId: string) {
    if (confirm('Delete this lesson permanently?')) {
        // Use DataService to handle logic + cleanup
        this.data.deleteLesson(course.id, module.id, lessonId);
    }
  }

  moveLesson(course: Course, module: Module, index: number, direction: number) {
      const newIndex = index + direction;
      this.data.reorderLessons(course.id, module.id, index, newIndex);
  }

  async onFolderSelected(event: Event, course: Course) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const structure: Record<string, any[]> = {};

    for (const file of files) {
      const pathParts = file.webkitRelativePath.split('/');
      if (pathParts.length < 3) continue;

      const moduleName = pathParts[1];
      const fileName = pathParts[pathParts.length - 1];
      const lowerName = fileName.toLowerCase();
      
      let type: 'video' | 'pdf' | null = null;
      if (lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') || lowerName.endsWith('.mov')) {
        type = 'video';
      } else if (lowerName.endsWith('.pdf')) {
        type = 'pdf';
      }
      
      if (type) {
          if (!structure[moduleName]) structure[moduleName] = [];
          
          const cleanName = fileName.replace(/^\d+[\.\s-]+/, '').split('.')[0];
          const orderMatch = fileName.match(/^\d+/);
          const order = orderMatch ? parseInt(orderMatch[0]) : 999;
          
          const id = 'l_' + Math.random().toString(36).substr(2, 9);

          try {
            await this.localContent.saveFile(id, file);
          } catch(e) {
            console.error("Failed to save local file", e);
          }

          const blobUrl = URL.createObjectURL(file);

          structure[moduleName].push({
              id: id,
              title: cleanName,
              type: type,
              url: blobUrl,
              isLocked: false,
              isLocal: true,
              order: order
          });
      }
    }

    Object.keys(structure).sort().forEach(modTitle => {
        const lessons = structure[modTitle].sort((a, b) => a.order - b.order);
        
        const finalLessons: Lesson[] = lessons.map(l => ({
          id: l.id,
          title: l.title,
          type: l.type,
          url: l.url,
          isLocked: l.isLocked,
          isLocal: l.isLocal
        }));

        const newModule: Module = {
            id: 'm_' + Math.random().toString(36).substr(2, 9),
            title: modTitle,
            lessons: finalLessons,
            isOpen: false,
            defaultLessonType: 'static' // Auto-imported content is static
        };
        course.modules.push(newModule);
    });
    
    this.saveChanges(course);
    input.value = '';
    alert('Folder imported and content saved locally! You can reload the page and videos will still work.');
  }

  // Handle single file selection for a lesson
  async onFileSelected(event: Event, course: Course, lesson: Lesson) {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;
      const file = input.files[0];

      try {
        await this.localContent.saveFile(lesson.id, file);
        
        // Revoke old object URL to avoid leaks
        if (lesson.url && lesson.url.startsWith('blob:')) {
            URL.revokeObjectURL(lesson.url);
        }
        
        lesson.url = URL.createObjectURL(file);
        this.saveChanges(course);
      } catch (err) {
        console.error('Failed to save file', err);
        alert('Failed to save file locally. Storage might be full.');
      }
      input.value = '';
  }

  saveChanges(course: Course) {
    this.data.updateCourse(course);
  }

  // --- User Management ---
  addUser() {
    if (this.newUser.name && this.newUser.email && this.newUser.password) {
      this.auth.createUser({
        id: 'u_' + Date.now(),
        name: this.newUser.name,
        email: this.newUser.email,
        password: this.newUser.password,
        role: this.newUser.role || 'user'
      } as User);
      
      this.newUser = { name: '', email: '', password: '', role: 'user' };
    }
  }

  deleteUser(id: string) {
    if (confirm('Delete this user?')) {
      this.auth.deleteUser(id);
    }
  }

  // --- Admin Settings ---
  updateAdminPassword() {
    if (!this.newAdminPassword) return;
    const admin = this.auth.currentUser();
    if (admin && admin.role === 'admin') {
      const updatedUser = { ...admin, password: this.newAdminPassword };
      this.auth.updateUser(updatedUser);
      this.passwordMessage.set('Password updated successfully!');
      this.newAdminPassword = '';
      setTimeout(() => this.passwordMessage.set(''), 3000);
    }
  }

  updateStorageStats() {
      // IndexedDB Count
      this.localContent.getStorageStats().then(stats => {
          this.indexedDbFileCount.set(stats.count);
      }).catch(err => console.error(err));

      // LocalStorage Count
      this.localStorageUsage.set(localStorage.length);
  }

  clearAllStorage() {
      if (confirm('DANGER: This will delete ALL users, progress, and downloaded course content. Continue?')) {
          localStorage.clear();
          this.localContent.clearAll().then(() => {
              window.location.reload();
          });
      }
  }

  // --- Import / Export ---
  exportData() {
      const backup = {
          courses: localStorage.getItem('learnhub_courses'),
          users: localStorage.getItem('learnhub_users'),
          progress: localStorage.getItem('learnhub_progress'),
          timestamp: new Date().toISOString(),
          version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnhub_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }

  importData(event: Event) {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;
      
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const backup = JSON.parse(content);
              
              if (backup.courses) localStorage.setItem('learnhub_courses', backup.courses);
              if (backup.users) localStorage.setItem('learnhub_users', backup.users);
              if (backup.progress) localStorage.setItem('learnhub_progress', backup.progress);
              
              alert('Data restored successfully! The page will now reload.');
              window.location.reload();
          } catch (err) {
              console.error(err);
              alert('Failed to import data. Invalid JSON file.');
          }
      };
      
      reader.readAsText(file);
      input.value = '';
  }
}