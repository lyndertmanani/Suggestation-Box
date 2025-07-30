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


export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}
// ...existing code...
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is a value proposition primarily meant to do?",
    options: [
      "Describe your business history",
      "Promise value to customers by solving a specific problem",
      "Set the product’s pricing structure",
      "List business assets"
    ],
    correct: 1
  },
  {
    question: "Which of these is a correct example of a value proposition?",
    options: [
      "The cheapest item on the market.",
      "We make good products.",
      "Cold storage units that reduce food spoilage for farmers.",
      "Innovative. Unique. Best."
    ],
    correct: 2
  },
  {
    question: "Which of the following is NOT one of the five core characteristics of an effective value proposition?",
    options: [
      "Quantifiable",
      "Concise",
      "Fancy",
      "Differentiated"
    ],
    correct: 2
  },
  {
    question: "What is meant by ‘Customer Pains’?",
    options: [
      "Emotional stories about your brand",
      "The high prices of your competitors",
      "Challenges, risks, or frustrations customers face",
      "Customer complaints about your employees"
    ],
    correct: 2
  },
  {
    question: "An unexpected gain is defined as:",
    options: [
      "A required benefit",
      "A surprising, delightful outcome",
      "A frequent pain",
      "A business-only solution"
    ],
    correct: 1
  },
  {
    question: "What is the purpose of a value proposition canvas?",
    options: [
      "To sketch a marketing plan",
      "To visualize pricing tiers",
      "To align customer needs with product solutions",
      "To compare multiple brands"
    ],
    correct: 2
  },
  {
    question: "What does “Jobs to be Done” refer to in customer discovery?",
    options: [
      "Government job listings",
      "Tasks or goals the customer is trying to complete",
      "Organizational hiring strategy",
      "Project deadlines"
    ],
    correct: 1
  },
  {
    question: "Which of the following is a 'pain reliever' for a farmer struggling with post-harvest loss?",
    options: [
      "Online cooking lessons",
      "Weekly motivational messages",
      "A solar-powered cold storage system",
      "A farming simulation game"
    ],
    correct: 2
  },
  {
    question: "Which of these is a 'gain creator' in business?",
    options: [
      "A chatbot that solves IT issues instantly",
      "A competitor’s new product",
      "An employee’s resume",
      "A customer complaint form"
    ],
    correct: 0
  },
  {
    question: "In the value chain approach, identifying a gap usually results in:",
    options: [
      "More government support",
      "A competitive tender",
      "A business opportunity",
      "More licensing requirements"
    ],
    correct: 2
  },
  {
    question: "Which of these is a regulatory problem?",
    options: [
      "High fuel prices",
      "Lack of sanitation",
      "New law requiring Vitamin A in oil",
      "Lack of parental support"
    ],
    correct: 2
  },
  {
    question: "Which of these would be considered a customer segment?",
    options: [
      "The entire nation",
      "Youth in urban areas with low access to credit",
      "Fish",
      "Teachers and nurses combined as one"
    ],
    correct: 1
  },
  {
    question: "What does the 'Fit Analysis' phase aim to evaluate?",
    options: [
      "The employee performance in sales",
      "The profits generated from value delivery",
      "The match between your solution and customer needs",
      "The legal position of your business"
    ],
    correct: 2
  },
  {
    question: "What kind of customer gain is considered “must-have”?",
    options: [
      "Desired gain",
      "Expected gain",
      "Unexpected gain",
      "Required gain"
    ],
    correct: 3
  },
  {
    question: "Which of the following would BEST complete this value proposition framework: “For [target customer] who [problem], our [product] provides [solution], unlike [alternative]”?",
    options: [
      "Brand slogan",
      "Price comparison",
      "Proof of past performance",
      "Differentiator"
    ],
    correct: 3
  }
];


// Inside /src/types/database.ts

export const FEEDBACK_CATEGORIES = [
  'General Feedback',
  'Session/Training Feedback',
  'NYCOM Members Feedback',
  'Our System Feedback',
];
