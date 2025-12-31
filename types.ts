
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface StudyDoc {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'youtube';
  date: string;
  content?: string;
}

export interface GradingResult {
  score: number;
  transcription: string;
  gapAnalysis: string;
  keyPoints: string[];
  tips: string;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  subject: string;
  solution: {
    intro: string;
    body: string;
    conclusion: string;
  };
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  SCANNER = 'scanner',
  VAULT = 'vault',
  VIDEO_NOTES = 'video-notes',
  QUESTIONS = 'questions'
}
