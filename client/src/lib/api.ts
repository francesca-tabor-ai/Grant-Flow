export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('grantflow_token') : null;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}
