
import { User } from './auth';
import { encryptionService } from './encryption';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

export interface ChatSession {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: number;
  isGroup: boolean;
  name?: string; // For group chats
}

export const chatService = {
  // In-memory storage (would be a database in production)
  sessions: [] as ChatSession[],
  
  // User session keys (for E2E encryption)
  userKeys: new Map<string, { publicKey: string; privateKey: string }>(),
  
  // Create a new chat session between users
  createSession(creator: User, recipient: User | null, isGroup: boolean = false, groupName?: string): Promise<ChatSession> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const participants = recipient ? [creator, recipient] : [creator];
        
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          participants,
          messages: [],
          createdAt: Date.now(),
          isGroup,
          name: isGroup ? groupName : undefined,
        };
        
        // Generate encryption keys for the creator
        if (!this.userKeys.has(creator.id)) {
          this.userKeys.set(creator.id, encryptionService.generateKeyPair());
        }
        
        // Generate encryption keys for the recipient
        if (recipient && !this.userKeys.has(recipient.id)) {
          this.userKeys.set(recipient.id, encryptionService.generateKeyPair());
        }
        
        this.sessions.push(newSession);
        
        resolve(newSession);
      }, 800);
    });
  },
  
  // Get all sessions for a user
  getUserSessions(userId: string): Promise<ChatSession[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userSessions = this.sessions.filter(session => 
          session.participants.some(participant => participant.id === userId)
        );
        resolve(userSessions);
      }, 500);
    });
  },
  
  // Get a specific session by ID
  getSessionById(sessionId: string): Promise<ChatSession | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = this.sessions.find(s => s.id === sessionId);
        resolve(session || null);
      }, 300);
    });
  },
  
  // Send a message in a session
  sendMessage(sessionId: string, sender: User, content: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const session = this.sessions.find(s => s.id === sessionId);
        
        if (!session) {
          reject(new Error('Session not found'));
          return;
        }
        
        // Check if sender is a participant
        if (!session.participants.some(p => p.id === sender.id)) {
          reject(new Error('User is not a participant in this session'));
          return;
        }
        
        // In a real E2E implementation, we would encrypt the message differently for each recipient
        // For simplicity, we'll just use one recipient's public key here
        const recipient = session.participants.find(p => p.id !== sender.id);
        let encryptedContent = content;
        
        if (recipient) {
          const recipientKeys = this.userKeys.get(recipient.id);
          if (recipientKeys) {
            encryptedContent = encryptionService.encryptMessage(content, recipientKeys.publicKey);
          }
        }
        
        const newMessage: Message = {
          id: crypto.randomUUID(),
          senderId: sender.id,
          content: encryptedContent,
          timestamp: Date.now(),
          encrypted: true
        };
        
        session.messages.push(newMessage);
        
        resolve(newMessage);
      }, 300);
    });
  },
  
  // Get decrypted messages for a user in a session
  getDecryptedMessages(sessionId: string, userId: string): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const session = this.sessions.find(s => s.id === sessionId);
        
        if (!session) {
          reject(new Error('Session not found'));
          return;
        }
        
        // Check if user is a participant
        if (!session.participants.some(p => p.id === userId)) {
          reject(new Error('User is not a participant in this session'));
          return;
        }
        
        const userKeys = this.userKeys.get(userId);
        
        if (!userKeys) {
          reject(new Error('Encryption keys not found for user'));
          return;
        }
        
        // Decrypt messages intended for this user
        const decryptedMessages = session.messages.map(message => {
          if (message.encrypted && message.senderId !== userId) {
            return {
              ...message,
              content: encryptionService.decryptMessage(message.content, userKeys.privateKey),
              encrypted: false
            };
          }
          return message;
        });
        
        resolve(decryptedMessages);
      }, 300);
    });
  },
  
  // End a session and delete all associated data
  endSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex === -1) {
          reject(new Error('Session not found'));
          return;
        }
        
        // Remove the session
        this.sessions.splice(sessionIndex, 1);
        
        toast({
          title: "Chat session ended",
          description: "All messages have been permanently deleted",
        });
        
        resolve();
      }, 800);
    });
  }
};
