import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string; // In a real app, this should be a hash. For this demo, we store as string.
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
    
    // Check localStorage for persisted session
    const storedSession = localStorage.getItem('learnhub_session');
    if (storedSession) {
      this.currentUser.set(JSON.parse(storedSession));
    }
  }

  private loadUsers() {
    const storedUsers = localStorage.getItem('learnhub_users');
    if (storedUsers) {
      this.users.set(JSON.parse(storedUsers));
    } else {
      // Initialize default users if none exist
      const defaults: User[] = [
        {
          id: 'admin_1',
          name: 'Administrator',
          email: 'admin@learnhub.com',
          role: 'admin',
          password: 'admin' 
        },
        {
          id: 'user_1',
          name: 'Demo Student',
          email: 'student@learnhub.com',
          role: 'user',
          password: 'user'
        }
      ];
      this.users.set(defaults);
      this.saveUsers();
    }
  }

  private saveUsers() {
    localStorage.setItem('learnhub_users', JSON.stringify(this.users()));
  }

  login(email: string, password: string): boolean {
    const user = this.users().find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create session object (exclude password)
      const sessionUser = { ...user };
      delete sessionUser.password;
      
      localStorage.setItem('learnhub_session', JSON.stringify(sessionUser));
      this.currentUser.set(sessionUser);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('learnhub_session');
    this.currentUser.set(null);
  }

  // User Management Methods
  createUser(user: User) {
    this.users.update(current => [...current, user]);
    this.saveUsers();
  }

  deleteUser(id: string) {
    this.users.update(current => current.filter(u => u.id !== id));
    this.saveUsers();
  }

  updateUser(updatedUser: User) {
    this.users.update(current => 
      current.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
    // If updating current user (e.g. admin password), update session too
    if (this.currentUser()?.id === updatedUser.id) {
       const sessionUser = { ...updatedUser };
       delete sessionUser.password;
       this.currentUser.set(sessionUser);
       localStorage.setItem('learnhub_session', JSON.stringify(sessionUser));
    }
    this.saveUsers();
  }

  getAdminUser(): User | undefined {
    return this.users().find(u => u.role === 'admin');
  }
}
