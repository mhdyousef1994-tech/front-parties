import api from './apiClient'

/**
 * Services APIs - إدارة الخدمات
 * Based on API_DOCUMENTATION_FRONTEND.md
 */

// قائمة الخدمات مع دعم الفلترة والتصفح
export const listServices = (params = {}) => {
  const { page = 1, limit = 10, category } = params
  return api.get('/admin/services', { 
    params: { page, limit, category } 
  }).then(r => ({
    services: r.data?.data || r.data?.services || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

// إضافة خدمة جديدة
export const addService = (payload) => {
  const body = {
    name: payload.name,
    category: payload.category, // catering, decoration, photography, entertainment, other
    basePrice: Number(payload.basePrice) || 0,
    description: payload.description || ''
  }
  return api.post('/admin/services', body).then(r => r.data)
}

// تحديث خدمة
export const updateService = (id, payload) => {
  const body = {
    name: payload.name,
    category: payload.category,
    basePrice: Number(payload.basePrice) || 0,
    description: payload.description,
    isActive: payload.isActive
  }
  return api.put(`/admin/services/${id}`, body).then(r => r.data)
}

// حذف خدمة
export const deleteService = (id) => {
  return api.delete(`/admin/services/${id}`).then(r => r.data)
}

// تفعيل/إلغاء تفعيل خدمة
export const toggleServiceStatus = (id, isActive) => {
  return api.patch(`/admin/services/${id}/status`, { isActive }).then(r => r.data)
}

// الحصول على تفاصيل خدمة
export const getService = (id) => {
  return api.get(`/admin/services/${id}`).then(r => r.data?.service || r.data)
}

// الحصول على فئات الخدمات
export const getServiceCategories = () => {
  return [
    { value: 'catering', label: 'الضيافة' },
    { value: 'decoration', label: 'الديكور' },
    { value: 'photography', label: 'التصوير' },
    { value: 'entertainment', label: 'الترفيه' },
    { value: 'music', label: 'الموسيقى' },
    { value: 'security', label: 'الأمان' },
    { value: 'cleaning', label: 'التنظيف' },
    { value: 'other', label: 'أخرى' }
  ]
}

