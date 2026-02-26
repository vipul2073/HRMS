import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#e8e8f0',
            border: '1px solid #2a2a4a',
            borderRadius: '10px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#1a1a2e' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)

// const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// async function request(path, options = {}) {
//   const url = `${BASE_URL}${path}`
//   const res = await fetch(url, {
//     headers: { 'Content-Type': 'application/json', ...options.headers },
//     ...options,
//   })
//   const data = await res.json()
//   if (!res.ok) {
//     throw new Error(data.error || `Request failed: ${res.status}`)
//   }
//   return data
// }

// // ─── Employees ────────────────────────────────────────────────────────────────
// export const employeeApi = {
//   getAll: () => request('/employees'),
//   getById: (id) => request(`/employees/${id}`),
//   create: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
//   delete: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
// }

// // ─── Attendance ───────────────────────────────────────────────────────────────
// export const attendanceApi = {
//   getAll: (params = {}) => {
//     const qs = new URLSearchParams(params).toString()
//     return request(`/attendance${qs ? '?' + qs : ''}`)
//   },
//   mark: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
//   delete: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
// }

// // ─── Dashboard ────────────────────────────────────────────────────────────────
// export const dashboardApi = {
//   getSummary: () => request('/dashboard'),
// }

// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import './index.css';
// // import App from './App';
// // import reportWebVitals from './reportWebVitals';

// // const root = ReactDOM.createRoot(document.getElementById('root'));
// // root.render(
// //   <React.StrictMode>
// //     <App />
// //   </React.StrictMode>
// // );

// // // If you want to start measuring performance in your app, pass a function
// // // to log results (for example: reportWebVitals(console.log))
// // // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// // reportWebVitals();
