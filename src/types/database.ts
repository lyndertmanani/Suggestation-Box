export interface User {
  id: string;
  email?: string;
  session_id?: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  content: string;
  category?: string;
  created_at: string;
}

export interface Report {
  id: string;
  generated_at: string;
  summary?: string;
  sentiment?: string;
  topics?: string[];
  raw_data?: any;
}

export interface QuizSettings {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  answers: number[];
  score?: number;
  completed_at: string;
}