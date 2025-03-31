import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  uniqueId: string;
  password: string; // We'll store this for the mock auth system
  verified: boolean; // New field to track verification status
}

interface PendingRegistration {
  email: string;
  username: string;
  password: string;
  otp: string;
  otpExpiry: number;
}

// This is a browser-based database using localStorage
export const authService = {
  // Initialize users from localStorage or empty array
  users: JSON.parse(localStorage.getItem('users') || '[]') as User[],
  pendingRegistrations: JSON.parse(localStorage.getItem('pendingRegistrations') || '[]') as PendingRegistration[],
  currentUser: null as User | null,
  
  // Save users to localStorage
  _saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  },

  // Save pending registrations to localStorage
  _savePendingRegistrations() {
    localStorage.setItem('pendingRegistrations', JSON.stringify(this.pendingRegistrations));
  },
  
  generateUniqueId(): string {
    // Generate a random 8-character alphanumeric string
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  generateOTP(): string {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Start registration process and send OTP
  startRegistration(email: string, username: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Check if user already exists
        if (this.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
          reject(new Error('User with this email already exists'));
          return;
        }

        // Check if there's already a pending registration
        const existingPending = this.pendingRegistrations.find(
          reg => reg.email.toLowerCase() === email.toLowerCase()
        );

        // Generate OTP
        const otp = this.generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        if (existingPending) {
          // Update existing pending registration
          existingPending.username = username;
          existingPending.password = password;
          existingPending.otp = otp;
          existingPending.otpExpiry = otpExpiry;
        } else {
          // Create new pending registration
          this.pendingRegistrations.push({
            email,
            username,
            password,
            otp,
            otpExpiry
          });
        }
        
        this._savePendingRegistrations();
        
        // In a real app, this would send an email
        console.log(`OTP for ${email}: ${otp}`);
        
        // Return masked email for UI
        const maskedEmail = this.maskEmail(email);
        resolve(maskedEmail);
      }, 1000);
    });
  },
  
  // Helper to mask email for display
  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + 
      '*'.repeat(username.length > 2 ? username.length - 2 : 1) + 
      (username.length > 1 ? username.charAt(username.length - 1) : '');
    return `${maskedUsername}@${domain}`;
  },

  // Verify OTP and complete registration
  verifyOTP(email: string, otp: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Find pending registration
        const pendingIndex = this.pendingRegistrations.findIndex(
          reg => reg.email.toLowerCase() === email.toLowerCase()
        );

        if (pendingIndex === -1) {
          reject(new Error('No pending registration found'));
          return;
        }

        const pending = this.pendingRegistrations[pendingIndex];

        // Check if OTP is expired
        if (Date.now() > pending.otpExpiry) {
          reject(new Error('OTP has expired, please request a new one'));
          return;
        }

        // Check if OTP matches
        if (pending.otp !== otp) {
          reject(new Error('Invalid OTP'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: crypto.randomUUID(),
          email: pending.email,
          username: pending.username,
          uniqueId: this.generateUniqueId(),
          password: pending.password,
          verified: true
        };
        
        // Store user
        this.users.push(newUser);
        this._saveUsers();
        
        // Remove pending registration
        this.pendingRegistrations.splice(pendingIndex, 1);
        this._savePendingRegistrations();
        
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

  // Resend OTP 
  resendOTP(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Find pending registration
        const pending = this.pendingRegistrations.find(
          reg => reg.email.toLowerCase() === email.toLowerCase()
        );

        if (!pending) {
          reject(new Error('No pending registration found'));
          return;
        }

        // Generate new OTP
        const otp = this.generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // Update pending registration
        pending.otp = otp;
        pending.otpExpiry = otpExpiry;
        this._savePendingRegistrations();

        // In a real app, this would send an email
        console.log(`New OTP for ${email}: ${otp}`);
        
        // Return masked email for UI
        const maskedEmail = this.maskEmail(email);
        resolve(maskedEmail);
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
