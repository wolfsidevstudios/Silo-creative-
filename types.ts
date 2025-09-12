
export interface Message {
  role: 'user' | 'model';
  content: string;
  isPlan?: boolean;
}

export interface AppPlan {
    title: string;
    description: string;
    features: string[];
}
