// Base URL for the future backend API. Empty in mock mode (Phase 2).
// Swap mock api/*.js bodies for `fetch(`${API_BASE}/...`)` when the backend lands (Phase 3).
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// axios instance for Phase 3 real API calls.
// In Phase 2 (demo/mock), each api/*.js function returns mock data and does not use this client.
// Phase 3: import client from './client' in each api file and use client.get/post instead of fetch.
import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const normalized = {
      status: err.response?.status ?? 0,
      message: err.response?.data?.message ?? err.message ?? 'Unknown error',
      data: err.response?.data ?? null,
    }
    return Promise.reject(normalized)
  },
)
