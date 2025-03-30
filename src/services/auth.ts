
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  uniqueId: string;
}

// This would be replaced with actual backend authentication
export const authService = {
  // In-memory user storage (would be a database in production)
  users: [] as User[],
  currentUser: null as User | null,
  
  generateUniqueId(): string {
    // Generate a random 8-character alphanumeric string
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },
  
  register(email: string, username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Check if user already exists
        if (this.users.some(user => user.email === email)) {
          reject(new Error('User with this email already exists'));
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          username,
          uniqueId: this.generateUniqueId(),
        };
        
        // Store user
        this.users.push(newUser);
        this.currentUser = newUser;
        
        // Store in localStorage to persist the session
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        resolve(newUser);
      }, 1000);
    });
  },
  
  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Find user
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
          // In a real app, you shouldn't reveal whether an email exists or not
          reject(new Error('Invalid credentials'));
          return;
        }
        
        // Password check would happen here in a real app
        
        // Set current user
        this.currentUser = user;
        
        // Store in localStorage to persist the session
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        resolve(user);
      }, 1000);
    });
  },
  
  logout(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        resolve();
      }, 500);
    });
  },
  
  getCurrentUser(): Promise<User | null> {
    return new Promise(resolve => {
      // First check memory
      if (this.currentUser) {
        resolve(this.currentUser);
        return;
      }
      
      // Then check localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          resolve(this.currentUser);
        } catch (e) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  },

  // Find a user by their unique ID
  findUserByUniqueId(uniqueId: string): Promise<User | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const user = this.users.find(u => u.uniqueId === uniqueId);
        resolve(user || null);
      }, 500);
    });
  }
};
