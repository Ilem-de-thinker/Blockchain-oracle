import apiClient from './client';

export interface QuizOption {
  id?: number;
  text: string;
  is_correct?: boolean;
}

export interface QuizQuestion {
  id?: number;
  text: string;
  order?: number;
  options?: QuizOption[];
}

export interface Quiz {
  id: number;
  module: number;
  title: string;
  description: string;
  questions?: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateQuizData {
  module: number;
  title: string;
  description: string;
  questions: Array<{
    text: string;
    order: number;
    options: Array<{
      text: string;
      is_correct: boolean;
    }>;
  }>;
}

export interface QuizAnswer {
  question_id: number;
  option_id: number;
}

export interface QuizAttempt {
  id: number;
  quiz_title: string;
  selected_questions: QuizQuestion[];
  created_at: string;
}

export interface QuizResult {
  id: number;
  user?: number;
  user_username: string;
  quiz: number;
  quiz_title?: string;
  correct_answers?: number;
  total_questions?: number;
  score: string;
  is_passed?: boolean;
  completed_at: string;
  created_at?: string;
}

const normalizeQuiz = (raw: any): Quiz => ({
  id: raw?.id,
  module: raw?.module,
  title: raw?.title ?? '',
  description: raw?.description ?? '',
  questions: Array.isArray(raw?.questions)
    ? raw.questions.map((question: any) => ({
        id: question?.id,
        text: question?.text ?? '',
        order: question?.order,
        options: Array.isArray(question?.options)
          ? question.options.map((option: any) => ({
              id: option?.id,
              text: option?.text ?? '',
              is_correct: option?.is_correct,
            }))
          : [],
      }))
    : undefined,
  created_at: raw?.created_at,
  updated_at: raw?.updated_at,
});

const normalizeQuizResult = (raw: any): QuizResult => ({
  id: raw?.id,
  user: raw?.user,
  user_username: raw?.user_username ?? '',
  quiz: raw?.quiz,
  quiz_title: raw?.quiz_title,
  correct_answers: raw?.correct_answers,
  total_questions: raw?.total_questions,
  score: String(raw?.score ?? '0'),
  is_passed: typeof raw?.is_passed === 'boolean' ? raw.is_passed : undefined,
  completed_at: raw?.completed_at ?? '',
  created_at: raw?.created_at,
});

const normalizeQuizAttempt = (raw: any): QuizAttempt => ({
  id: raw?.id,
  quiz_title: raw?.quiz_title ?? '',
  selected_questions: Array.isArray(raw?.selected_questions)
    ? raw.selected_questions.map((question: any) => ({
        id: question?.id,
        text: question?.text ?? '',
        order: question?.order,
        options: Array.isArray(question?.options)
          ? question.options.map((option: any) => ({
              id: option?.id,
              text: option?.text ?? '',
            }))
          : [],
      }))
    : [],
  created_at: raw?.created_at ?? '',
});

export const getQuizzes = async (moduleId?: number): Promise<Quiz[]> => {
  const params = moduleId ? `?module_id=${moduleId}` : '';
  const response = await apiClient.get(`/api/quizzes/${params}`);
  const data = Array.isArray(response.data)
    ? response.data
    : response.data?.results || response.data?.items || [];
  return data.map(normalizeQuiz);
};

export const createQuiz = async (data: CreateQuizData): Promise<Quiz> => {
  const response = await apiClient.post('/api/quizzes/', data);
  return normalizeQuiz(response.data);
};

export const getQuiz = async (id: number): Promise<Quiz> => {
  const response = await apiClient.get(`/api/quizzes/${id}/`);
  return normalizeQuiz(response.data);
};

export const startQuizAttempt = async (quizId: number): Promise<QuizAttempt> => {
  const response = await apiClient.post(`/api/quizzes/${quizId}/start/`);
  return normalizeQuizAttempt(response.data);
};

export const submitQuizAttempt = async (attemptId: number, answers: QuizAnswer[]): Promise<QuizResult> => {
  const response = await apiClient.post(`/api/quizzes/attempts/${attemptId}/submit/`, {
    answers,
  });
  return normalizeQuizResult(response.data);
};

export const getQuizResults = async (quizId: number): Promise<QuizResult[]> => {
  const response = await apiClient.get(`/api/quizzes/${quizId}/results/`);
  const data = Array.isArray(response.data)
    ? response.data
    : response.data?.results || response.data?.items || [];
  return data.map(normalizeQuizResult);
};

export const getMyQuizResults = async (userId?: number): Promise<QuizResult[]> => {
  const params = userId ? `?user_id=${userId}` : '';
  const response = await apiClient.get(`/api/quizzes/my-results/${params}`);
  const data = Array.isArray(response.data)
    ? response.data
    : response.data?.results || response.data?.items || [];
  return data.map(normalizeQuizResult);
};

export const quizzesApi = {
  getQuizzes,
  getQuiz,
  createQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizResults,
  getMyQuizResults,
};

export default quizzesApi;
