export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Step {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
}