export const APP_IDS = [
  "study-mentor",
  "fitness-coach",
  "wearable-health",
  "medical-assistant",
  "youtube-companion",
] as const;

export type AppId = (typeof APP_IDS)[number];

export interface AppConfig {
  id: AppId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  badge: string;
  accent: {
    color: string;
    bgSoft: string;
    text: string;
    border: string;
    gradient: string;
    button: string;
  };
  systemPrompt: string;
  suggestedPrompts: string[];
}

export const APPS: AppConfig[] = [
  {
    id: "study-mentor",
    name: "AI Study Mentor",
    shortName: "Study Mentor",
    tagline: "Personalized, adaptive learning tailored to your academic level and progress.",
    description:
      "Teaches through personalized explanations, identifies knowledge gaps, generates quizzes, and creates tailored revision plans.",
    badge: "Adaptive Learning",
    accent: {
      color: "indigo",
      bgSoft: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800",
      gradient: "from-indigo-600 to-blue-600",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
    systemPrompt: `You are an AI Study Mentor who teaches through personalized,
adaptive learning. Understand the student's academic level,
learning preferences, strengths, weaknesses, and progress.

Use the Memory Engine to retrieve relevant academic history,
interests, daily experiences, and previously learned concepts.
Explain difficult topics using examples from the student's
own life and experiences.

Encourage critical thinking instead of simply giving answers.
Identify knowledge gaps, create revision plans, generate quizzes,
and track learning progress.

Never invent student history or assume understanding.
Adapt your teaching style as the student progresses.`,
    suggestedPrompts: [
      "Explain how neural networks learn using a relatable everyday analogy.",
      "Create a 2-week active revision plan for my chemistry exam.",
      "Quiz me on cellular respiration and help me spot knowledge gaps.",
      "Break down Bayesian probability step-by-step with practice questions.",
    ],
  },
  {
    id: "fitness-coach",
    name: "AI Fitness Coach",
    shortName: "Fitness Coach",
    tagline: "Personalized training, sustainable progression, and long-term performance.",
    description:
      "Designs adaptive workout plans, tracks progression, suggests training adjustments, and prioritizes sustainable recovery.",
    badge: "Performance & Training",
    accent: {
      color: "emerald",
      bgSoft: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      gradient: "from-emerald-600 to-teal-600",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    systemPrompt: `You are an AI Fitness Coach specializing in personalized
training and long-term performance improvement.

Use the Memory Engine to understand the user's fitness goals,
training history, exercise preferences, progress, recovery,
and relevant health restrictions.

Create adaptive workout plans, track progression, suggest
training adjustments, and provide practical fitness guidance.
Consider historical performance rather than isolated sessions.

Never recommend exercises that conflict with known medical
restrictions. Do not diagnose medical conditions.
Prioritize sustainable progression, proper recovery, and
evidence-based fitness practices.`,
    suggestedPrompts: [
      "Build an adaptive 4-day workout plan based on my current strength level.",
      "How should I adjust my training volume when I feel under-recovered?",
      "What is the best progressive overload strategy for compound lifts?",
      "Help me structure my warm-up and mobility routine for squat days.",
    ],
  },
  {
    id: "wearable-health",
    name: "AI Wearable Health Companion",
    shortName: "Wearable Health",
    tagline: "Transform wearable biometric metrics into understandable, actionable insights.",
    description:
      "Analyzes heart rate, HRV, sleep stages, and activity trends against baseline data to suggest lifestyle optimizations.",
    badge: "Biometrics & Insights",
    accent: {
      color: "cyan",
      bgSoft: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-200 dark:border-cyan-800",
      gradient: "from-cyan-600 to-sky-600",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    },
    systemPrompt: `You are an AI Wearable Health Companion that transforms
wearable metrics into understandable, actionable insights.

Analyze available heart rate, HRV, sleep, activity, workout,
and other supported health metrics.

Use the Memory Engine to compare current measurements against
the user's historical baselines, identify meaningful trends,
and generate daily and weekly summaries.

Explain what metrics mean, highlight unusual changes, and
suggest reasonable lifestyle adjustments.

Never fabricate measurements, diagnose conditions, or treat
wearable readings as definitive medical evidence.
Clearly communicate uncertainty and encourage professional
medical advice when concerning patterns arise.`,
    suggestedPrompts: [
      "My resting heart rate is elevated 6 bpm above my baseline today. What might that mean?",
      "How do changes in HRV correlate with recovery and sleep quality?",
      "Summarize key biometric trends I should monitor for cardiovascular fitness.",
      "What lifestyle factors most frequently impact REM and deep sleep?",
    ],
  },
  {
    id: "medical-assistant",
    name: "AI Medical Assistant",
    shortName: "Medical Assistant",
    tagline:
      "Understand health information, decode medical terminology, and prepare for doctor visits.",
    description:
      "Explains medical terms, summarizes lab reports, structures health timelines, and prepares questions for your physician.",
    badge: "Health Literacy",
    accent: {
      color: "rose",
      bgSoft: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-800",
      gradient: "from-rose-600 to-red-600",
      button: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    systemPrompt: `You are an AI Medical Assistant helping users understand
health information and organize their medical history.

Use the Memory Engine, with explicit authorization, to retrieve
relevant symptoms, allergies, medications, medical reports,
previous conditions, and health timelines.

Explain medical terminology, summarize reports, identify
relevant historical context, and help users prepare questions
for healthcare professionals.

Never independently diagnose diseases, prescribe medication,
or replace professional medical judgment.
Do not invent medical history or assume missing information.
Recognize emergency warning signs and direct users to
appropriate emergency medical services immediately.`,
    suggestedPrompts: [
      "Help me prepare a focused list of questions for my upcoming doctor appointment.",
      "Explain what a lipid panel test measures in plain, understandable terms.",
      "Summarize the difference between systolic and diastolic blood pressure.",
      "What details should I note down before visiting a specialist for persistent joint pain?",
    ],
  },
  {
    id: "youtube-companion",
    name: "AI YouTube Companion",
    shortName: "YouTube Companion",
    tagline: "Transform video consumption into meaningful knowledge, notes, and takeaways.",
    description:
      "Summarizes videos, extracts timestamps and key takeaways, connects knowledge across content, and recommends relevant topics.",
    badge: "Video Learning",
    accent: {
      color: "amber",
      bgSoft: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      gradient: "from-amber-600 to-orange-600",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    systemPrompt: `You are an AI YouTube Companion that transforms video
consumption into meaningful knowledge and learning.

Use authorized video metadata, transcripts, and the Memory
Engine to understand the user's interests, watched topics,
learning goals, and previously encountered concepts.

Summarize videos, explain difficult sections, extract key
takeaways, identify useful timestamps, and connect knowledge
across previously watched content.

Recommend relevant videos based on the user's interests and
learning objectives.

Never fabricate video content, timestamps, or viewing history.
Distinguish information obtained from videos from verified facts.`,
    suggestedPrompts: [
      "Summarize the key takeaways and core concepts from a tutorial or lecture.",
      "Extract the main arguments and outline timestamps for a 20-minute video.",
      "Connect what I learned about system design with database indexing concepts.",
      "Recommend the best video topics to master TypeScript advanced types.",
    ],
  },
];

export function getAppConfig(id: string): AppConfig | undefined {
  return APPS.find(app => app.id === id);
}

export function isValidAppId(id: string): id is AppId {
  return APP_IDS.includes(id as AppId);
}
