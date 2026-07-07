const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const REQUEST_TIMEOUT = 30_000

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
    let detail = 'Request failed'
    let raw_output: string | undefined | null

    try {
      const body = await response.json()
      if (body?.detail) {
        if (typeof body.detail === 'string') {
          const lowerDetail = body.detail.toLowerCase()
          if (lowerDetail.includes('sqlalchemy') || lowerDetail.includes('asyncpg') || lowerDetail.includes('integrityerror') || lowerDetail.includes('traceback')) {
            detail = 'An unexpected error occurred on the server. Please check your inputs and try again.'
          } else {
            detail = body.detail
          }
        } else if (Array.isArray(body.detail)) {
          detail = body.detail.map((err: any) => `${err.loc?.slice(-1)[0] || 'Field'}: ${err.msg}`).join(', ')
        } else {
          detail = String(body.detail)
        }
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

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    return response
  } finally {
    clearTimeout(id)
  }
}

export async function get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`
  const response = await fetchWithTimeout(url)
  return handleResponse<T>(response)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`
  const response = await fetchWithTimeout(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function getBlob(path: string, params?: Record<string, string | undefined>): Promise<Blob> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`
  const response = await fetchWithTimeout(url)
  if (!response.ok) {
    return handleResponse(response)
  }
  return response.blob()
}
