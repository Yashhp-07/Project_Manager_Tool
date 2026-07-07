import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { MeetingSummary } from '../types'
import { listMeetings } from '../api/meetings'

interface MeetingSidebarProps {
  selectedMeetingId: string | null
  onSelectMeeting: (id: string | null) => void
  refreshKey?: number
}

export default function MeetingSidebar({
  selectedMeetingId,
  onSelectMeeting,
  refreshKey,
}: MeetingSidebarProps) {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    listMeetings()
      .then((data) => {
        if (!cancelled) setMeetings(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load meetings.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = meetings.filter((m) => {
    if (!search.trim()) return true
    return m.title.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <aside className="hidden md:flex flex-col h-screen p-md overflow-y-auto w-sidebar-width fixed left-0 top-0 border-r border-outline-variant bg-surface z-10 shrink-0">
      <div className="mb-xl">
        <h1 className="font-display text-display text-primary">Task Xtractor</h1>
        <p className="font-label-md text-label-md text-on-surface-variant">Task Intelligence</p>
      </div>

      <div className="mb-lg">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input 
            type="text"
            className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline" 
            placeholder="Search meetings..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <button 
        type="button"
        onClick={() => navigate('/meetings/new')}
        className="mb-lg w-full py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
      >
        + New Meeting
      </button>

      <nav className="flex-1 flex flex-col gap-sm">
        <button
          type="button"
          onClick={() => onSelectMeeting(null)}
          className={`flex items-center gap-sm px-3 py-2 rounded-lg transition-colors duration-150 text-left ${
            !selectedMeetingId && location.pathname === '/tasks'
              ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-low opacity-80'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined">assignment</span>
          <span className="font-label-md text-label-md">All Tasks</span>
        </button>

        {loading && (
          <div className="flex flex-col gap-2 mt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-surface-container-highest/50 rounded-lg animate-pulse w-full"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="mx-3 my-2 p-3 rounded-lg border border-error-container bg-[#fef2f2] flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="font-label-sm text-label-sm font-bold">Error</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface text-xs leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-outline">
            {search ? 'No matches.' : 'No meetings yet.'}
          </p>
        )}

        {!loading && !error && filtered.map((m) => {
          const isActive = selectedMeetingId === m.id && location.pathname === '/tasks'
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMeeting(m.id)}
              className={`flex items-center gap-sm px-3 py-2 rounded-lg transition-colors text-left ${
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-low opacity-80'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined">schedule</span>
              <span className="font-label-md text-label-md truncate block w-full">{m.title || 'Untitled meeting'}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
