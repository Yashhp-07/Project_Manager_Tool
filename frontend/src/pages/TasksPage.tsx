import { useCallback, useEffect, useState } from 'react'
import type { Task, TaskFilters as TaskFiltersType, TaskUpdate } from '../types'
import { ApiClientError } from '../api/client'
import { listTasks, updateTask, exportTasksCsv } from '../api/tasks'
import Spinner from '../components/Spinner'
import TaskCard from '../components/TaskCard'
import TaskFilters from '../components/TaskFilters'

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFiltersType>({})
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchTasks = async (f: TaskFiltersType) => {
    setLoading(true)
    setError(null)
    try {
      const result = await listTasks(f)
      setTasks(result)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = useCallback(async (id: string, data: TaskUpdate) => {
    const updated = await updateTask(id, data)
    setTasks((prev) => prev?.map((t) => (t.id === id ? updated : t)) ?? null)
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportTasksCsv(filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tasks.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError('Failed to export tasks.')
      }
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    fetchTasks(filters)
  }, [filters])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Tasks</h1>
        <p className="mt-1 text-sm text-slate">
          View and filter all extracted tasks across meetings.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <TaskFilters filters={filters} onChange={setFilters} />
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-slate hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Spinner />
              Exporting...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Export CSV
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => fetchTasks(filters)}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && tasks && tasks.length === 0 && (
        <p className="py-12 text-center text-sm text-slate">
          No actionable tasks found in this transcript.
        </p>
      )}

      {!loading && !error && tasks && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  )
}
