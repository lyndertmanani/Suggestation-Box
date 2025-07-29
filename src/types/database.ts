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