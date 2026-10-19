import "server-only";
import { all, get, parseJson } from "./db";

export type CourseCard = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  skills: string;
  is_premium: number;
  trail_slug: string | null;
  trail_title: string | null;
  lessons: number;
  done: number;
  minutes: number;
};

const COURSE_CARD_SQL = `
  SELECT c.id, c.slug, c.title, c.summary, c.skills, c.is_premium, t.slug AS trail_slug, t.title AS trail_title,
    COUNT(l.id) AS lessons, COUNT(lp.lesson_id) AS done, COALESCE(SUM(l.duration_min), 0) AS minutes
  FROM courses c
  LEFT JOIN trails t ON t.id = c.trail_id
  LEFT JOIN modules m ON m.course_id = c.id
  LEFT JOIN lessons l ON l.module_id = m.id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ? AND lp.completed_at IS NOT NULL
  WHERE c.published = 1`;

export function listCourses(userId: number): CourseCard[] {
  return all<CourseCard>(`${COURSE_CARD_SQL} GROUP BY c.id ORDER BY c.sort, c.id`, userId);
}

export type TrailRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level_label: string;
};

export function listTrails(userId: number) {
  const trails = all<TrailRow>("SELECT id, slug, title, subtitle, description, level_label FROM trails ORDER BY sort, id");
  const courses = listCourses(userId);
  const missions = all<{ trail_id: number; total: number; done: number }>(
    `SELECT m.trail_id, COUNT(m.id) AS total, COUNT(mp.mission_id) AS done FROM missions m
     LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = ? AND mp.status = 'concluida'
     WHERE m.published = 1 GROUP BY m.trail_id`,
    userId,
  );
  const modules = all<{ trail_id: number; title: string; course_id: number }>(
    `SELECT c.trail_id, m.title, m.course_id FROM modules m JOIN courses c ON c.id = m.course_id
     WHERE c.published = 1 ORDER BY c.sort, m.sort`,
  );
  return trails.map((t) => ({
    ...t,
    courses: courses.filter((c) => c.trail_slug === t.slug),
    modules: modules.filter((m) => m.trail_id === t.id).map((m) => m.title),
    missions: missions.find((m) => m.trail_id === t.id) ?? { total: 0, done: 0 },
  }));
}

export type LessonRow = {
  id: number;
  module_id: number;
  title: string;
  duration_min: number;
  is_free_preview: number;
  sort: number;
  completed: number;
};

export function getCourse(slug: string, userId: number) {
  const course = get<{
    id: number;
    slug: string;
    title: string;
    summary: string;
    description: string;
    skills: string;
    is_premium: number;
    trail_title: string | null;
    trail_slug: string | null;
  }>(
    `SELECT c.id, c.slug, c.title, c.summary, c.description, c.skills, c.is_premium, t.title AS trail_title, t.slug AS trail_slug
     FROM courses c LEFT JOIN trails t ON t.id = c.trail_id WHERE c.slug = ? AND c.published = 1`,
    slug,
  );
  if (!course) return null;
  const modules = all<{ id: number; title: string }>("SELECT id, title FROM modules WHERE course_id = ? ORDER BY sort, id", course.id);
  const lessons = all<LessonRow>(
    `SELECT l.id, l.module_id, l.title, l.duration_min, l.is_free_preview, l.sort,
       CASE WHEN lp.completed_at IS NOT NULL THEN 1 ELSE 0 END AS completed
     FROM lessons l JOIN modules m ON m.id = l.module_id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE m.course_id = ? ORDER BY m.sort, l.sort, l.id`,
    userId,
    course.id,
  );
  const missions = all<{ id: number; slug: string; title: string; is_premium: number; est_minutes: number }>(
    `SELECT m.id, m.slug, m.title, m.is_premium, m.est_minutes FROM missions m
     JOIN courses c ON c.trail_id = m.trail_id WHERE c.id = ? AND m.published = 1 ORDER BY m.sort`,
    course.id,
  );
  return { course, modules: modules.map((m) => ({ ...m, lessons: lessons.filter((l) => l.module_id === m.id) })), lessons, missions };
}

export type LessonDetail = {
  id: number;
  title: string;
  content: string;
  exercise: string;
  materials: string;
  video_url: string;
  duration_min: number;
  is_free_preview: number;
  module_title: string;
  course_id: number;
  course_slug: string;
  course_title: string;
  course_premium: number;
};

export function getLesson(id: number) {
  const lesson = get<LessonDetail>(
    `SELECT l.id, l.title, l.content, l.exercise, l.materials, l.video_url, l.duration_min, l.is_free_preview,
       m.title AS module_title, c.id AS course_id, c.slug AS course_slug, c.title AS course_title, c.is_premium AS course_premium
     FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
     WHERE l.id = ? AND c.published = 1`,
    id,
  );
  if (!lesson) return null;
  return { ...lesson, materialList: parseJson<{ title: string; url: string }[]>(lesson.materials, []) };
}

export type MissionRow = {
  id: number;
  slug: string;
  title: string;
  objective: string;
  steps: string;
  tools: string;
  checklist: string;
  criteria: string;
  est_minutes: number;
  difficulty: string;
  xp: number;
  is_premium: number;
  trail_title: string | null;
  trail_slug: string | null;
  status: string | null;
};

export function listMissions(userId: number) {
  return all<MissionRow>(
    `SELECT m.*, t.title AS trail_title, t.slug AS trail_slug, mp.status
     FROM missions m LEFT JOIN trails t ON t.id = m.trail_id
     LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = ?
     WHERE m.published = 1 ORDER BY t.sort, m.sort, m.id`,
    userId,
  );
}

export type MissionProgress = {
  status: "em_andamento" | "concluida";
  checklist: string;
  result_text: string;
  result_url: string;
  self_review: string;
  ai_feedback: string;
  started_at: string;
  completed_at: string | null;
};

export function getMission(slug: string, userId: number) {
  const m = get<MissionRow>(
    `SELECT m.*, t.title AS trail_title, t.slug AS trail_slug, mp.status
     FROM missions m LEFT JOIN trails t ON t.id = m.trail_id
     LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = ?
     WHERE m.slug = ? AND m.published = 1`,
    userId,
    slug,
  );
  if (!m) return null;
  const progress = get<MissionProgress>(
    "SELECT status, checklist, result_text, result_url, self_review, ai_feedback, started_at, completed_at FROM mission_progress WHERE user_id = ? AND mission_id = ?",
    userId,
    m.id,
  );
  return {
    mission: {
      ...m,
      stepList: parseJson<string[]>(m.steps, []),
      toolList: parseJson<string[]>(m.tools, []),
      checklistItems: parseJson<string[]>(m.checklist, []),
      criteriaList: parseJson<string[]>(m.criteria, []),
    },
    progress: progress
      ? {
          ...progress,
          checks: parseJson<boolean[]>(progress.checklist, []),
          review: parseJson<boolean[]>(progress.self_review, []),
        }
      : null,
  };
}

export type ToolRow = {
  id: number;
  name: string;
  category: string;
  description: string;
  use_case: string;
  difficulty: string;
  pricing: "gratuito" | "freemium" | "pago";
  pricing_note: string;
  url: string;
  is_premium: number;
};

export function listTools(): ToolRow[] {
  return all<ToolRow>("SELECT * FROM tools ORDER BY sort, name");
}

export function nextLesson(userId: number, courseId?: number | null) {
  return get<{ id: number; title: string; course_title: string; course_slug: string }>(
    `SELECT l.id, l.title, c.title AS course_title, c.slug AS course_slug
     FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ? AND lp.completed_at IS NOT NULL
     WHERE lp.lesson_id IS NULL AND c.published = 1 ${courseId ? "AND c.id = ?" : ""}
     ORDER BY c.sort, m.sort, l.sort LIMIT 1`,
    ...(courseId ? [userId, courseId] : [userId]),
  );
}

export function lessonNeighbors(lessonId: number, courseId: number) {
  const ids = all<{ id: number; title: string }>(
    `SELECT l.id, l.title FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? ORDER BY m.sort, l.sort, l.id`,
    courseId,
  );
  const idx = ids.findIndex((l) => l.id === lessonId);
  return { prev: idx > 0 ? ids[idx - 1] : null, next: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null, index: idx + 1, total: ids.length };
}
