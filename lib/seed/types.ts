export type SeedMaterial = { title: string; url: string };

export type SeedLesson = {
  title: string;
  duration: number;
  content: string;
  exercise: string;
  materials?: SeedMaterial[];
  preview?: boolean;
};

export type SeedModule = { title: string; lessons: SeedLesson[] };

export type SeedCourse = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  skills: string[];
  premium: boolean;
  modules: SeedModule[];
};

/** Formato antigo (uma trilha = um curso), usado como fonte dos cursos reaproveitados. */
export type LegacyTrail = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  course: SeedCourse;
};

export type TrailAssistant = { name: string; focus: string; suggestions: string[] };

export type SeedTrail = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  assistant: TrailAssistant;
  courses: SeedCourse[];
};

export type SeedMission = {
  slug: string;
  trail: string;
  title: string;
  objective: string;
  steps: string[];
  tools: string[];
  checklist: string[];
  criteria: string[];
  minutes: number;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  xp: number;
  premium: boolean;
};

export type SeedTool = {
  name: string;
  category: string;
  description: string;
  useCase: string;
  difficulty: "Fácil" | "Médio" | "Avançado";
  pricing: "gratuito" | "freemium" | "pago";
  pricingNote: string;
  url: string;
  premium?: boolean;
};
