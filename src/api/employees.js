import api from './apiClient'

/**
 * Employees APIs - إدارة الموظفين
 * Based on API_DOCUMENTATION_FRONTEND.md
 */

// قائمة الموظفين مع دعم الفلترة والتصفح
export const listEmployees = (params = {}) => {
  const { page = 1, limit = 10, hallId, department, isActive } = params
  return api.get('/api/employees', { 
    params: { page, limit, hallId, department, isActive } 
  }).then(r => ({
    employees: r.data?.data || r.data?.employees || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

// الحصول على تفاصيل موظف
export const getEmployee = (id) => {
  return api.get(`/api/employees/${id}`).then(r => r.data?.employee || r.data)
}

// إضافة موظف جديد
export const addEmployee = (payload) => {
  const body = {
    name: payload.name,
    position: payload.position,
    department: payload.department,
    phone: payload.phone,
    email: payload.email,
    salary: Number(payload.salary) || 0,
    hireDate: payload.hireDate,
    hallId: payload.hallId
  }
  return api.post('/api/employees', body).then(r => r.data)
}

// تحديث موظف
export const updateEmployee = (id, payload) => {
  const body = {
    name: payload.name,
    position: payload.position,
    department: payload.department,
    phone: payload.phone,
    email: payload.email,
    salary: Number(payload.salary) || 0,
    isActive: payload.isActive
  }
  return api.put(`/api/employees/${id}`, body).then(r => r.data)
}

// حذف موظف
export const deleteEmployee = (id) => {
  return api.delete(`/api/employees/${id}`).then(r => r.data)
}

// تفعيل/إلغاء تفعيل موظف
export const toggleEmployeeStatus = (id, isActive) => {
  return api.patch(`/api/employees/${id}/status`, { isActive }).then(r => r.data)
}

// الحصول على إحصائيات الموظفين
export const getEmployeeStats = (hallId) => {
  return api.get('/api/employees/stats', { 
    params: { hallId } 
  }).then(r => r.data)
}

// الحصول على قائمة الأقسام
export const getDepartments = () => {
  return [
    { value: 'management', label: 'الإدارة' },
    { value: 'service', label: 'الخدمة' },
    { value: 'kitchen', label: 'المطبخ' },
    { value: 'security', label: 'الأمن' },
    { value: 'cleaning', label: 'النظافة' },
    { value: 'technical', label: 'الفني' },
    { value: 'other', label: 'أخرى' }
  ]
}

// الحصول على قائمة المناصب
export const getPositions = () => {
  return [
    { value: 'manager', label: 'مدير' },
    { value: 'supervisor', label: 'مشرف' },
    { value: 'waiter', label: 'نادل' },
    { value: 'chef', label: 'طباخ' },
    { value: 'security_guard', label: 'حارس أمن' },
    { value: 'cleaner', label: 'عامل نظافة' },
    { value: 'technician', label: 'فني' },
    { value: 'receptionist', label: 'موظف استقبال' },
    { value: 'other', label: 'أخرى' }
  ]
}

