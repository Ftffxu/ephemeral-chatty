
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  uniqueId: string;
  password: string; // We'll store this for the mock auth system
}

// This is a browser-based database using localStorage
export const authService = {
  // Initialize users from localStorage or empty array
  users: JSON.parse(localStorage.getItem('users') || '[]') as User[],
  currentUser: null as User | null,
  
  // Save users to localStorage
  _saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  },
  
  generateUniqueId(): string {
    // Generate a random 8-character alphanumeric string
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },
  
  register(email: string, username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Check if user already exists
        if (this.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
          reject(new Error('User with this email already exists'));
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          username,
          uniqueId: this.generateUniqueId(),
          password // Store password (in a real app would be hashed)
        };
        
        // Store user
        this.users.push(newUser);
        this._saveUsers(); // Save to localStorage
        
        // Set current user (but omit password)
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        this.currentUser = userWithoutPassword as User;
        
        // Store in localStorage to persist the session
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        resolve(userWithoutPassword as User);
      }, 1000);
    });
  },
  
  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Find user
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          // In a real app, you shouldn't reveal whether an email exists or not
          reject(new Error('Invalid credentials'));
          return;
        }
        
        // Password check
        if (user.password !== password) {
          reject(new Error('Invalid credentials'));
          return;
        }
        
        // Create user without password to store as current user
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        // Set current user
        this.currentUser = userWithoutPassword as User;
        
        // Store in localStorage to persist the session
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        resolve(userWithoutPassword as User);
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
        if (user) {
          // Return user without password
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          resolve(userWithoutPassword as User);
        } else {
          resolve(null);
        }
      }, 500);
    });
  }
};
