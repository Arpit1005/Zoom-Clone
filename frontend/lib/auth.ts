import type { UserOut } from './api'

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
export const AUTH_TOKEN_KEY = 'zoom-auth-token'

type AuthResponse = { access_token: string; token_type: string; user: UserOut }

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}/api/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const result = (await response.json()) as { detail?: string }
      if (result.detail) detail = result.detail
    } catch {
      // Keep the status message for non-JSON failures.
    }
    throw new Error(detail)
  }
  return response.json() as Promise<T>
}

function storeAuth(response: AuthResponse) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, response.access_token)
  return response.user
}

export async function login(email: string, password: string) {
  return storeAuth(await authRequest<AuthResponse>('/login', { email, password }))
}

export async function register(name: string, email: string, password: string) {
  return storeAuth(await authRequest<AuthResponse>('/register', { name, email, password }))
}

export function clearAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}