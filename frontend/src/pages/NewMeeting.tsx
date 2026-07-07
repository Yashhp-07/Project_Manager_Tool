import { useState } from 'react'
import type { Meeting } from '../types'
import { ApiClientError } from '../api/client'
import { createMeeting } from '../api/meetings'
import Spinner from '../components/Spinner'
import TaskCard from '../components/TaskCard'

export default function NewMeeting() {
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
        transcript: transcript.trim(),
        meeting_date: meetingDate + 'T00:00:00',
      })
      setMeeting(result)
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
        <h1 className="font-display text-2xl font-semibold text-ink">
          New Meeting
        </h1>
        <p className="mt-1 text-sm text-slate">
          Paste a transcript below to extract tasks automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="transcript" className="block text-sm font-medium text-ink">
            Transcript
          </label>
          <textarea
            id="transcript"
            rows={12}
            className="mt-1 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder-slate focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Paste the meeting transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="meeting-date" className="block text-sm font-medium text-ink">
            Meeting Date
          </label>
          <input
            id="meeting-date"
            type="date"
            className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !transcript.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
          <h2 className="font-display text-xl font-semibold text-ink">
            {meeting.title || 'Extracted Tasks'}
          </h2>

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
