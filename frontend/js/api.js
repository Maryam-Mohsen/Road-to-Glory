const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('rtg_token');
}

function setSession(token, user) {
  localStorage.setItem('rtg_token', token);
  localStorage.setItem('rtg_user', JSON.stringify(user));
}

function getUser() {
  const raw = localStorage.getItem('rtg_user');
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  localStorage.removeItem('rtg_token');
  localStorage.removeItem('rtg_user');
  window.location.href = 'index.html';
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}


function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
  return getUser();
}
