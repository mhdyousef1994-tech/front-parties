/**
 * Utility functions for data formatting and manipulation
 */

// Date formatting
export function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('ar-SY', { timeZone: 'Asia/Damascus' })
  } catch {
    return d
  }
}

export function formatDateTime(d) {
  try {
    return new Date(d).toLocaleString('ar-SY', {
      timeZone: 'Asia/Damascus',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return d
  }
}

// Number formatting
export function formatCurrency(amount, currency = 'SYP') {
  try {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

export function formatNumber(num) {
  try {
    return new Intl.NumberFormat('ar-SY').format(num)
  } catch {
    return num
  }
}

// String utilities
export function truncate(str, maxLength = 50) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Phone number formatting
export function formatPhone(phone) {
  if (!phone) return ''
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  // Format as Syrian phone number
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

// Status translation
export function getStatusLabel(status) {
  const statusMap = {
    'pending': 'قيد الانتظار',
    'confirmed': 'مؤكد',
    'in_progress': 'جاري',
    'completed': 'مكتمل',
    'cancelled': 'ملغي',
    'active': 'نشط',
    'inactive': 'غير نشط',
    'sent': 'مرسل',
    'delivered': 'تم التسليم',
    'opened': 'تم الفتح',
    'attended': 'حضر',
    'paid': 'مدفوع',
    'unpaid': 'غير مدفوع',
    'overdue': 'متأخر',
    'draft': 'مسودة',
    'viewed': 'تم الاطلاع'
  }
  return statusMap[status] || status
}

// Event type translation
export function getEventTypeLabel(type) {
  const typeMap = {
    'wedding': 'زفاف',
    'engagement': 'خطوبة',
    'birthday': 'عيد ميلاد',
    'graduation': 'تخرج',
    'anniversary': 'ذكرى سنوية',
    'conference': 'مؤتمر',
    'corporate': 'شركات',
    'other': 'أخرى'
  }
  return typeMap[type] || type
}

// Color utilities for status
export function getStatusColor(status) {
  const colorMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-green-100 text-green-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'attended': 'bg-green-100 text-green-800',
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800',
    'overdue': 'bg-red-100 text-red-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

// Validation utilities
export function isValidPhone(phone) {
  if (!phone) return false
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 && cleaned.startsWith('09')
}

export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Array utilities
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

// Local storage utilities
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
