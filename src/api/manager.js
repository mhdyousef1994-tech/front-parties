import api from './apiClient'
/*
function normalizeManagerDashboard(d){
  if(!d) return {}
  const pick = (obj, keys)=> keys.find(k=> obj && obj[k] !== undefined)
  const num = (v)=> typeof v === 'number' ? v : Number(v)||0
  const getArr = (v)=> Array.isArray(v)?v: (v&&Array.isArray(v.items)?v.items: [])

  const todayKey = pick(d, ['todayBookings','today_bookings','bookingsToday'])
  const activeKey = pick(d, ['activeBookings','active_bookings','bookingsActive'])
  const clientsKey = pick(d, ['totalClients','total_clients','clientsCount'])
  const revenueKey = pick(d, ['monthlyRevenue','monthly_revenue','revenueMonthly'])
  const recentKey = pick(d, ['recentBookings','recent_bookings','bookings','recent'])
  const hallKey = pick(d, ['hallInfo','hall_info','hall'])

  const recentRaw = recentKey ? d[recentKey] : []
  const extractDate = (b)=> b.date || b.eventDate || b.event_date || b.createdAt || b.created_at || null
  const recent = getArr(recentRaw)
    .map(b=>({
      clientName: b.clientName || b.client_name || b.client || b.customerName || b.customer_name || '',
      eventType: b.eventType || b.event_type || b.type || '',
      date: extractDate(b),
      status: b.status, // لا نقوم بتغيير الحالة حتى لا نعرض قيمة خاطئة
      address: b.address || b.location || b.hallAddress || b.hall_address || '',
      peopleCount: b.numOfPeople ?? b.num_of_people ?? b.peopleCount ?? b.chairsCount ?? b.chairs_count ?? null,
      phone: b.phone || b.clientPhone || b.client_phone || '',
      startTime: b.startTime || b.start_time || '',
      endTime: b.endTime || b.end_time || '',
      templateName: b.templateName || b.template_name || '',
    }))

  const hallRaw = hallKey ? d[hallKey] : null
  console.log('normalizeManagerDashboard', d )

  const hallInfo = hallRaw ? {
    tables: hallRaw.tables ?? hallRaw.tablesCount ?? hallRaw.tables_count ?? 0,
    chairs: hallRaw.chairs ?? hallRaw.chairsCount ?? hallRaw.chairs_count ?? 0,
    wings: hallRaw.wings ?? hallRaw.sections ?? [],
    defaultPrices: hallRaw.defaultPrices ?? hallRaw.default_prices ?? hallRaw.prices ?? { morning:0, evening:0, night:0 }
  } : undefined

  return {
    todayBookings: num(d[todayKey]),
    activeBookings: num(d[activeKey]),
    totalClients: num(d[clientsKey]),
    monthlyRevenue: num(d[revenueKey]),
    recentBookings: recent,
    hallInfo,
  }
}*/
function normalizeManagerDashboard(d){
  if(!d) return {}
  const pick = (obj, keys)=> keys.find(k=> obj && obj[k] !== undefined)
  const num = (v)=> typeof v === 'number' ? v : Number(v)||0
  const getArr = (v)=> Array.isArray(v)?v: (v&&Array.isArray(v.items)?v.items: [])

  const stats = d.stats || d
  const totalEventsKey = pick(stats, ['totalEvents','total_events','eventsCount'])
  const todayKey   = pick(stats, ['todayBookings','today_bookings','bookingsToday','todayEvents'])
  const activeKey  = pick(stats, ['activeBookings','active_bookings','bookingsActive','activeEvents'])
  const clientsKey = pick(stats, ['totalClients','total_clients','clientsCount'])
  const revenueKey = pick(stats, ['monthlyRevenue','monthly_revenue','revenueMonthly'])
  const recentKey  = pick(stats, ['recentBookings','recent_bookings','bookings','recent'])
  const hallKey    = pick(stats, ['hallInfo','hall_info','hall'])

  const recentRaw = recentKey ? stats[recentKey] : []
  const extractDate = (b)=> b.date || b.eventDate || b.event_date || b.createdAt || b.created_at || null
  const recent = getArr(recentRaw).map(b=>({
    clientName: b.clientName || b.client_name || b.client || b.customerName || b.customer_name || '',
    eventType: b.eventType || b.event_type || b.type || '',
    date: extractDate(b),
    status: b.status,
    address: b.address || b.location || b.hallAddress || b.hall_address || '',
    peopleCount: b.numOfPeople ?? b.num_of_people ?? b.peopleCount ?? b.chairsCount ?? b.chairs_count ?? null,
    phone: b.phone || b.clientPhone || b.client_phone || '',
    startTime: b.startTime || b.start_time || '',
    endTime: b.endTime || b.end_time || '',
    templateName: b.templateName || b.template_name || '',
  }))

  const hallRaw = hallKey ? stats[hallKey] : null

  const hallInfo = hallRaw ? {
    name: hallRaw.name || '',
    location: hallRaw.location || '',
    tables: hallRaw.tables ?? hallRaw.tablesCount ?? hallRaw.tables_count ?? 0,
    chairs: hallRaw.chairs ?? hallRaw.chairsCount ?? hallRaw.chairs_count ?? 0,
    defaultPrices: hallRaw.defaultPrices ?? hallRaw.default_prices ?? hallRaw.prices ?? 0 ,
  } : undefined

  return {
    totalEvents: num(stats[totalEventsKey]),
    todayBookings: num(stats[todayKey]),
    activeBookings: num(stats[activeKey]),
    totalClients: num(stats[clientsKey]),
    monthlyRevenue: num(stats[revenueKey]),
    recentBookings: recent,
    hallInfo,
  }
}


function toYMDDamascus(dateLike){
  if(!dateLike) return null
  const fmt = new Intl.DateTimeFormat('en-CA',{ timeZone:'Asia/Damascus', year:'numeric', month:'2-digit', day:'2-digit' })
  try{ return fmt.format(new Date(dateLike)) } catch { return null }
}

async function computeManagerFallbacks(stats){
  const out = { ...stats }
  const needsToday = !out.todayBookings || out.todayBookings === 0
  const needsActive = !out.activeBookings || out.activeBookings === 0
  const needsClients = !out.totalClients || out.totalClients === 0
  const tasks = []
  let events = null
  let clients = null
  if(needsToday || needsActive){
    tasks.push(
      api.get('/manager/hall/events').then(r=>{
        events = (r.data?.events || r.data || [])
      }).catch(()=>{})
    )
  }
  if(needsClients){
    tasks.push(
      api.get('/manager/clients').then(r=>{
        clients = (r.data?.clients || r.data || [])
      }).catch(()=>{})
    )
  }
  if(tasks.length){ await Promise.all(tasks) }
  if(events){
    const todayStr = toYMDDamascus(new Date())
    const getDate = (e)=> e.date || e.eventDate || e.event_date || e.createdAt || e.created_at
    out.todayBookings = events.filter(e=> toYMDDamascus(getDate(e)) === todayStr).length
    const status = (s)=> (s||'').toLowerCase()
    out.activeBookings = events.filter(e=> ['confirmed','active','ongoing'].includes(status(e.status))).length
    if(!out.recentBookings || out.recentBookings.length===0){
      const toTime = (v)=> { const d=new Date(v); return isNaN(d)?0:d.getTime() }
      out.recentBookings = [...events]
        .sort((a,b)=> toTime((b.date||b.eventDate||b.event_date||b.createdAt||b.created_at)) - toTime((a.date||a.eventDate||a.event_date||a.createdAt||a.created_at)))
        .slice(0,5)
        .map(b=>({
          clientName: b.clientName || b.client_name || b.client || b.customerName || b.customer_name || '',
          eventType: b.eventType || b.event_type || b.type || '',
          date: b.date || b.eventDate || b.event_date || b.createdAt || b.created_at || null,
          status: b.status,
          address: b.address || b.location || b.hallAddress || b.hall_address || '',
          peopleCount: b.numOfPeople ?? b.num_of_people ?? b.peopleCount ?? b.chairsCount ?? b.chairs_count ?? null,
          phone: b.phone || b.clientPhone || b.client_phone || '',
          startTime: b.startTime || b.start_time || '',
          endTime: b.endTime || b.end_time || '',
          templateName: b.templateName || b.template_name || '',
        }))
    }
  }
  if(clients){ out.totalClients = Array.isArray(clients)? clients.length : Number(clients.total||0) }
  return out
}

export const getManagerDashboard = async ()=> {
  const res = await api.get('/manager/dashboard').catch(()=>({data:null}))
  const normalized = normalizeManagerDashboard(res?.data)
  return computeManagerFallbacks(normalized)
}
export const getManagerHall = ()=> api.get('/manager/hall').then(r=> r.data?.hall || r.data)
export const updateManagerHall = (payload)=> {
  const body = {
    name: payload.name,
    location: payload.location,
    tables: payload.tables,
    chairs: payload.chairs,
    defaultPrices: payload.defaultPrices
  }
  return api.put('/manager/hall', body).then(r=> r.data)
}
export const listManagerEvents = ()=> api.get('/manager/hall/events').then(r=> r.data?.events || r.data || [])
export const getManagerEventsBundle = ()=> api.get('/manager/hall/events').then(r=> r.data)
export const addManagerEvent = (payload)=> {
  const body = {
    eventName: payload.eventName,
    eventDate: payload.eventDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    eventType: payload.eventType,
    // backend expects numOfPeople; keep chairsCount for compatibility
    numOfPeople: payload.chairsCount,
    chairsCount: payload.chairsCount,
    clientName: payload.clientName,
    phone: payload.clientPhone || payload.phone,
    password: payload.clientPassword || payload.password,
    templateId: payload.templateId,
    status: payload.status,
    statusWrite: payload.statusWrite || false
  }
  return api.post('/manager/hall/events', body).then(r=>r.data)
}
export const editManagerEvent = (id,payload)=> {
  const body = {
    eventName: payload.eventName,
    eventDate: payload.eventDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    eventType: payload.eventType,
    // ensure backend receives required field
    numOfPeople: payload.chairsCount,
    chairsCount: payload.chairsCount,
    clientName: payload.clientName,
    phone: payload.clientPhone || payload.phone,
    templateId: payload.templateId,
    status: payload.status
  }
  return api.put(`/manager/events/${id}`, body).then(r=>r.data)
}
export const deleteManagerEvent = (id)=> api.delete(`/manager/events/${id}`).then(r=>r.data)

export const listStaff = ()=> api.get('/manager/staff').then(r=> r.data?.staff || r.data || [])
export const addStaff = (payload)=> api.post('/manager/staff/add', payload).then(r=>r.data)
export const editStaff = (id,payload)=> api.post(`/manager/staff/edit/${id}`, payload).then(r=>r.data)
export const deleteStaff = (id)=> api.delete(`/manager/staff/${id}`).then(r=>r.data)

export const listTemplatesManager = ()=> api.get('/manager/templates').then(r=> r.data?.templates || r.data || [])
export const addTemplateManager = (formData)=> api.post('/manager/templates/add', formData, {headers:{'Content-Type':'multipart/form-data'}}).then(r=>r.data)
export const editTemplateManager = (id,formData)=> api.post(`/manager/templates/edit/${id}`, formData, {headers:{'Content-Type':'multipart/form-data'}}).then(r=>r.data)
export const deleteTemplateManager = (id)=> api.delete(`/manager/templates/${id}`).then(r=>r.data)

export const listManagerClients = ()=> api.get('/manager/clients').then(r=> r.data?.clients || r.data || [])

// Complaints management for manager
export const listManagerComplaints = (params = {})=> {
  const { page = 1, limit = 10, status } = params
  return api.get('/manager/complaints', { params: { page, limit, status } }).then(r => ({
    complaints: r.data?.complaints || r.data?.data || r.data || [],
    pagination: r.data?.pagination || null
  }))
}

export const getManagerComplaint = (id)=> api.get(`/manager/complaints/${id}`).then(r=> r.data?.complaint || r.data)

export const updateManagerComplaintStatus = (id, status)=> {
  return api.patch(`/manager/complaints/${id}/status`, { status }).then(r=> r.data)
}

export const addManagerComplaintResponse = (id, response)=> {
  return api.post(`/manager/complaints/${id}/response`, { response }).then(r=> r.data)
}

export const getManagerReports = async (params={}) => {
  const { period = 'month', startDate, endDate } = params || {}
  const res = await api.get('/manager/reports', { params: { period, startDate, endDate } }).catch(()=>({data:null}))
  const d = res?.data || {}
  const events = Array.isArray(d.events) ? d.events : []
  const invArr = Array.isArray(d.invitationStats) ? d.invitationStats : []
  const totals = invArr.reduce((acc, x)=>{
    const ti = Number(x.totalInvitations)||0
    const ui = Number(x.usedInvitations)||0
    const tg = Number(x.totalGuests)||0
    acc.totalInvitations += ti; acc.usedInvitations += ui; acc.totalGuests += tg
    return acc
  }, { totalInvitations:0, usedInvitations:0, totalGuests:0 })
  const attendanceRate = totals.totalInvitations>0 ? ((totals.usedInvitations/totals.totalInvitations)*100).toFixed(2)+'%' : '0%'
  const revenueByPeriod = Array.isArray(d.revenueByPeriod) ? d.revenueByPeriod : []
  return {
    period: d.period || period,
    events,
    invitationStats: { ...totals, attendanceRate },
    revenueByPeriod,
  }
}
