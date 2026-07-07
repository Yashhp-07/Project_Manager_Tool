import { useState } from 'react'
import type { Task, TaskUpdate } from '../types'
import { useViewRole } from '../context/ViewRoleContext'

interface TaskCardProps {
  task: Task
  onSave?: (id: string, data: TaskUpdate) => Promise<void>
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber/10 text-amber',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
}

const statusStyles: Record<string, string> = {
  done: 'bg-mint/10 text-mint',
  in_progress: 'bg-blue-100 text-blue-700',
  blocked: 'bg-red-100 text-red-700',
  todo: 'bg-gray-100 text-gray-600',
}

export default function TaskCard({ task, onSave }: TaskCardProps) {
  const missingOwners = task.owners.length === 0
  const missingDueDate = task.due_date === null
  const hasMissingFields = missingOwners || missingDueDate

  const [editing, setEditing] = useState(false)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editOwners, setEditOwners] = useState(task.owners.join(', '))
  const [editDueDate, setEditDueDate] = useState(
    task.due_date ? task.due_date.split('T')[0] : '',
  )
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editStatus, setEditStatus] = useState(task.status)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [togglingConfirmed, setTogglingConfirmed] = useState(false)
  const { role } = useViewRole()

  const enterEdit = () => {
    setEditDescription(task.description)
    setEditOwners(task.owners.join(', '))
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '')
    setEditPriority(task.priority)
    setEditStatus(task.status)
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(task.id, {
        description: editDescription || undefined,
        owners: editOwners
          ? editOwners.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        due_date: editDueDate ? editDueDate + 'T00:00:00' : null,
        priority: editPriority,
        status: editStatus,
      })
      setEditing(false)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save task.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
  }

  const handleToggleConfirmed = async () => {
    if (!onSave || togglingConfirmed) return
    setTogglingConfirmed(true)
    try {
      await onSave(task.id, { confirmed: !task.confirmed })
    } catch {
      // error is surfaced by onSave in the parent, ignore here
    } finally {
      setTogglingConfirmed(false)
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate">Description</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate">Owners (comma separated)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              value={editOwners}
              onChange={(e) => setEditOwners(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-slate">Due Date</label>
              <input
                type="date"
                className="mt-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate">Priority</label>
              <select
                className="mt-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
                disabled={saving}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate">Status</label>
              <select
                className="mt-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as Task['status'])}
                disabled={saving}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border bg-surface p-4 transition-opacity ${
        hasMissingFields
          ? 'border-l-4 border-l-red-400 border-border'
          : 'border border-border'
      } ${!task.confirmed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink">{task.description}</p>
        <div className="flex shrink-0 items-center gap-2">
          {onSave && role === 'pm' && (
            <button
              type="button"
              onClick={handleToggleConfirmed}
              disabled={togglingConfirmed}
              title={task.confirmed ? 'Mark as unconfirmed' : 'Mark as confirmed'}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                task.confirmed
                  ? 'border-mint bg-mint/10 text-mint hover:bg-mint/20'
                  : 'border-border text-slate hover:border-mint hover:text-mint'
              } ${togglingConfirmed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {togglingConfirmed ? '...' : task.confirmed ? 'Confirmed' : 'Unconfirmed'}
            </button>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>
          {onSave && role === 'pm' && (
            <button
              type="button"
              onClick={enterEdit}
              title="Edit task"
              className="text-slate hover:text-accent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate">
        {missingOwners ? (
          <span className="inline-flex items-center gap-1 text-red-500">
            <span>&#9888;</span> No owners
          </span>
        ) : (
          <span>Owners: {task.owners.join(', ')}</span>
        )}

        {missingDueDate ? (
          <span className="inline-flex items-center gap-1 text-red-500">
            <span>&#9888;</span> No due date
          </span>
        ) : (
          <span>Due: {new Date(task.due_date as string).toLocaleDateString()}</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs">
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${
            statusStyles[task.status]
          }`}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}
