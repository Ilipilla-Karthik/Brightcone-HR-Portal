import {
  Skill,
  SkillsMatrixResponse,
  EmployeeSkillRating,
  CompletionTrackerResponse,
  MyAssignment,
} from './types';

const SKILLS_KEY = 'brightcone_custom_skills';
const RATINGS_KEY = 'brightcone_skill_ratings';
const ASSIGNMENTS_KEY = 'brightcone_custom_assignments';

export interface CustomAssignment {
  id: string;
  course_id: string;
  course_title: string;
  training_type: 'Course' | 'Security';
  due_date?: string | null;
  employee_ids: string[];
  progress: number;
  status: 'Not started' | 'In progress' | 'Completed';
  category?: string;
  duration?: string;
  created_at: string;
}

export function getCustomSkills(): Skill[] {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomSkill(skill: Skill): void {
  try {
    const list = getCustomSkills();
    const filtered = list.filter(
      (s) => s.id !== skill.id && s.name.toLowerCase() !== skill.name.toLowerCase()
    );
    filtered.push(skill);
    localStorage.setItem(SKILLS_KEY, JSON.stringify(filtered));
  } catch {}
}

export function getStoredRatings(): Record<string, EmployeeSkillRating> {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredRating(
  empCode: string,
  skillId: string,
  skillName: string | undefined,
  rating: EmployeeSkillRating
): void {
  try {
    const ratings = getStoredRatings();
    ratings[`${empCode}:${skillId}`] = rating;
    if (skillName) {
      ratings[`${empCode}:${skillName}`] = rating;
      ratings[`${empCode}:${skillName.toLowerCase()}`] = rating;
    }
    ratings[`${empCode}:${skillId.toLowerCase()}`] = rating;
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch {}
}

export function mergeSkillsMatrix(matrix: SkillsMatrixResponse): SkillsMatrixResponse {
  const cloned: SkillsMatrixResponse = JSON.parse(JSON.stringify(matrix));
  const customSkills = getCustomSkills();
  const storedRatings = getStoredRatings();

  for (const cs of customSkills) {
    if (!cloned.skills.some((s) => s.id === cs.id || s.name.toLowerCase() === cs.name.toLowerCase())) {
      cloned.skills.push(cs);
    }
    if (cs.category && !cloned.categories.includes(cs.category)) {
      cloned.categories.push(cs.category);
    }
  }

  cloned.employees = cloned.employees.map((emp) => {
    const empSkills = { ...emp.skills };
    cloned.skills.forEach((s) => {
      const match =
        storedRatings[`${emp.employee_code}:${s.id}`] ||
        storedRatings[`${emp.employee_code}:${s.name}`] ||
        storedRatings[`${emp.employee_code}:${s.name.toLowerCase()}`] ||
        storedRatings[`${emp.employee_code}:${s.id.toLowerCase()}`];
      if (match) {
        empSkills[s.id] = match;
        empSkills[s.name] = match;
      }
    });
    return { ...emp, skills: empSkills };
  });

  return cloned;
}

export function getCustomAssignments(): CustomAssignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCustomAssignment(params: {
  course_id?: string;
  course_title: string;
  training_type?: 'Course' | 'Security';
  due_date?: string | null;
  employee_ids?: string[];
  category?: string;
  duration?: string;
}): CustomAssignment {
  const list = getCustomAssignments();
  const courseId = params.course_id || `course-${Date.now()}`;
  const empIds =
    !params.employee_ids || params.employee_ids.length === 0 || params.employee_ids.includes('Everyone')
      ? ['*']
      : params.employee_ids;

  const existingIndex = list.findIndex(
    (a) => a.course_id === courseId || a.course_title.toLowerCase() === params.course_title.toLowerCase()
  );

  const assignment: CustomAssignment = {
    id: existingIndex >= 0 ? list[existingIndex].id : `assign-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    course_id: courseId,
    course_title: params.course_title,
    training_type: params.training_type || 'Course',
    due_date: params.due_date || null,
    employee_ids: empIds,
    progress: existingIndex >= 0 ? list[existingIndex].progress : 0,
    status: existingIndex >= 0 ? list[existingIndex].status : 'Not started',
    category: params.category || 'General',
    duration: params.duration || '45 mins',
    created_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    list[existingIndex] = assignment;
  } else {
    list.unshift(assignment);
  }

  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
  } catch {}

  return assignment;
}

export function updateCustomAssignmentProgress(
  idOrCourseIdOrTitle: string,
  progress: number
): boolean {
  const list = getCustomAssignments();
  const lower = idOrCourseIdOrTitle.toLowerCase();
  const index = list.findIndex(
    (a) => a.id === idOrCourseIdOrTitle || a.course_id === idOrCourseIdOrTitle || a.course_title.toLowerCase() === lower
  );

  if (index < 0) return false;

  const clamped = Math.max(0, Math.min(100, progress));
  list[index].progress = clamped;
  list[index].status = clamped >= 100 ? 'Completed' : clamped > 0 ? 'In progress' : 'Not started';

  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
  } catch {}
  return true;
}

export function mergeCompletionTracker(base: CompletionTrackerResponse): CompletionTrackerResponse {
  const customAssignments = getCustomAssignments();
  if (customAssignments.length === 0) return base;

  const cloned: CompletionTrackerResponse = JSON.parse(JSON.stringify(base));

  cloned.records = cloned.records.map((emp) => {
    const applicable = customAssignments.filter(
      (a) => a.employee_ids.includes('*') || a.employee_ids.includes(emp.employee_id)
    );

    if (applicable.length === 0) return emp;

    const items = emp.items ? [...emp.items] : [];
    let addedCount = 0;
    let addedCompleted = 0;

    for (const a of applicable) {
      const existing = items.find(
        (it) => it.id === a.course_id || it.title.toLowerCase() === a.course_title.toLowerCase()
      );

      if (existing) {
        existing.progress = a.progress;
        existing.status = a.status;
      } else {
        items.unshift({
          id: a.course_id,
          title: a.course_title,
          training_type: a.training_type,
          due_date: a.due_date,
          progress: a.progress,
          is_assessment: false,
          status: a.status,
        });
        addedCount += 1;
        if (a.progress >= 100) addedCompleted += 1;
      }
    }

    const assignedCount = emp.assigned_count + addedCount;
    const completedCount = emp.completed_count + addedCompleted;
    const pendingCount = Math.max(0, assignedCount - completedCount);
    const progressPct = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;
    const status = progressPct === 100 ? 'Compliant' : progressPct > 0 ? 'In progress' : 'Not started';

    return {
      ...emp,
      assigned_count: assignedCount,
      completed_count: completedCount,
      pending_count: pendingCount,
      progress_pct: progressPct,
      status: status as any,
      items,
    };
  });

  cloned.fully_compliant_count = cloned.records.filter((r) => r.status === 'Compliant').length;
  cloned.in_progress_count = cloned.records.filter((r) => r.status === 'In progress').length;
  return cloned;
}

export function mergeMyLearning(baseAssignments: MyAssignment[], currentEmpCode?: string): MyAssignment[] {
  const customAssignments = getCustomAssignments();
  if (customAssignments.length === 0) return baseAssignments;

  const result = [...baseAssignments];

  for (const a of customAssignments) {
    const applies =
      a.employee_ids.includes('*') ||
      (currentEmpCode && a.employee_ids.includes(currentEmpCode)) ||
      a.employee_ids.length === 0;

    if (!applies) continue;

    const existingIndex = result.findIndex(
      (b) => b.course_id === a.course_id || b.course_title.toLowerCase() === a.course_title.toLowerCase()
    );

    if (existingIndex >= 0) {
      result[existingIndex].progress = a.progress;
      result[existingIndex].status = a.status;
    } else {
      result.unshift({
        assignment_id: a.id,
        course_id: a.course_id,
        course_title: a.course_title,
        course_type: a.training_type === 'Security' ? 'Mandatory' : 'Elective',
        duration: a.duration || '45 mins',
        due_date: a.due_date || null,
        progress: a.progress,
        status: a.status,
        is_overdue: false,
      });
    }
  }

  return result;
}
