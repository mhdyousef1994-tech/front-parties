import api from './apiClient'

/**
 * Financial APIs - إدارة المعاملات المالية
 * Based on API_DOCUMENTATION_FRONTEND.md
 */

// لوحة التحكم المالية
export const getFinancialDashboard = (params = {}) => {
  const { hallId } = params
  return api.get('/api/financial/dashboard', { 
    params: { hallId } 
  }).then(r => {
    const data = r.data?.data || r.data || {}
    return {
      totalRevenue: Number(data.totalRevenue) || 0,
      totalExpenses: Number(data.totalExpenses) || 0,
      netProfit: Number(data.netProfit) || 0,
      pendingPayments: Number(data.pendingPayments) || 0,
      monthlyRevenue: Array.isArray(data.monthlyRevenue) ? data.monthlyRevenue : []
    }
  })
}

// قائمة المعاملات المالية
export const listTransactions = (params = {}) => {
  const { type, startDate, endDate, page = 1, limit = 10 } = params
  return api.get('/api/financial/transactions', { 
    params: { type, startDate, endDate, page, limit } 
  }).then(r => ({
    transactions: r.data?.data || r.data?.transactions || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

// إضافة معاملة مالية جديدة
export const addTransaction = (payload) => {
  const body = {
    type: payload.type, // payment, refund, adjustment, expense, revenue
    amount: Number(payload.amount) || 0,
    paymentMethod: payload.paymentMethod, // cash, bank_transfer, credit_card, debit_card, check, online_payment
    description: payload.description || '',
    eventId: payload.eventId,
    clientId: payload.clientId
  }
  return api.post('/api/financial/transactions', body).then(r => r.data)
}

// تحديث معاملة مالية
export const updateTransaction = (id, payload) => {
  const body = {
    type: payload.type,
    amount: Number(payload.amount) || 0,
    paymentMethod: payload.paymentMethod,
    description: payload.description
  }
  return api.put(`/api/financial/transactions/${id}`, body).then(r => r.data)
}

// حذف معاملة مالية
export const deleteTransaction = (id) => {
  return api.delete(`/api/financial/transactions/${id}`).then(r => r.data)
}

// قائمة الفواتير
export const listInvoices = (params = {}) => {
  const { status, page = 1, limit = 10 } = params
  return api.get('/api/financial/invoices', { 
    params: { status, page, limit } 
  }).then(r => ({
    invoices: r.data?.data || r.data?.invoices || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

// إضافة فاتورة جديدة
export const addInvoice = (payload) => {
  const body = {
    type: payload.type, // deposit, final, adjustment
    eventId: payload.eventId,
    clientId: payload.clientId,
    hallId: payload.hallId,
    items: payload.items || [],
    subtotal: Number(payload.subtotal) || 0,
    tax: Number(payload.tax) || 0,
    discount: Number(payload.discount) || 0,
    totalAmount: Number(payload.totalAmount) || 0,
    dueDate: payload.dueDate,
    notes: payload.notes || ''
  }
  return api.post('/api/financial/invoices', body).then(r => r.data)
}

// تحديث فاتورة
export const updateInvoice = (id, payload) => {
  const body = {
    status: payload.status, // draft, sent, viewed, paid, overdue, cancelled
    items: payload.items,
    subtotal: Number(payload.subtotal) || 0,
    tax: Number(payload.tax) || 0,
    discount: Number(payload.discount) || 0,
    totalAmount: Number(payload.totalAmount) || 0,
    paidAmount: Number(payload.paidAmount) || 0,
    notes: payload.notes
  }
  return api.put(`/api/financial/invoices/${id}`, body).then(r => r.data)
}

// حذف فاتورة
export const deleteInvoice = (id) => {
  return api.delete(`/api/financial/invoices/${id}`).then(r => r.data)
}

// الحصول على تفاصيل فاتورة
export const getInvoice = (id) => {
  return api.get(`/api/financial/invoices/${id}`).then(r => r.data?.invoice || r.data)
}

// تحديث حالة الفاتورة
export const updateInvoiceStatus = (id, status) => {
  return api.patch(`/api/financial/invoices/${id}/status`, { status }).then(r => r.data)
}

// تسجيل دفعة على فاتورة
export const recordPayment = (invoiceId, payload) => {
  const body = {
    amount: Number(payload.amount) || 0,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes || ''
  }
  return api.post(`/api/financial/invoices/${invoiceId}/payments`, body).then(r => r.data)
}

// أنواع المعاملات
export const getTransactionTypes = () => {
  return [
    { value: 'payment', label: 'دفعة' },
    { value: 'refund', label: 'استرداد' },
    { value: 'adjustment', label: 'تعديل' },
    { value: 'expense', label: 'مصروف' },
    { value: 'revenue', label: 'إيراد' }
  ]
}

// طرق الدفع
export const getPaymentMethods = () => {
  return [
    { value: 'cash', label: 'نقدي' },
    { value: 'bank_transfer', label: 'تحويل بنكي' },
    { value: 'credit_card', label: 'بطاقة ائتمان' },
    { value: 'debit_card', label: 'بطاقة مدين' },
    { value: 'check', label: 'شيك' },
    { value: 'online_payment', label: 'دفع إلكتروني' }
  ]
}

// حالات الفواتير
export const getInvoiceStatuses = () => {
  return [
    { value: 'draft', label: 'مسودة' },
    { value: 'sent', label: 'مرسلة' },
    { value: 'viewed', label: 'تم الاطلاع' },
    { value: 'paid', label: 'مدفوعة' },
    { value: 'overdue', label: 'متأخرة' },
    { value: 'cancelled', label: 'ملغاة' }
  ]
}

// أنواع الفواتير
export const getInvoiceTypes = () => {
  return [
    { value: 'deposit', label: 'دفعة مقدمة' },
    { value: 'final', label: 'فاتورة نهائية' },
    { value: 'adjustment', label: 'تعديل' }
  ]
}

