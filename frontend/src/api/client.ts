const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export class ApiClientError extends Error {
  status: number
  detail: string
  raw_output?: string | null

  constructor(status: number, detail: string, raw_output?: string | null) {
    super(detail)
    this.name = 'ApiClientError'
    this.status = status
    this.detail = detail
    this.raw_output = raw_output
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    let raw_output: string | undefined | null

    try {
      const body = await response.json()
      if (body?.detail) {
        detail = body.detail
      }
      raw_output = body?.raw_output
    } catch {
      // response body isn't JSON — use the fallback message
    }

    throw new ApiClientError(response.status, detail, raw_output)
  }

  // For responses that may not be JSON (e.g. CSV blob)
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }

  return response as unknown as Promise<T>
}

function buildQuery(params?: Record<string, string | undefined>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== '',
  )
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries as [string, string][]).toString()
}

export async function get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`
  const response = await fetch(url)
  return handleResponse<T>(response)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function getBlob(path: string, params?: Record<string, string | undefined>): Promise<Blob> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`
  const response = await fetch(url)
  if (!response.ok) {
    await handleResponse(response)
  }
  return response.blob()
}
