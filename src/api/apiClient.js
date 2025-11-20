import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if(token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      // Handle authentication errors
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')

        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      // Handle forbidden errors
      if (status === 403) {
        console.error('Access forbidden:', data?.error || data?.message)
      }

      // Attach error message to error object
      error.message = data?.error || data?.message || error.message
      error.errorCode = data?.errorCode
      error.errors = data?.errors
    } else if (error.request) {
      // Request made but no response
      error.message = 'لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت.'
    } else {
      // Something else happened
      error.message = error.message || 'حدث خطأ غير متوقع'
    }

    return Promise.reject(error)
  }
)

export default api
