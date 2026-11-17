const BASE_URL = '/api';

const fetchApi = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  
  return res.json();
};

export const api = {
  auth: {
    getMe: () => fetchApi('/auth/me'),
    logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  },
  emails: {
    list: (params = {}) => {
      // Filter out empty params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
      );
      const qs = new URLSearchParams(cleanParams).toString();
      return fetchApi(`/emails${qs ? `?${qs}` : ''}`);
    },
    get: (id) => fetchApi(`/emails/${id}`),
    send: (id, data) => fetchApi(`/emails/${id}/send`, { method: 'POST', body: JSON.stringify(data) }),
  },
  ai: {
    analyze: (id) => fetchApi(`/ai/analyze/${id}`, { method: 'POST' }),
    generateReply: (id, tone) => fetchApi(`/ai/generate-reply/${id}`, { method: 'POST', body: JSON.stringify({ tone }) }),
  },
  calendar: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return fetchApi(`/calendar/events${qs ? `?${qs}` : ''}`);
    },
    create: (data) => fetchApi('/calendar/events', { method: 'POST', body: JSON.stringify(data) }),
  },
};
