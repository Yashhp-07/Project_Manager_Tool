/* ── Enums ── */

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export type UserRole = 'admin' | 'manager' | 'member'

/* ── Domain types (mirror backend schemas) ── */

export interface Task {
  id: string
  meeting_id: string
  description: string
  owners: string[]
  owner_user_id: string | null
  due_date: string | null
  priority: Priority
  status: TaskStatus
  confirmed: boolean
  evidence_quote: string | null
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  title: string
  transcript: string
  meeting_date: string
  created_at: string
  tasks: Task[]
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

/* ── Request payloads ── */

export interface MeetingCreate {
  title?: string | null
  transcript: string
  meeting_date: string
}

export interface TaskUpdate {
  description?: string | null
  owners?: string[] | null
  owner_user_id?: string | null
  due_date?: string | null
  priority?: Priority | null
  status?: TaskStatus | null
  confirmed?: boolean | null
}

/* ── Query params ── */

export interface TaskFilters {
  owner?: string
  status?: string
  priority?: string
}

/* ── API error ── */

export interface ApiError {
  detail: string
  raw_output?: string | null
}
