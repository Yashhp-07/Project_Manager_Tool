import type { Task, TaskFilters, TaskUpdate } from '../types'
import { get, patch, getBlob } from './client'

export async function listTasks(filters?: TaskFilters): Promise<Task[]> {
  return get<Task[]>('/tasks', filters as Record<string, string | undefined>)
}

export async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
  return patch<Task>(`/tasks/${id}`, data)
}

export async function exportTasksCsv(filters?: TaskFilters): Promise<Blob> {
  return getBlob('/tasks/export', filters as Record<string, string | undefined>)
}
