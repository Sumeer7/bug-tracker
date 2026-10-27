import type { ActivityItem, Comment, Issue, Project, User, UserSettings } from '../types';

const TOKEN_KEY = 'pulse_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { error?: string }).error || res.statusText;
    const code = (err as { code?: string }).code;
    const e = new Error(message) as Error & { code?: string };
    e.code = code;
    throw e;
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => request<User>('/api/auth/me'),
  updateProfile: (body: { name?: string; avatarColor?: string }) =>
    request<User>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  updateSettings: (body: Partial<UserSettings>) =>
    request<User>('/api/auth/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  createUser: (body: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'member' | 'viewer';
    avatarColor?: string;
  }) =>
    request<User>('/api/auth/users', { method: 'POST', body: JSON.stringify(body) }),

  getUsers: () => request<User[]>('/api/users'),
  getProjects: () => request<Project[]>('/api/projects'),
  getIssues: (params: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request<Issue[]>(`/api/issues?${q}`);
  },
  getIssue: (id: string) => request<Issue>(`/api/issues/${id}`),
  createIssue: (body: Record<string, unknown>) =>
    request<Issue>('/api/issues', { method: 'POST', body: JSON.stringify(body) }),
  updateIssue: (id: string, body: Record<string, unknown>) =>
    request<Issue>(`/api/issues/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getActivity: (issueId: string) => request<ActivityItem[]>(`/api/issues/${issueId}/activity`),
  getComments: (issueId: string) => request<Comment[]>(`/api/issues/${issueId}/comments`),
  addComment: (issueId: string, body: { body: string }) =>
    request<Comment>(`/api/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
