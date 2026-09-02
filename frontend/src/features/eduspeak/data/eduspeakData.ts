import {
  LanguageOption,
  VocabularyWord,
  GrammarRule,
  SpeakingTopic,
  RealLifeScenario,
  SpeakingModule,
} from "../types/eduspeak.types";

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: "en-US", name: "English (US)", nativeName: "English", flag: "🇺🇸" },
  { code: "es-ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
];

export const DAILY_VOCABULARY: VocabularyWord[] = [
  {
    id: "v1",
    word: "Articulate",
    phonetic: "/ɑːrˈtɪk.jə.lət/",
    partOfSpeech: "adjective",
    definition: "Having or showing the ability to speak fluently and coherently.",
    example: "She gave an articulate and persuasive presentation on accessibility.",
    synonyms: ["Eloquent", "Fluent", "Coherent", "Expressive"],
    mastered: false,
  },
  {
    id: "v2",
    word: "Perspicacious",
    phonetic: "/ˌpɜːr.spɪˈkeɪ.ʃəs/",
    partOfSpeech: "adjective",
    definition: "Having a ready insight into and understanding of things.",
    example: "His perspicacious observations identified the root bug quickly.",
    synonyms: ["Perceptive", "Astute", "Insightful", "Sharp"],
    mastered: true,
  },
  {
    id: "v3",
    word: "Eloquent",
    phonetic: "/ˈel.ə.kwənt/",
    partOfSpeech: "adjective",
    definition: "Fluent or persuasive in speaking or writing.",
    example: "An eloquent summary convinced the committee to approve the roadmap.",
    synonyms: ["Expressive", "Silver-tongued", "Poignant"],
    mastered: false,
  },
];

export const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "g1",
    title: "Subject-Verb Agreement",
    category: "Syntax",
    description: "Singular subjects require singular verbs; plural subjects require plural verbs.",
    exampleCorrect: "The list of engineering topics is comprehensive.",
    exampleIncorrect: "The list of engineering topics are comprehensive.",
    tips: "Look at the actual noun head ('list'), not the prepositional modifier.",
  },
  {
    id: "g2",
    title: "Past Perfect vs. Simple Past",
    category: "Tenses",
    description: "Use Past Perfect for an action completed before another past event.",
    exampleCorrect: "I had completed the algorithm before the meeting started.",
    exampleIncorrect: "I completed the algorithm before the meeting had started.",
    tips: "Use 'had + past participle' for the earlier event.",
  },
];

export const SPEAKING_TOPICS: SpeakingTopic[] = [
  {
    id: "t1",
    title: "Technical Project Walkthrough",
    category: "Interview",
    description: "Explain an end-to-end software architecture or application you engineered recently.",
    suggestedDurationSeconds: 120,
    starterQuestions: [
      "What core problem did this project solve?",
      "What trade-offs did you face when choosing technologies?",
      "How did you measure project performance and stability?",
    ],
  },
  {
    id: "t2",
    title: "The Impact of Accessible Design",
    category: "Academic",
    description: "Discuss why inclusive computing and accessibility standards benefit every user.",
    suggestedDurationSeconds: 90,
    starterQuestions: [
      "What assistive technologies do you find most impactful?",
      "How can software developers avoid accessibility dark patterns?",
    ],
  },
];

export const REAL_LIFE_SCENARIOS: RealLifeScenario[] = [
  {
    id: "s1",
    title: "Technical Standup Presentation",
    setting: "Agile Engineering Team Meeting",
    role: "Fullstack Developer",
    aiRole: "Scrum Master",
    initialPrompt: "Good morning! Can you give us a quick 1-minute update on yesterday's PR and today's blockers?",
    suggestedResponses: [
      "Yesterday I optimized the database queries, reducing response times by 30%. Today I'm finishing the unit tests.",
      "I completed the authentication layer. No major blockers, but I need code review on the auth controller.",
    ],
  },
  {
    id: "s2",
    title: "Job Interview: Strengths & Weaknesses",
    setting: "HR Screening Call",
    role: "Software Engineering Candidate",
    aiRole: "Lead Technical Recruiter",
    initialPrompt: "Tell me about a technical challenge that didn't go as planned and what you learned from it.",
    suggestedResponses: [
      "During a recent deployment, we ran into race conditions. I learned how crucial atomic transactions are.",
      "I underestimated the complexity of the data migration, so I created automated rollback scripts.",
    ],
  },
];

export const SPEAKING_MODULES: SpeakingModule[] = [
  {
    id: "m1",
    title: "Foundations of Clear Articulation",
    level: "Beginner",
    duration: "45 mins",
    completed: true,
    lessonsCount: 6,
    icon: "🎯",
  },
  {
    id: "m2",
    title: "Technical Storytelling & Interviews",
    level: "Intermediate",
    duration: "1 hr 30 mins",
    completed: false,
    lessonsCount: 8,
    icon: "💼",
  },
  {
    id: "m3",
    title: "Debating & Persuasive Oratory",
    level: "Advanced",
    duration: "2 hrs",
    completed: false,
    lessonsCount: 10,
    icon: "🎙️",
  },
];