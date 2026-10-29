export interface TrainingProgramme {
  id: string;
  prog: string;
  ttype: string;
  trainer?: string | null;
  mode?: string | null;
  start: string;
  end?: string | null;
  parts?: number | null;
  cost?: number | null;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'Cancelled';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PoshRecord {
  id: string;
  rtype: 'Committee member' | 'Training session';
  emp?: string | null;
  name: string;
  role?: string | null;
  date: string;
  valid?: string | null;
  parts?: number | null;
  status: 'Active' | 'Scheduled' | 'Completed' | 'Overdue';
  created_at?: string;
  updated_at?: string;
}

export interface SecurityTraining {
  id: string;
  course: string;
  emp: string;
  assigned: string;
  due?: string | null;
  done?: string | null;
  score?: number | null;
  status: 'Pending' | 'In progress' | 'Completed' | 'Overdue';
  course_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BulkAssignResponse {
  assigned: number;
  skipped: number;
  failed: number;
  message: string;
}

export interface EmployeeTrainingItem {
  id: string;
  title: string;
  training_type: 'Course' | 'Security';
  due_date?: string | null;
  completed_at?: string | null;
  progress: number;
  score?: number | null;
  is_assessment: boolean;
  status: string;
}

export interface CompletionTrackerRecord {
  employee_id: string;
  employee_name: string;
  department: string;
  assigned_count: number;
  completed_count: number;
  pending_count: number;
  overdue_count: number;
  progress_pct: number;
  status: 'Compliant' | 'In progress' | 'Not started' | 'Overdue' | 'Not assigned';
  items?: EmployeeTrainingItem[];
}

export interface CompletionTrackerResponse {
  total_employees: number;
  fully_compliant_count: number;
  in_progress_count: number;
  overdue_count: number;
  not_assigned_count?: number;
  overall_compliance_pct: number;
  records: CompletionTrackerRecord[];
}

export interface AssignCoursePayload {
  audience?: string;
  employee_ids?: string[];
  due_date?: string;
}

export interface AssignCourseResponse {
  assigned: number;
  skipped: number;
  failed: number;
  message: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  course_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string | null;
  description?: string | null;
  color?: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string | null;
}

export interface CreateSkillPayload {
  name: string;
  category: string;
  description?: string | null;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface EmployeeSkillRating {
  level: SkillLevel;
  verified: boolean;
  verified_by?: string | null;
  updated_at: string;
}

export interface MatrixEmployeeRow {
  employee_code: string;
  full_name: string;
  department: string;
  role: string;
  skills: Record<string, EmployeeSkillRating>;
}

export interface SkillsMatrixResponse {
  skills: Skill[];
  employees: MatrixEmployeeRow[];
  categories: string[];
  levels: string[];
}

export interface RateSkillPayload {
  employee_id: string;
  skill_id: string;
  level: SkillLevel;
  verified?: boolean;
}

export interface CompletionRecord {
  id: string;
  course_id: string;
  course_title: string;
  course_type: string;
  category_name?: string | null;
  duration: string;
  completed_at?: string | null;
  is_assessment: boolean;
  score?: number | null;
  record_type: 'hr_recorded' | 'assessment_verified' | 'self_reported';
  employee_name: string;
  employee_id: string;
}

export interface SkillRecommendation {
  id: string;
  course_id: string;
  title: string;
  course_type: string;
  duration: string;
  category?: string | null;
  due_date?: string | null;
  rule_type: 'mandatory_compliance' | 'department_skill' | 'proficiency_growth';
  reason: string;
  skill_name?: string | null;
}

export interface RecommendationsResponse {
  recommendations: SkillRecommendation[];
  employee_department: string;
  employee_name: string;
  total_skills_mastered: number;
}
