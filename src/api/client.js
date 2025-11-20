import api from './apiClient'

// استرجاع قوالب الدعوات للعميل
// مؤقتًا: جلب القوالب من endpoint المدير
export const listTemplatesClient = () => api.get('/manager/templates').then(r => r.data?.templates || r.data || [])
export const getClientDashboard = async ()=> {
  const res = await api.get('/client/dashboard').catch(()=>({data:null}))
  const d = res?.data || {}
  const num = (v)=> typeof v==='number' ? v : Number(v)||0

  return {  event : d.event || null
    , invitationsCount   : num(d.invitationsCount) }
}
export const listInvitations = ()=> api.get('/client/invitations').then(r=> r.data?.invitations || r.data || [])
export const getInvitation = (id)=> api.get(`/client/show/${id}`).then(r=> r.data?.invitation || r.data)
export const addInvitation = (payload)=> api.post('/client/invitations/add', payload).then(r=>r.data)
export const editInvitation = (id,payload)=> api.put(`/client/invitations/edit/${id}`, payload).then(r=>r.data)
export const deleteInvitation = (id)=> api.delete(`/client/invitations/${id}`).then(r=>r.data)
export const getAddInvitationContext = ()=> api.get('/client/invitations/add').then(r=> r.data)

// تقارير العميل التفصيلية (واجهة عامة بوسائط اختيارية)
export const getClientReports = async (params={})=> {
  const { period='all' } = params || {}
  const res = await api.get('/client/reports', { params: { period } }).catch(()=>({data:null}))
  const d = res?.data || {}
  // Server returns: { hasEvent, event, invitations, dailyUsage, period }
  return {
    hasEvent: Boolean(d.hasEvent),
    period: d.period || period,
    event: d.event || null,
    invitations: Array.isArray(d.invitations) ? d.invitations : [],
    dailyUsage: Array.isArray(d.dailyUsage) ? d.dailyUsage : [],
  }
}

// Complaints management for client
export const listClientComplaints = (params = {})=> {
  const { page = 1, limit = 10 } = params
  return api.get('/client/complaints', { params: { page, limit } }).then(r => ({
    complaints: r.data?.complaints || r.data?.data || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

export const getClientComplaint = (id)=> api.get(`/client/complaints/${id}`).then(r=> r.data?.complaint || r.data)

export const addClientComplaint = (payload)=> {
  const body = {
    subject: payload.subject,
    description: payload.description,
    category: payload.category || 'general'
  }
  return api.post('/client/complaints', body).then(r=> r.data)
}

export const updateClientComplaint = (id, payload)=> {
  const body = {
    subject: payload.subject,
    description: payload.description
  }
  return api.put(`/client/complaints/${id}`, body).then(r=> r.data)
}

export const deleteClientComplaint = (id)=> api.delete(`/client/complaints/${id}`).then(r=> r.data)
