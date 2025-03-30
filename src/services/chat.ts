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
        
        // Generate encryption keys for the creator if they don't exist
        if (!this.userKeys.has(creator.id)) {
          this.userKeys.set(creator.id, encryptionService.generateKeyPair());
        }
        
        // Generate encryption keys for the recipient if they don't exist
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
        
        // Encrypt the message separately for each recipient
        // For each recipient, we encrypt the message with their public key
        const recipientEncryptedMessages = new Map<string, string>();
        
        // In a group chat, we need to encrypt for each member separately
        for (const participant of session.participants) {
          if (participant.id !== sender.id) { // Don't encrypt for the sender
            const recipientKeys = this.userKeys.get(participant.id);
            if (recipientKeys) {
              const encrypted = encryptionService.encryptMessage(content, recipientKeys.publicKey);
              recipientEncryptedMessages.set(participant.id, encrypted);
            }
          }
        }
        
        // Store the sender's original content for their own view
        // But for others, store encrypted versions that only they can decrypt
        const newMessage: Message = {
          id: crypto.randomUUID(),
          senderId: sender.id,
          // The content is stored as a JSON string with recipient-specific encryptions
          content: JSON.stringify({
            original: content, // Visible to the sender
            encrypted: Object.fromEntries(recipientEncryptedMessages)
          }),
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
          if (message.encrypted) {
            try {
              // Parse the JSON content
              const content = JSON.parse(message.content);
              
              // If the user is the sender, they can see the original content
              if (message.senderId === userId) {
                return {
                  ...message,
                  content: content.original,
                  encrypted: false
                };
              } 
              // Otherwise, decrypt the message using their private key
              else if (content.encrypted && content.encrypted[userId]) {
                return {
                  ...message,
                  content: encryptionService.decryptMessage(content.encrypted[userId], userKeys.privateKey),
                  encrypted: false
                };
              }
              
              // Fallback if no encryption found for this user
              return {
                ...message,
                content: "Unable to decrypt this message",
                encrypted: true
              };
            } catch (error) {
              console.error("Decryption error:", error);
              return {
                ...message,
                content: "Error decrypting message",
                encrypted: true
              };
            }
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
