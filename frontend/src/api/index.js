const BASE_URL = process.env.REACT_APP_API_URL || '/api'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return data
}

// ── Employees ──────────────────────────────────────────────
export const employeeApi = {
  getAll: () => request('/employees'),
  getById: (id) => request(`/employees/${id}`),
  create: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
}

// ── Attendance ─────────────────────────────────────────────
export const attendanceApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/attendance${qs ? '?' + qs : ''}`)
  },
  mark: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
}

// ── Dashboard ──────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => request('/dashboard'),
}