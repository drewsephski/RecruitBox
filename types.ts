
export interface JobDescription {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface InterviewQuestion {
  question: string;
  competency: string;
  evaluationCriteria: string;
}

export interface ScreeningQuestion {
  question: string;
  idealAnswerKeywords: string[];
}

export interface RecruitmentResult {
  jobDescription: JobDescription;
  interviewGuide: InterviewQuestion[];
  screeningQuestions: ScreeningQuestion[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  notes: string;
  config: GenerationConfig;
  result: RecruitmentResult;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface GenerationConfig {
  tone: 'corporate' | 'startup' | 'executive';
  seniority: 'entry' | 'mid' | 'senior' | 'lead';
}

export enum AppView {
  SANDBOX = 'SANDBOX',
  CHAT = 'CHAT'
}
