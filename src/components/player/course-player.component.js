import { Component, ElementRef, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService, Course, Module, Lesson } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex h-full bg-black overflow-hidden relative">
      
      <!-- Floating Sidebar Toggle (Visible when sidebar is closed) -->
      @if (!isSidebarOpen()) {
        <button 
          (click)="toggleSidebar()" 
          class="absolute top-6 left-6 z-50 w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
          title="Open Sidebar"
        >
          <svg class="group-hover:rotate-180 transition-transform duration-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      }

      <!-- Left Sidebar (Collapsible) -->
      <aside 
        class="bg-slate-950 border-r border-white/5 flex flex-col transition-[width,opacity] duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shrink-0 h-full overflow-hidden relative z-40"
        [class.w-80]="isSidebarOpen()"
        [class.w-0]="!isSidebarOpen()"
        [class.border-r-0]="!isSidebarOpen()"
        [class.opacity-100]="isSidebarOpen()"
        [class.opacity-0]="!isSidebarOpen()"
      >
        <!-- Inner Wrapper to maintain width during collapse -->
        <div class="w-80 h-full flex flex-col">
          <!-- Header -->
          <div class="h-16 flex flex-col justify-center px-4 border-b border-white/5 shrink-0 bg-slate-900/50 backdrop-blur-md relative">
            <div class="flex items-center gap-3 overflow-hidden w-full relative z-10">
              <button (click)="toggleSidebar()" class="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg shrink-0">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
              <div class="flex-1 min-w-0">
                <h2 class="font-bold text-slate-100 truncate tracking-tight text-sm leading-tight">{{ course()?.title }}</h2>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                   <div class="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-cyan-500 transition-all duration-500" [style.width.%]="courseProgress()"></div>
                   </div>
                   <span class="text-cyan-400 font-bold shrink-0">{{ courseProgress() }}%</span>
                </div>
              </div>
            </div>
            <!-- Bottom border highlight -->
            <div class="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full opacity-50"></div>
          </div>

          <!-- Course Tree -->
          <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-slate-950/50">
            
            <!-- Root Label -->
            <div class="px-3 py-3 flex items-center justify-between text-cyan-400 font-bold text-[10px] uppercase tracking-widest mb-2 mt-2 select-none">
              <div class="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span>Modules</span>
              </div>
              <span class="bg-cyan-500/10 text-cyan-500 px-1.5 py-0.5 rounded">{{ course()?.modules?.length || 0 }}</span>
            </div>

            @for (module of course()?.modules; track module.id) {
              <div class="mb-1 rounded-xl overflow-hidden border border-transparent hover:border-white/5 transition-all">
                <!-- Module Header -->
                <button 
                  (click)="toggleModule(module)"
                  class="w-full flex items-center justify-between px-3 py-3 bg-slate-900/40 hover:bg-slate-900 transition-colors text-left group"
                >
                  <div class="flex items-center gap-3 overflow-hidden">
                     <div class="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors shrink-0">
                       <svg 
                        class="transition-transform duration-200"
                        [class.rotate-90]="module.isOpen"
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                     </div>
                     <span class="text-slate-300 font-medium text-xs truncate group-hover:text-white leading-relaxed">{{ module.title }}</span>
                  </div>
                  <span class="text-[10px] text-slate-600 font-mono shrink-0">{{ getModuleProgress(module) }}</span>
                </button>

                <!-- Lessons List -->
                @if (module.isOpen) {
                  <div class="bg-black/20 pb-2 pt-1">
                    @for (lesson of module.lessons; track lesson.id) {
                      <button 
                        (click)="selectLesson(lesson)"
                        [disabled]="isLessonLocked(lesson)"
                        class="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left relative group disabled:opacity-50 disabled:cursor-not-allowed border-l-2"
                        [class.bg-gradient-to-r]="currentLesson()?.id === lesson.id"
                        [class.from-blue-600/10]="currentLesson()?.id === lesson.id"
                        [class.to-transparent]="currentLesson()?.id === lesson.id"
                        [class.border-cyan-400]="currentLesson()?.id === lesson.id"
                        [class.border-transparent]="currentLesson()?.id !== lesson.id"
                        [class.hover:bg-white/5]="currentLesson()?.id !== lesson.id && !isLessonLocked(lesson)"
                      >
                         <!-- Status Icon -->
                         <div class="shrink-0">
                           @if (isLessonLocked(lesson)) {
                              <svg class="text-slate-700" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                           } @else if (getLessonStatus(lesson.id) === 'completed') {
                              <svg class="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                           } @else if (getLessonStatus(lesson.id) === 'started') {
                              <div class="w-3.5 h-3.5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                              </div>
                           } @else {
                              <div class="w-3.5 h-3.5 rounded-full border border-slate-700"></div>
                           }
                         </div>

                         <!-- Title & Type -->
                         <div class="flex-1 min-w-0">
                           <div 
                              class="text-[13px] font-medium leading-tight mb-0.5 truncate transition-colors"
                              [class.text-cyan-400]="currentLesson()?.id === lesson.id"
                              [class.text-slate-400]="currentLesson()?.id !== lesson.id"
                              [class.group-hover:text-slate-200]="currentLesson()?.id !== lesson.id && !isLessonLocked(lesson)"
                           >
                              {{ lesson.title }}
                           </div>
                           <div class="text-[10px] text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                              @if(lesson.type === 'video') {
                                <span class="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> {{ formatTime(lesson.duration || 0) }}</span>
                              } @else {
                                <span class="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> PDF</span>
                              }
                           </div>
                         </div>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col relative min-w-0 bg-slate-950 transition-all duration-500">
        
        <!-- Top Navigation Bar -->
        <header class="h-16 flex items-center justify-between px-4 bg-slate-900 border-b border-white/5 z-20 shadow-lg shadow-black/20">
            <!-- Left: Sidebar Toggle & Prev -->
            <div class="flex items-center gap-3">
                <!-- Toggle only visible here if sidebar is open, otherwise handled by floating button -->
                @if (isSidebarOpen()) {
                  <button (click)="toggleSidebar()" class="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                } @else {
                  <!-- Spacer if button is hidden to keep layout -->
                  <div class="w-9"></div> 
                }
                
                <button 
                  [disabled]="!prevLesson()" 
                  (click)="goToLesson(prevLesson())"
                  class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold text-slate-300 uppercase tracking-wide group"
                >
                  <svg class="group-hover:-translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  Prev
                </button>
            </div>

            <!-- Center: Lesson Title -->
            <div class="flex-1 px-4 text-center">
                <div class="text-[10px] text-cyan-500 uppercase font-bold tracking-[0.2em] mb-0.5">Now Playing</div>
                <div class="text-sm text-white font-bold truncate">{{ currentLesson()?.title || 'Select a Lesson' }}</div>
            </div>

            <!-- Right: Next Button -->
            <div class="flex items-center gap-3">
                <button 
                  [disabled]="!nextLesson()"
                  (click)="goToLesson(nextLesson())"
                  class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:bg-slate-800 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-600/20 group"
                >
                  Next
                  <svg class="group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
           <!-- Mobile Nav Overlay Buttons -->
           <div class="sm:hidden absolute top-4 left-4 z-20">
               <button [disabled]="!prevLesson()" (click)="goToLesson(prevLesson())" class="p-2 bg-black/50 backdrop-blur rounded-full text-white disabled:opacity-30"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
           </div>
           <div class="sm:hidden absolute top-4 right-4 z-20">
               <button [disabled]="!nextLesson()" (click)="goToLesson(nextLesson())" class="p-2 bg-black/50 backdrop-blur rounded-full text-white disabled:opacity-30"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
           </div>

           @if (currentLesson()) {
             @if (isLessonLocked(currentLesson()!) && !isAdmin()) {
               <!-- Locked Screen -->
                <div class="text-center p-8">
                  <div class="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_20px_rgba(255,0,0,0.1)]">
                    <svg class="text-red-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <h3 class="text-2xl font-bold text-white mb-2">Lesson Locked</h3>
                  <p class="text-slate-500">Complete previous lessons to unlock this content.</p>
                </div>
             } @else if (currentLesson()!.type === 'video') {
               <div class="w-full h-full relative group bg-black" #videoContainer>
                  <video 
                    #videoPlayer
                    [src]="currentLesson()!.url"
                    class="w-full h-full object-contain"
                    (timeupdate)="onTimeUpdate()"
                    (loadedmetadata)="onMetadataLoaded()"
                    (ended)="onVideoEnded()"
                    (click)="togglePlay()"
                    (error)="handleVideoError()"
                    crossorigin="anonymous"
                  ></video>
                  
                  @if (videoError()) {
                     <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 pointer-events-none">
                         <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <svg class="text-red-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                         </div>
                         <h3 class="text-white font-bold mb-1">Video Failed to Load</h3>
                         <p class="text-slate-400 text-sm max-w-sm text-center">The URL might be broken or blocked. Try uploading a local file.</p>
                     </div>
                  }

                  <!-- Custom Controls Overlay -->
                  <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-6 pt-24 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    
                    <!-- Progress Bar -->
                    <div class="relative w-full h-1.5 bg-white/20 hover:h-2.5 transition-all cursor-pointer rounded-full mb-6 group/progress" (click)="seek($event)">
                      <div class="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]" [style.width.%]="videoProgressPercent()"></div>
                      <div class="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none" [style.left.%]="videoProgressPercent()"></div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-6">
                        <!-- Play/Pause -->
                        <button (click)="togglePlay()" class="text-white hover:text-cyan-400 transition-colors transform hover:scale-110">
                          @if (isPlaying()) {
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                          } @else {
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          }
                        </button>

                        <!-- Volume Controls -->
                        <div class="flex items-center gap-3 group/volume">
                            <button (click)="toggleMute()" class="text-slate-300 hover:text-white transition-colors">
                                @if (isMuted() || volume() === 0) {
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                } @else if (volume() < 0.5) {
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                } @else {
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                }
                            </button>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1" 
                                [value]="isMuted() ? 0 : volume()" 
                                (input)="onVolumeChange($event)"
                                class="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            >
                        </div>

                        <!-- Time -->
                        <div class="text-sm font-mono text-slate-300 select-none">
                           <span class="text-white font-bold">{{ formatTime(currentTime()) }}</span> <span class="text-slate-600 mx-1">/</span> {{ formatTime(duration()) }}
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-4">
                         <select (change)="setSpeed($event)" class="bg-black/50 backdrop-blur border border-white/20 text-xs text-white rounded px-3 py-1.5 outline-none hover:bg-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer appearance-none text-center min-w-[80px]">
                           <option value="0.5">0.5x</option>
                           <option value="1" selected>1.0x</option>
                           <option value="1.25">1.25x</option>
                           <option value="1.5">1.5x</option>
                           <option value="2">2.0x</option>
                         </select>

                         <!-- Native Fullscreen Button -->
                         <button (click)="toggleFullscreen()" class="text-slate-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg" title="Fullscreen">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                         </button>
                      </div>
                    </div>
                  </div>
               </div>
             } @else {
               <!-- PDF Viewer (using iframe for robustness) -->
               <div class="w-full h-full flex flex-col bg-slate-900">
                  <div class="h-14 bg-slate-800/50 flex items-center justify-between px-6 border-b border-white/5">
                     <span class="text-sm font-bold text-slate-300 flex items-center gap-2">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                       PDF Viewer
                     </span>
                     <div class="flex items-center gap-3">
                         <button (click)="openPdfExternal()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2" title="Open in New Tab">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            <span class="hidden sm:inline">Open External</span>
                         </button>
                         <button (click)="markPdfComplete()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all">Mark as Read</button>
                     </div>
                  </div>
                  <div class="w-full h-full bg-slate-800 relative">
                     <iframe 
                       [src]="safePdfUrl()" 
                       class="w-full h-full border-none"
                       title="PDF Viewer"
                     ></iframe>
                  </div>
               </div>
             }
           } @else {
             <div class="text-slate-500 text-center animate-fade-in">
               <div class="w-20 h-20 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center mx-auto mb-6">
                 <svg class="text-slate-700" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
               </div>
               <h3 class="text-white text-lg font-bold mb-2">Ready to Start?</h3>
               <p class="text-slate-400">Select a module from the sidebar to begin learning.</p>
             </div>
           }
        </div>
      </main>
    </div>
  `
})
export class CoursePlayerComponent {
  route = inject(ActivatedRoute) as ActivatedRoute;
  data = inject(DataService);
  auth = inject(AuthService);
  sanitizer = inject(DomSanitizer);

  courseId = signal<string>('');
  course = signal<Course | undefined>(undefined);
  currentLesson = signal<Lesson | null>(null);
  
  // UI State
  isSidebarOpen = signal(true);
  isPlaying = signal(false);
  isMuted = signal(false);
  volume = signal(1);
  currentTime = signal(0);
  duration = signal(0);
  videoError = signal(false);

  // Video Element
  @ViewChild('videoPlayer') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer?: ElementRef<HTMLDivElement>;
  
  // PDF Safe URL
  safePdfUrl = computed(() => {
     const lesson = this.currentLesson();
     if (lesson && lesson.type === 'pdf' && lesson.url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(lesson.url);
     }
     return undefined;
  });

  videoProgressPercent = computed(() => {
    return this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0;
  });

  // Navigation Computeds
  flatLessons = computed(() => {
    const c = this.course();
    if (!c) return [];
    return c.modules.flatMap(m => m.lessons);
  });

  currentIndex = computed(() => {
    const lessons = this.flatLessons();
    const current = this.currentLesson();
    return lessons.findIndex(l => l.id === current?.id);
  });

  prevLesson = computed(() => {
    const idx = this.currentIndex();
    return idx > 0 ? this.flatLessons()[idx - 1] : null;
  });

  nextLesson = computed(() => {
    const idx = this.currentIndex();
    const lessons = this.flatLessons();
    return idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
  });
  
  isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

  courseProgress = computed(() => {
    const id = this.courseId();
    if (!id) return 0;
    return this.data.getCourseProgress(id);
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('courseId');
      if (id) {
        this.courseId.set(id);
        const c = this.data.getCourse(id);
        this.course.set(c);
        
        // Auto-open first module if exists
        if (c && c.modules.length > 0) {
            c.modules[0].isOpen = true;
            
            // Restore last played lesson logic
            const courseProgress = this.data.progress()[id];
            let lastPlayedId: string | undefined;
            let maxTimestamp = 0;

            if (courseProgress) {
              for (const [lId, progress] of Object.entries(courseProgress)) {
                const p = progress as { lastUpdated: number };
                if (p.lastUpdated > maxTimestamp) {
                  maxTimestamp = p.lastUpdated;
                  lastPlayedId = lId;
                }
              }
            }
            
            const targetLesson = lastPlayedId ? this.flatLessons().find(l => l.id === lastPlayedId) : c.modules[0].lessons[0];
            if (targetLesson) this.selectLesson(targetLesson);
        }
      }
    });

    effect(() => {
        const lesson = this.currentLesson();
        
        // Reset state on lesson change
        this.videoError.set(false);
        this.isPlaying.set(false);
        this.currentTime.set(0);
        
        // Force video load when URL changes if player exists
        if (lesson && lesson.type === 'video' && this.videoElement?.nativeElement) {
             const v = this.videoElement?.nativeElement;
             v.load();
        }
    });
  }

  handleVideoError() {
      console.error('Video failed to load:', this.currentLesson()?.url);
      this.videoError.set(true);
      this.isPlaying.set(false);
  }

  openPdfExternal() {
      const lesson = this.currentLesson();
      if (lesson?.url) {
          window.open(lesson.url, '_blank');
      }
  }

  isLessonLocked(lesson: Lesson): boolean {
    return !!lesson.isLocked && !this.isAdmin();
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleModule(module: Module) {
    module.isOpen = !module.isOpen;
  }

  selectLesson(lesson: Lesson) {
    if (this.isLessonLocked(lesson)) return;

    this.currentLesson.set(lesson);
  }

  goToLesson(lesson: Lesson | null) {
    if (lesson) this.selectLesson(lesson);
  }

  // Video Logic
  togglePlay() {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => {
        this.isPlaying.set(true);
        this.videoError.set(false);
      }).catch((err) => {
        if (err.name !== 'AbortError') console.error('Play error', err);
        this.isPlaying.set(false);
      });
    } else {
      v.pause();
      this.isPlaying.set(false);
    }
  }

  toggleMute() {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    this.isMuted.update(m => !m);
    v.muted = this.isMuted();
  }

  onVolumeChange(event: Event) {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.volume.set(val);
    v.volume = val;
    
    if (val === 0) {
        this.isMuted.set(true);
        v.muted = true;
    } else {
        this.isMuted.set(false);
        v.muted = false;
    }
  }

  toggleFullscreen() {
    const elem = this.videoContainer?.nativeElement;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  onTimeUpdate() {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    
    const time = v.currentTime;
    this.currentTime.set(time);
    
    if (Math.floor(time) % 5 === 0) {
       this.data.updateLessonProgress(this.courseId(), this.currentLesson()!.id, time, v.duration);
    }
  }

  onMetadataLoaded() {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    this.duration.set(v.duration);
    this.videoError.set(false);
    
    v.volume = this.volume();
    v.muted = this.isMuted();

    const progress = this.data.getLessonProgress(this.courseId(), this.currentLesson()!.id);
    if (progress && progress.timestamp > 0 && progress.status !== 'completed') {
      v.currentTime = progress.timestamp;
    }
  }
  
  onVideoEnded() {
      this.isPlaying.set(false);
      this.data.updateLessonProgress(this.courseId(), this.currentLesson()!.id, this.duration(), this.duration(), true);
  }

  seek(event: MouseEvent) {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    
    const time = percentage * v.duration;
    v.currentTime = time;
    this.currentTime.set(time);
  }

  setSpeed(event: Event) {
    const v = this.videoElement?.nativeElement;
    if (!v) return;
    const speed = parseFloat((event.target as HTMLSelectElement).value);
    v.playbackRate = speed;
  }

  markPdfComplete() {
     this.data.updateLessonProgress(this.courseId(), this.currentLesson()!.id, 1, 1, true);
  }

  getLessonStatus(lessonId: string) {
    return this.data.getLessonProgress(this.courseId(), lessonId)?.status || 'not-started';
  }

  getModuleProgress(module: Module) {
    const total = module.lessons.length;
    const completed = module.lessons.filter(l => this.getLessonStatus(l.id) === 'completed').length;
    return `${completed}/${total}`;
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}