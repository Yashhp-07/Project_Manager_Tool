import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Task, TaskUpdate } from '../types'
import { ApiClientError } from '../api/client'
import { useViewRole } from '../context/ViewRoleContext'

interface TaskCardProps {
  task: Task
  onSave?: (id: string, data: TaskUpdate) => Promise<void>
}

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
  IN_PROGRESS: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
  NOT_STARTED: 'bg-surface-variant text-on-surface-variant border-outline-variant',
}

const statusLabels: Record<string, string> = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
}

const priorityLabels: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const priorityStyles: Record<string, string> = {
  HIGH: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
  MEDIUM: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]',
  LOW: 'bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]',
}

export default function TaskCard({ task, onSave }: TaskCardProps) {
  const { role } = useViewRole()
  const readOnly = role === 'owner'
  
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editDetails, setEditDetails] = useState('')
  const [editOwners, setEditOwners] = useState<string[]>(task.owners)
  const [newOwnerInput, setNewOwnerInput] = useState('')
  const [editDueDate, setEditDueDate] = useState(
    task.due_date ? task.due_date.split('T')[0] : '',
  )
  const [editPriority, setEditPriority] = useState<Task['priority']>(task.priority)
  const [editStatus, setEditStatus] = useState<Task['status']>(task.status)
  const [error, setError] = useState<string | null>(null)

  const handleSaveEdit = async () => {
    if (!onSave) return
    setSaving(true)
    setError(null)
    try {
      await onSave(task.id, {
        description: editDescription || undefined,
        owners: editOwners,
        due_date: editDueDate ? editDueDate + 'T00:00:00Z' : null,
        priority: editPriority,
        status: editStatus,
      })
      setEditing(false)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.detail)
      } else {
        setError('Failed to save changes.')
      }
    } finally {
      setSaving(false)
    }
  }

  const addOwner = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newOwnerInput.trim()) {
      e.preventDefault()
      if (!editOwners.includes(newOwnerInput.trim())) {
        setEditOwners([...editOwners, newOwnerInput.trim()])
      }
      setNewOwnerInput('')
    }
  }

  const removeOwner = (ownerToRemove: string) => {
    setEditOwners(editOwners.filter((o) => o !== ownerToRemove))
  }

  const isDone = task.status === 'COMPLETED'
  const missingInfo = task.owners.length === 0 || !task.due_date
  
  if (editing && !readOnly) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(0,0,0,0.1),_0_1px_2px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all duration-300 transform">
        <div className="p-lg lg:p-xl flex flex-col gap-lg">
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md border-b border-outline-variant pb-md">
            <div className="flex-1">
              <textarea 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={saving}
                rows={2}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary font-title-md text-title-md text-on-surface font-semibold placeholder:text-outline-variant resize-none" 
                placeholder="Task Title" 
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Task['status'])}
                  disabled={saving}
                  className="appearance-none bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] py-1.5 pl-3 pr-8 rounded-full font-label-sm text-label-sm focus:outline-none focus:ring-2 focus:ring-[#0369a1] font-bold cursor-pointer transition-colors"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#0369a1] pointer-events-none text-[16px]">arrow_drop_down</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-xl gap-y-lg">
            <div className="flex flex-col gap-lg md:col-span-1">
              <div className="flex flex-col gap-sm">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">description</span>
                  Description (Optional details)
                </label>
                <textarea 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y placeholder:text-[14px] placeholder:font-normal placeholder:text-on-surface-variant" 
                  placeholder="Additional task details..." 
                  rows={4}
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-sm">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">flag</span>
                  Priority
                </label>
                <div className="flex bg-surface-container rounded-lg p-1 relative">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                    const isSelected = editPriority === p;
                    return (
                      <label key={p} className="flex-1 text-center cursor-pointer relative z-10">
                        <input 
                          type="radio" 
                          name="priority" 
                          value={p} 
                          checked={isSelected} 
                          onChange={() => setEditPriority(p as Task['priority'])} 
                          disabled={saving} 
                          className="peer sr-only" 
                        />
                        {isSelected && (
                          <motion.div
                            layoutId="priority-bg"
                            className="absolute inset-0 bg-surface-container-lowest shadow-sm rounded-md -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className={`py-1.5 rounded-md font-label-md text-label-md transition-colors ${isSelected ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                          {p.charAt(0) + p.slice(1).toLowerCase()}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-lg md:col-span-1">
              <div className="flex flex-col gap-sm">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">group</span>
                  Owners
                </label>
                <div className="flex flex-wrap gap-2 p-2 border border-outline-variant rounded-lg bg-surface-container-lowest min-h-[42px] items-center focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                  {editOwners.map((owner) => (
                    <div key={owner} className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full border border-outline-variant">
                      <span className="font-label-sm text-label-sm text-on-surface">{owner}</span>
                      <button type="button" onClick={() => removeOwner(owner)} disabled={saving} className="text-on-surface-variant hover:text-error transition-colors flex items-center">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  
                  {/* Unassigned pill removed to clean up UI as requested */}
                  <input 
                    type="text" 
                    value={newOwnerInput}
                    onChange={(e) => setNewOwnerInput(e.target.value)}
                    onKeyDown={addOwner}
                    disabled={saving}
                    className="flex-1 min-w-[100px] border-none bg-transparent p-0 focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline" 
                    placeholder="Add owner (press Enter)..." 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-sm">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">calendar_today</span>
                  Due Date
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    disabled={saving}
                    className="w-[160px] bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex items-center justify-end gap-md mt-sm pt-lg border-t border-outline-variant">
            <button 
              type="button"
              onClick={() => {
                setEditDescription(task.description)
                setEditOwners(task.owners)
                setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '')
                setEditPriority(task.priority)
                setEditStatus(task.status)
                setNewOwnerInput('')
                setEditing(false)
              }}
              disabled={saving}
              className="px-5 py-2 rounded-lg font-label-md text-label-md text-primary bg-transparent hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-5 py-2 rounded-lg font-label-md text-label-md bg-primary text-white hover:bg-primary-container hover:text-on-primary-container shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className={`bg-surface-container-lowest flex flex-col min-h-[160px] rounded-lg border border-outline-variant overflow-hidden transition-all duration-200 ${readOnly ? '' : 'soft-shadow hover:shadow-md task-card-hover group'}`}>
      <div className="p-md flex flex-col flex-1">
        <div className="flex justify-between items-start mb-sm">
          <div className="flex gap-2 items-center">
          </div>
          
          {!readOnly && onSave && (
            <button 
              onClick={() => setEditing(true)}
              className="edit-icon opacity-0 text-outline hover:text-primary transition-opacity duration-200"
              title="Edit Task"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          )}
        </div>
        
        <h3 className={`font-body-md text-body-md font-medium text-on-surface mb-2 mt-xs truncate ${isDone ? 'line-through opacity-70' : ''}`}>
          {task.description}
        </h3>
        
        {missingInfo && (
          <div className="mb-md flex items-center gap-1 text-[#d97706] bg-[#fef3c7] px-2 py-1 rounded inline-flex border border-[#fde68a] w-fit">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span className="font-label-sm text-label-sm">
              {task.owners.length === 0 && !task.due_date 
                ? 'No owner or due date'
                : task.owners.length === 0 
                  ? 'No owner assigned' 
                  : 'No due date'}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-sm border-t border-surface-variant border-opacity-50">
          <div className="flex items-center gap-xs">
            {task.owners.length > 0 ? (
              <span className="font-label-sm text-label-sm text-on-surface truncate max-w-[180px]" title={task.owners.join(', ')}>
                {task.owners.join(', ')}
              </span>
            ) : (
              <span className="font-label-sm text-label-sm text-on-surface-variant italic">Unassigned</span>
            )}
            
            {task.due_date && (
               <span className="font-label-sm text-label-sm text-on-surface-variant ml-2">Due {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <div className={`px-2 py-0.5 rounded font-label-sm text-label-sm border ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </div>
            <div className={`px-2 py-0.5 rounded font-label-sm text-label-sm border ${statusStyles[task.status]}`}>
              {statusLabels[task.status]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
