import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { LocalContentService } from './local-content.service';

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf';
  url: string;
  duration?: number; // Estimated duration in seconds
  isLocked?: boolean;
  isLocal?: boolean; // Flag to indicate content is stored in IndexedDB
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  isOpen?: boolean; // Client-side UI state
  defaultLessonType?: 'static' | 'dynamic'; // Preference for new lessons in this module
}

export interface Course {
  id: string;
  title: string;
  batch: string;
  description: string;
  thumbnailUrl: string; // URL for course card image
  modules: Module[];
}

export interface ProgressMap {
  [courseId: string]: {
    [lessonId: string]: {
      status: 'not-started' | 'started' | 'completed';
      timestamp: number; // seconds watched
      lastUpdated: number;
    }
  }
}

const DEFAULT_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Full Stack Web Development',
    batch: 'LearnHub 1.0',
    description: 'Master MERN stack with 50+ real world projects. Code with vrush Edition.',
    thumbnailUrl: 'https://picsum.photos/seed/learnhub/400/225',
    modules: [
      {
        id: 'm1',
        title: 'Introduction & Setup',
        defaultLessonType: 'dynamic',
        lessons: [
          { id: 'l1', title: 'Course Orientation', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 600, isLocal: false },
          { id: 'l2', title: 'VS Code Setup', type: 'pdf', url: 'https://pdfobject.com/pdf/sample.pdf', isLocal: false }
        ]
      },
      {
        id: 'm2',
        title: 'HTML & CSS Basics',
        defaultLessonType: 'dynamic',
        lessons: [
          { id: 'l3', title: 'HTML5 Structure', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 650, isLocal: false },
          { id: 'l4', title: 'CSS Box Model', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 900, isLocked: true, isLocal: false }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Data Structures & Algorithms',
    batch: 'Alpha 4.0',
    description: 'Crack top tech interviews with Java. Ultra Instinct Mode.',
    thumbnailUrl: 'https://picsum.photos/seed/alpha/400/225',
    modules: [
      {
        id: 'm3',
        title: 'Arrays & Strings',
        defaultLessonType: 'dynamic',
        lessons: [
          { id: 'l5', title: 'Introduction to Arrays', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', duration: 1200, isLocal: false }
        ]
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private localContent = inject(LocalContentService);
  
  // State
  courses = signal<Course[]>([]);
  progress = signal<ProgressMap>({});

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Progress
    const storedProgress = localStorage.getItem('learnhub_progress');
    if (storedProgress) {
      try {
        this.progress.set(JSON.parse(storedProgress));
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }

    // Courses
    const storedCourses = localStorage.getItem('learnhub_courses');
    if (storedCourses) {
      try {
        const parsedCourses: Course[] = JSON.parse(storedCourses);
        this.courses.set(parsedCourses);
        // Hydrate local blobs
        this.hydrateLocalContent(parsedCourses);
      } catch (e) {
        console.error('Failed to parse courses', e);
        this.courses.set(DEFAULT_COURSES);
      }
    } else {
      this.courses.set(DEFAULT_COURSES);
      this.saveCourses();
    }
  }

  private async hydrateLocalContent(courses: Course[]) {
    // Iterate all lessons to find isLocal ones
    let updated = false;
    for (const course of courses) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.isLocal) {
            try {
              const blob = await this.localContent.getFile(lesson.id);
              if (blob) {
                // Revoke old URL if it exists (though usually invalid on reload)
                if (lesson.url && lesson.url.startsWith('blob:')) {
                   URL.revokeObjectURL(lesson.url);
                }
                lesson.url = URL.createObjectURL(blob);
                updated = true;
              }
            } catch (err) {
              console.warn(`Could not restore local file for lesson ${lesson.id}`, err);
            }
          }
        }
      }
    }
    // Trigger signal update if URLs changed, although object ref mutation 
    // might not trigger signal equality check, so we force update.
    if (updated) {
        this.courses.update(c => [...c]);
    }
  }

  saveCourses() {
    localStorage.setItem('learnhub_courses', JSON.stringify(this.courses()));
  }

  saveProgress() {
    localStorage.setItem('learnhub_progress', JSON.stringify(this.progress()));
  }

  // API Methods
  getCourse(id: string): Course | undefined {
    return this.courses().find(c => c.id === id);
  }

  updateLessonProgress(courseId: string, lessonId: string, seconds: number, duration: number, isCompleteOverride = false) {
    const currentMap = this.progress();
    const courseMap = currentMap[courseId] || {};
    const existing = courseMap[lessonId] || { status: 'not-started', timestamp: 0, lastUpdated: 0 };

    let status = existing.status;
    
    // Calculate percentage if duration is valid
    const percentage = duration > 0 ? seconds / duration : 0;

    if (isCompleteOverride || percentage > 0.9) {
      status = 'completed';
    } else if (percentage > 0.05 || seconds > 5) { 
      // Mark started if watched > 5% or > 5 seconds
      if (status !== 'completed') {
        status = 'started';
      }
    }

    // Update state
    const newEntry = {
      status,
      timestamp: seconds,
      lastUpdated: Date.now()
    };

    const newMap = {
      ...currentMap,
      [courseId]: {
        ...courseMap,
        [lessonId]: newEntry
      }
    };
    
    this.progress.set(newMap);
    this.saveProgress();
  }

  getLessonProgress(courseId: string, lessonId: string) {
    return this.progress()[courseId]?.[lessonId];
  }

  getCourseProgress(courseId: string): number {
    const course = this.courses().find(c => c.id === courseId);
    if (!course) return 0;
    
    let total = 0;
    let completed = 0;

    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        total++;
        const p = this.getLessonProgress(courseId, l.id);
        if (p?.status === 'completed') completed++;
      });
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  // --- Statistics Helpers ---

  // Returns array of last 7 days activity (0-100 score based on lessons interacted with)
  getDailyActivity(): { date: Date, value: number }[] {
    const now = new Date();
    const days: { date: Date, value: number }[] = [];
    
    // Flatten all progress entries
    const allEntries = Object.values(this.progress()).flatMap(course => Object.values(course));

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      // Count interactions on this day
      const count = allEntries.filter(e => e.lastUpdated >= d.getTime() && e.lastUpdated < nextD.getTime()).length;
      
      // Normalize to some "intensity" score. Say 5 interactions is 100% intensity for the graph
      let value = count * 20; 
      if (value > 100) value = 100;
      
      days.push({ date: d, value });
    }
    return days;
  }

  getTotalHoursLearned(): number {
    // Sum up timestamps (in seconds) / 3600
    const totalSeconds = Object.values(this.progress())
      .flatMap(course => Object.values(course))
      .reduce((acc, curr) => acc + (curr.timestamp || 0), 0);
    
    return parseFloat((totalSeconds / 3600).toFixed(1));
  }

  getCompletedLessonsCount(): number {
     return Object.values(this.progress())
      .flatMap(course => Object.values(course))
      .filter(l => l.status === 'completed').length;
  }

  // Admin Methods
  addCourse(course: Course) {
    this.courses.update(c => [...c, course]);
    this.saveCourses();
  }

  // Deletes a course and all associated local files
  deleteCourse(id: string) {
    const course = this.getCourse(id);
    if (course) {
        course.modules.forEach(m => m.lessons.forEach(l => {
            if (l.isLocal) {
                this.localContent.deleteFile(l.id).catch(err => console.error(`Failed to delete file for lesson ${l.id}`, err));
            }
        }));
    }
    // Update state immutably to trigger signals
    this.courses.update(c => c.filter(x => x.id !== id));
    this.saveCourses();
  }

  // Deletes a specific module and its local files
  deleteModule(courseId: string, moduleId: string) {
    this.courses.update(courses => {
      return courses.map(c => {
        if (c.id === courseId) {
           const module = c.modules.find(m => m.id === moduleId);
           if (module) {
              // Cleanup files side-effect
              module.lessons.forEach(l => {
                  if (l.isLocal) {
                    this.localContent.deleteFile(l.id).catch(err => console.error(`Failed to delete file for lesson ${l.id}`, err));
                  }
              });
           }
           
           return {
             ...c,
             modules: c.modules.filter(m => m.id !== moduleId)
           };
        }
        return c;
      });
    });
    this.saveCourses();
  }

  // Deletes a specific lesson and its local file
  deleteLesson(courseId: string, moduleId: string, lessonId: string) {
    this.courses.update(courses => {
      return courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === moduleId) {
                 const lesson = m.lessons.find(l => l.id === lessonId);
                 if (lesson && lesson.isLocal) {
                     this.localContent.deleteFile(lesson.id).catch(err => console.error(`Failed to delete file for lesson ${lesson.id}`, err));
                 }
                 
                 return {
                   ...m,
                   lessons: m.lessons.filter(l => l.id !== lessonId)
                 };
              }
              return m;
            })
          };
        }
        return c;
      });
    });
    this.saveCourses();
  }
  
  updateCourse(updatedCourse: Course) {
      // Create a shallow copy of the array with the updated course to trigger signal equality check
      this.courses.update(courses => courses.map(c => c.id === updatedCourse.id ? {...updatedCourse} : c));
      this.saveCourses();
  }

  reorderModules(courseId: string, fromIndex: number, toIndex: number) {
    const course = this.getCourse(courseId);
    if (!course || fromIndex < 0 || toIndex < 0 || fromIndex >= course.modules.length || toIndex >= course.modules.length) return;
    
    // Clone logic for reorder
    const modules = [...course.modules];
    const [moved] = modules.splice(fromIndex, 1);
    modules.splice(toIndex, 0, moved);
    
    const newCourse = { ...course, modules };
    this.updateCourse(newCourse);
  }

  reorderLessons(courseId: string, moduleId: string, fromIndex: number, toIndex: number) {
    const course = this.getCourse(courseId);
    if (!course) return;

    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;
    
    const module = course.modules[moduleIndex];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= module.lessons.length || toIndex >= module.lessons.length) return;

    const lessons = [...module.lessons];
    const [moved] = lessons.splice(fromIndex, 1);
    lessons.splice(toIndex, 0, moved);

    // Create new module structure
    const newModules = [...course.modules];
    newModules[moduleIndex] = { ...module, lessons };

    const newCourse = { ...course, modules: newModules };
    this.updateCourse(newCourse);
  }
}