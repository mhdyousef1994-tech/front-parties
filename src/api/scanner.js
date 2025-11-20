import api from './apiClient'

export const getScannerDashboard = ()=> api.get('/scanner/dashboard').then(r=>r.data)


// Detailed reports for scanner
export const getScannerReports = async ({ period='today' }={})=>{
  const res = await api.get('/scanner/reports', { params: { period } }).catch(()=>({data:null}))
  const d = res?.data || {}
  return {
    period: d.period || period,
    scannedInvitations: Array.isArray(d.scannedInvitations) ? d.scannedInvitations : [],
    hourlyScans: Array.isArray(d.hourlyScans) ? d.hourlyScans : [],
  }
}

function loadLocalInvitations(){
  try{ return JSON.parse(localStorage.getItem('invitations_all')||'[]') }catch{ return [] }
}
function saveUsedCode(code){
  const used = new Set(JSON.parse(localStorage.getItem('used_codes')||'[]'))
  used.add(code)
  localStorage.setItem('used_codes', JSON.stringify(Array.from(used)))
}
function isUsed(code){
  try{ const arr = JSON.parse(localStorage.getItem('used_codes')||'[]'); return arr.includes(code) }catch{ return false }
}
 
export const verifyCode = async (code)=>{
  // Local verification first
  const all = loadLocalInvitations()
  const found = all.find(inv => inv.code === code)
  if(found){
    if(isUsed(code)){
      const err = new Error('USED')
      err.message = 'تم استخدام هذه الدعوة مسبقًا'
      throw err
    }
    saveUsedCode(code)
    const num = found.numOfPeople ?? found.peopleCount ?? found.guestsCount ?? found.guests ?? found.quantity
    return { ok:true, guestName: found.guestName, eventName: found.eventName, numOfPeople: num, message: 'صالح' }
  }
  // Fallback to API if available
  try {
    const r = await api.get(`/scanner/verify/${code}`)
    return r.data
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'خطأ غير معروف'
    const err = new Error(msg)
    throw err
  }
}

export const getEventInvitations = (id)=> api.get(`/scanner/events/${id}/invitations`).then(r=>r.data)
