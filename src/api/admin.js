import api from './apiClient'

function normalizeStats(d){
  if(!d) return {}
  const num = (v)=> typeof v==='number'?v:Number(v)||0
  const pick = (obj, keys)=> keys.find(k=> obj && obj[k] !== undefined)
  const root = d.stats && typeof d.stats==='object' ? d.stats : d
  const totalHallsKey = pick(root, ['totalHalls','total_halls','hallsCount'])
  const totalUsersKey = pick(root, ['totalUsers','total_users','usersCount'])
  const totalEventsKey = pick(root, ['totalEvents','total_events','eventsCount'])
  const todayBookingsKey = pick(root, ['todayBookings','today_bookings','bookingsToday'])
  const activeBookingsKey = pick(root, ['activeBookings','active_bookings','bookingsActive'])
  const recentKey = pick(root, ['recentActivities','recent_activities','recentBookings','recent_bookings','recent'])

  const toItems = (arr)=> {
    const list = Array.isArray(arr)? arr : (arr && Array.isArray(arr.items)? arr.items : [])
    return list.map(it=>({
      title: it.title || it.clientName || it.client_name || it.userName || it.user_name || it.name || '',
      type: it.type || it.eventType || it.event_type || it.action || '',
      date: it.date || it.createdAt || it.created_at || it.eventDate || it.event_date || null,
      status: it.status || it.state || '',
    }))
  }

  return {
    totalHalls: num(root[totalHallsKey]),
    totalUsers: num(root[totalUsersKey]),
    totalEvents: num(root[totalEventsKey]),
    todayBookings: num(root[todayBookingsKey]),
    activeBookings: num(root[activeBookingsKey]),
    recentActivities: recentKey ? toItems(root[recentKey]) : [],
  }
}

async function computeAdminFallbacks(stats){
  const out = { ...stats }
  const tasks = []
  let halls = null, users = null, events = null
  const needToday = !out.todayBookings || out.todayBookings === 0
  const needActive = !out.activeBookings || out.activeBookings === 0
  if(!out.totalHalls || out.totalHalls === 0){
    tasks.push(api.get('/admin/halls').then(r=>{ halls = r.data?.halls || r.data || [] }).catch(()=>{}))
  }
  if(!out.totalUsers || out.totalUsers === 0){
    tasks.push(api.get('/admin/users').then(r=>{ users = r.data?.users || r.data || [] }).catch(()=>{}))
  }
  if(needToday || needActive){
    // حاول جلب كل الأحداث للنظام عبر عدة مسارات محتملة
    const candidates = ['/admin/events','/admin/bookings','/admin/reservations']
    tasks.push((async ()=>{
      for (const path of candidates){
        try{
          const r = await api.get(path)
          const arr = r.data?.events || r.data?.bookings || r.data?.reservations || r.data
          if (Array.isArray(arr) || (arr && Array.isArray(arr.items))){
            events = Array.isArray(arr) ? arr : arr.items
            break
          }
        }catch(e){ /* ignore and try next */ }
      }
    })())
  }
  if(tasks.length){ await Promise.all(tasks) }
  if(Array.isArray(halls)) out.totalHalls = halls.length
  if(Array.isArray(users)) out.totalUsers = users.length
  if(Array.isArray(events)){
    const toYMDDamascus = (dateLike)=>{
      if(!dateLike) return null
      const fmt = new Intl.DateTimeFormat('en-CA',{ timeZone:'Asia/Damascus', year:'numeric', month:'2-digit', day:'2-digit' })
      try{ return fmt.format(new Date(dateLike)) } catch { return null }
    }
    const todayStr = toYMDDamascus(new Date())
    const getDate = (e)=> e.date || e.eventDate || e.event_date || e.createdAt || e.created_at
    const status = (s)=> (s||'').toLowerCase()
    if(needToday){ out.todayBookings = events.filter(e=> toYMDDamascus(getDate(e)) === todayStr).length }
    if(needActive){ out.activeBookings = events.filter(e=> ['confirmed','active','ongoing'].includes(status(e.status))).length }
  }
  return out
}

export const getAdminDashboard = async ()=> {
  const res = await api.get('/admin/dashboard').catch(()=>({data:null}))
  const normalized = normalizeStats(res?.data)
  return computeAdminFallbacks(normalized)
}

// Detailed admin reports between optional start/end
export const getAdminReports = async (params={}) => {
  const { period = 'month', startDate, endDate } = params || {}
  const res = await api.get('/admin/reports', { params: { period, startDate, endDate } }).catch(()=>({data:null}))
  const d = res?.data || {}
  const inv = d.invitationStats || {}
  const totalInvitations = Number(inv.totalInvitations) || 0
  const usedInvitations = Number(inv.usedInvitations) || 0
  const totalGuests = Number(inv.totalGuests) || 0
  const attendanceRate = totalInvitations > 0 ? ((usedInvitations/totalInvitations)*100).toFixed(2) + '%' : '0%'
  return {
    period: d.period || period,
    hallsWithDetails: Array.isArray(d.hallsWithDetails) ? d.hallsWithDetails : [],
    usersByRole: Array.isArray(d.usersByRole) ? d.usersByRole : [],
    eventsByHall: Array.isArray(d.eventsByHall) ? d.eventsByHall : [],
    monthlyRevenueByHall: Array.isArray(d.monthlyRevenueByHall) ? d.monthlyRevenueByHall : [],
    recentActivities: Array.isArray(d.recentActivities) ? d.recentActivities : [],
    invitationStats: { totalInvitations, usedInvitations, totalGuests, attendanceRate },
  }
}

export const listUsers = (params)=> api.get('/admin/users',{params}).then(r=> r.data?.users || r.data || [])
export const listManagers = ()=> api.get('/admin/managers').then(r=> r.data?.managers || r.data || [])
export const getManagersAddMeta = ()=> api.get('/admin/managers/add').then(r=> r.data)
export const getManagerEditMeta = (id)=> api.get(`/admin/managers/edit/${id}`).then(r=> r.data)
export const addManager = (payload)=> api.post('/admin/managers/add', payload).then(r=> r.data)
export const editManager = (id,payload)=> api.post(`/admin/managers/edit/${id}`, payload).then(r=> r.data)
export const deleteManager = (id)=> api.delete(`/admin/managers/${id}`).then(r=> r.data)

export const listHalls = (params)=> api.get('/admin/halls', {params}).then(r=> r.data?.halls || r.data || [])

export const addHall = (payload)=> {
  // Support both FormData (with images) and regular JSON
  if (payload instanceof FormData) {
    return api.post('/admin/halls', payload, {
      headers: {'Content-Type': 'multipart/form-data'}
    }).then(r=>r.data)
  }

  const body = {
    name: payload.name,
    location: payload.location,
    capacity: payload.capacity,
    maxEmployees: payload.maxEmployees,
    tables: payload.tables,
    chairs: payload.chairs,
    defaultPrices: payload.defaultPrices || {
      perPerson: Number(payload.defaultPrices) || 0,
      hallRental: 0
    },
    description: payload.description,
    amenities: payload.amenities || [],
    managerName: payload.managerName,
    managerPhone: payload.managerPhone,
    managerPassword: payload.managerPassword,
  }
  return api.post('/admin/halls', body).then(r=>r.data)
}

export const editHall = (id,payload)=> {
  // Support both FormData (with images) and regular JSON
  if (payload instanceof FormData) {
    return api.put(`/admin/halls/edit/${id}`, payload, {
      headers: {'Content-Type': 'multipart/form-data'}
    }).then(r=>r.data)
  }

  const body = {
    name: payload.name,
    location: payload.location,
    capacity: payload.capacity,
    maxEmployees: payload.maxEmployees,
    tables: payload.tables,
    chairs: payload.chairs,
    defaultPrices: payload.defaultPrices,
    description: payload.description,
    amenities: payload.amenities
  }
  return api.put(`/admin/halls/edit/${id}`, body).then(r=>r.data)
}

export const deleteHall = (id)=> api.delete(`/admin/halls/${id}`).then(r=>r.data)

// جلب بيانات القاعة للتعديل
export const getHallEditMeta = (id) => api.get(`/admin/halls/edit/${id}`).then(r => r.data)

export const listTemplates = ()=> api.get('/admin/templates').then(r=> r.data?.templates || r.data || [])
export const getTemplatesAddMeta = ()=> api.get('/admin/templates/add').then(r=>r.data)
export const getTemplateEditMeta = (id)=> api.get(`/admin/templates/edit/${id}`).then(r=>r.data)
export const addTemplate = (formData)=> api.post('/admin/templates/add', formData, {headers:{'Content-Type':'multipart/form-data'}}).then(r=>r.data)
export const editTemplate = (id,formData)=> api.post(`/admin/templates/edit/${id}`, formData, {headers:{'Content-Type':'multipart/form-data'}}).then(r=>r.data)
export const deleteTemplate = (id)=> api.delete(`/admin/templates/${id}`).then(r=>r.data)

// User management endpoints
export const activateUser = (id)=> api.post(`/admin/users/${id}/activate`).then(r=>r.data)
export const deactivateUser = (id)=> api.post(`/admin/users/${id}/deactivate`).then(r=>r.data)
export const deleteUser = (id)=> api.delete(`/admin/users/${id}`).then(r=>r.data)

// Complaints management
export const listComplaints = (params = {})=> {
  const { page = 1, limit = 10, status } = params
  return api.get('/admin/complaints', { params: { page, limit, status } }).then(r => ({
    complaints: r.data?.complaints || r.data?.data || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

export const getComplaint = (id)=> api.get(`/admin/complaints/${id}`).then(r=> r.data?.complaint || r.data)

export const updateComplaintStatus = (id, status)=> {
  return api.patch(`/admin/complaints/${id}/status`, { status }).then(r=> r.data)
}

export const deleteComplaint = (id)=> api.delete(`/admin/complaints/${id}`).then(r=> r.data)

export const addComplaintResponse = (id, response)=> {
  return api.post(`/admin/complaints/${id}/response`, { response }).then(r=> r.data)
}

// Services management
export const listServices = (params = {}) => {
  const { page = 1, limit = 10, category } = params
  return api.get('/admin/services', {
    params: { page, limit, category }
  }).then(r => ({
    services: r.data?.data || r.data?.services || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

export const getService = (id) => api.get(`/admin/services/${id}`).then(r => r.data?.service || r.data)

export const addService = (payload) => {
  const body = {
    name: payload.name,
    category: payload.category,
    basePrice: Number(payload.basePrice) || 0,
    description: payload.description || '',
    unit: payload.unit || 'item'
  }
  return api.post('/admin/services', body).then(r => r.data)
}

export const updateService = (id, payload) => {
  const body = {
    name: payload.name,
    category: payload.category,
    basePrice: Number(payload.basePrice) || 0,
    description: payload.description,
    unit: payload.unit,
    isActive: payload.isActive
  }
  return api.put(`/admin/services/${id}`, body).then(r => r.data)
}

export const deleteService = (id) => api.delete(`/admin/services/${id}`).then(r => r.data)

export const toggleServiceStatus = (id, isActive) => {
  return api.patch(`/admin/services/${id}/status`, { isActive }).then(r => r.data)
}
