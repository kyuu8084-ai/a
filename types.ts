export interface User {
  name: string;
  avatar: string | null; // Base64 string
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
