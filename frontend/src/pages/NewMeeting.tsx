import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { Meeting } from '../types'
import { ApiClientError } from '../api/client'
import { createMeeting } from '../api/meetings'
import Spinner from '../components/Spinner'
import TaskCard from '../components/TaskCard'

interface LayoutContext {
  selectedMeetingId: string | null
  onMeetingCreated: () => void
}

export default function NewMeeting() {
  const { onMeetingCreated } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [meetingDate, setMeetingDate] = useState(
    () => new Date().toISOString().split('T')[0],
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)

  const handleSubmit = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    setError(null)
    setMeeting(null)

    try {
      const result = await createMeeting({
        title: title.trim() || null,
        transcript: transcript.trim(),
        meeting_date: meetingDate + 'T00:00:00',
      })
      setMeeting(result)
      onMeetingCreated()
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">
          New Meeting
        </h1>
        <p className="text-[15px] font-normal text-on-surface-variant">
          Paste a transcript below to extract tasks automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-[14px] font-semibold text-on-surface mb-xs">
            Meeting Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full p-md rounded-lg border border-outline-variant dark:border-outline bg-surface dark:bg-surface-variant text-on-surface dark:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow font-body-md text-body-md placeholder:text-[14px] placeholder:font-normal placeholder:text-on-surface-variant"
            placeholder="e.g. Product Launch Sync (optional — we'll generate one if left blank)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="transcript" className="block text-[14px] font-semibold text-on-surface mb-xs">
            Transcript
          </label>
          <textarea
            id="transcript"
            rows={6}
            className="w-full p-md rounded-lg border border-outline-variant dark:border-outline bg-surface dark:bg-surface-variant text-on-surface dark:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow font-body-md text-body-md resize-none placeholder:text-[14px] placeholder:font-normal placeholder:text-on-surface-variant"
            placeholder="Paste your meeting transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="meeting-date" className="block text-[14px] font-semibold text-on-surface mb-xs">
            Meeting Date
          </label>
          <input
            id="meeting-date"
            type="date"
            className="w-full sm:w-auto p-md py-2 rounded-lg border border-outline-variant dark:border-outline bg-surface dark:bg-surface-variant text-on-surface dark:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow font-body-md text-body-md"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mt-lg p-md rounded-lg border border-error-container bg-error-container/20 flex flex-col sm:flex-row items-start sm:items-center gap-md">
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors flex items-center justify-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Retry
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !transcript.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-sm bg-primary hover:bg-primary-container text-on-primary py-3 px-xl rounded-lg font-label-md text-label-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner />
              Extracting tasks...
            </>
          ) : (
            'Extract Tasks'
          )}
        </button>
      </div>

      {meeting && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">
              {meeting.title || 'Extracted Tasks'}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="text-sm font-medium text-accent hover:underline"
            >
              View in task list →
            </button>
          </div>

          {meeting.tasks.length === 0 ? (
            <p className="text-sm text-slate">
              No tasks were extracted from this transcript.
            </p>
          ) : (
            <div className="space-y-3">
              {meeting.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
