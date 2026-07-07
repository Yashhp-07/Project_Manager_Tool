import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { Task, TaskFilters as TaskFiltersType, TaskUpdate, Meeting } from '../types'
import { useViewRole } from '../context/ViewRoleContext'
import { ApiClientError } from '../api/client'
import { listTasks, updateTask, exportTasksCsv } from '../api/tasks'
import { getMeeting } from '../api/meetings'
import Spinner from '../components/Spinner'
import TaskCard from '../components/TaskCard'
import TaskFilters from '../components/TaskFilters'

interface LayoutContext {
  selectedMeetingId: string | null
  onMeetingCreated: () => void
}

export default function TasksPage() {
  const { selectedMeetingId } = useOutletContext<LayoutContext>()
  const { role, setRole } = useViewRole()
  const [filters, setFilters] = useState<TaskFiltersType>({})
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  const effectiveFilters: TaskFiltersType = {
    ...filters,
    ...(selectedMeetingId ? { meeting_id: selectedMeetingId } : {}),
  }

  const fetchTasksAndMeeting = async (f: TaskFiltersType, mId: string | null) => {
    setLoading(true)
    setError(null)
    try {
      if (mId) {
        const m = await getMeeting(mId)
        setMeeting(m)
        setTranscriptOpen(false)
      } else {
        setMeeting(null)
      }
      
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

  const handleSaveWithError = useCallback(async (id: string, data: TaskUpdate) => {
    try {
      await handleSave(id, data)
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err
      }
      throw new ApiClientError(500, 'Failed to save task.')
    }
  }, [handleSave])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportTasksCsv(effectiveFilters)
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
    fetchTasksAndMeeting(effectiveFilters, selectedMeetingId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedMeetingId])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const hasActiveFilters = !!(filters.owner || filters.status || filters.priority)

  return (
    <>
      <header className="mb-xl flex flex-col xl:flex-row xl:items-end justify-between gap-md border-b border-outline-variant pb-md">
        <div className="min-w-0 flex-1 pr-4">
          {meeting ? (
            <>
              <div className="flex items-center gap-sm mb-xs">
                <span className="material-symbols-outlined text-outline">calendar_month</span>
                <span className="text-[15px] font-normal text-on-surface-variant">Meeting on {formatDate(meeting.meeting_date)}</span>
                <button
                  type="button"
                  onClick={() => setTranscriptOpen(!transcriptOpen)}
                  className="ml-auto sm:ml-4 px-3 py-1 bg-surface-container-highest rounded-full font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  {transcriptOpen ? 'Hide' : 'View'} Transcript
                </button>
              </div>
              <h2 className="text-3xl font-bold text-on-surface break-words" title={meeting.title || 'Untitled Meeting'}>
                {meeting.title || 'Untitled Meeting'}
              </h2>
              {transcriptOpen && (
                <div className="mt-md p-md bg-surface-container-low rounded-lg border border-outline-variant max-h-[300px] overflow-y-auto">
                  <pre className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap">
                    {meeting.transcript}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-sm mb-xs">
                <span className="material-symbols-outlined text-outline">assignment</span>
                <span className="text-[15px] font-normal text-on-surface-variant">Global View</span>
              </div>
              <h2 className="text-3xl font-bold text-on-surface">All Tasks</h2>
            </>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <TaskFilters filters={filters} onChange={setFilters} />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'pm' | 'owner')}
              className="px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-full font-label-md text-label-md text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="pm">Project Manager</option>
              <option value="owner">Task Owner</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            title="Export CSV"
          >
            {exporting ? <Spinner /> : <span className="material-symbols-outlined text-[18px]">download</span>}
          </button>
        </div>
      </header>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md lg:gap-lg">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-lg border border-outline-variant h-[150px] p-md pl-lg flex flex-col gap-sm animate-pulse relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-variant"></div>
              <div className="h-4 bg-surface-variant/60 rounded w-1/4 mb-2"></div>
              <div className="h-5 bg-surface-variant/60 rounded w-3/4"></div>
              <div className="h-5 bg-surface-variant/60 rounded w-1/2"></div>
              <div className="mt-auto flex justify-between items-center pt-3 border-t border-surface-variant/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-variant/60"></div>
                  <div className="w-16 h-4 rounded bg-surface-variant/60"></div>
                </div>
                <div className="w-20 h-5 rounded bg-surface-variant/60"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-lg p-md rounded-lg border border-[#fecaca] bg-[#fef2f2] flex flex-col sm:flex-row items-start sm:items-center gap-md shadow-sm">
          <div className="flex-shrink-0 text-error">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div className="flex-1">
            <p className="font-body-md text-body-md text-on-surface">
              {error}
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => fetchTasksAndMeeting(effectiveFilters, selectedMeetingId)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#fca5a5] text-on-surface hover:bg-[#fee2e2] font-label-md text-label-md transition-colors flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && tasks && tasks.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-12 mb-12">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-lg border border-outline-variant border-dashed">
            <span className="material-symbols-outlined text-[48px] text-outline opacity-60 font-light">inbox</span>
          </div>
          <h2 className="font-display text-display text-on-surface mb-sm">No tasks found</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-xl">
            {hasActiveFilters
              ? "No tasks match the current filters. Try adjusting your filters."
              : "No tasks found across your meetings. Create a meeting to extract tasks."}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-md opacity-50 cursor-not-allowed">
            <button className="px-lg py-sm bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md shadow-sm flex items-center gap-sm pointer-events-none" disabled title="Not implemented">
              <span className="material-symbols-outlined text-[18px]">description</span>
              View Transcript
            </button>
            <button className="px-lg py-sm text-primary font-label-md text-label-md rounded-lg flex items-center gap-sm pointer-events-none" disabled title="Not implemented">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              Add Manual Task
            </button>
          </div>
        </div>
      )}

      {!loading && !error && tasks && tasks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSave={handleSaveWithError} />
          ))}
        </div>
      )}
    </>
  )
}
