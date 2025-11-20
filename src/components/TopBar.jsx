import React from 'react'
import { getUser, logout, getToken } from '../api/auth'
import { useNavigate, Link } from 'react-router-dom'

function deriveName(u){
  if(!u) return ''
  const first = u.firstName || u.given_name || u.givenName
  const last  = u.lastName  || u.family_name || u.familyName
  if(first || last) return `${first?first:''} ${last?last:''}`.trim()
  const nested = u.name || u.fullName || u.username || u.displayName ||
                 u.client?.name || u.manager?.name || u.admin?.name
  if(nested) return nested
  if(u.email){
    const local = (u.email.split('@')[0]||'').replace(/\./g,' ')
    if(local) return local
  }
  return u.phone || 'المستخدم'
}

function base64UrlDecode(input){
  try{
    const b64 = input.replace(/-/g,'+').replace(/_/g,'/') + '==='.slice((input.length+3)%4)
    const bin = atob(b64)
    try{
      const bytes = Uint8Array.from(bin, c=>c.charCodeAt(0))
      return new TextDecoder('utf-8').decode(bytes)
    }catch{
      return decodeURIComponent(escape(bin))
    }
  }catch{ return '' }
}

function nameFromToken(token){
  if(!token) return ''
  try{
    const parts = token.split('.')
    if(parts.length < 2) return ''
    const payload = JSON.parse(base64UrlDecode(parts[1])||'{}')
    const candidates = [
      payload.name, payload.fullName, payload.full_name,
      payload.preferred_username, payload.username,
      `${payload.given_name||''} ${payload.family_name||''}`.trim(),
      payload.sub,
    ].filter(v=>typeof v==='string' && v.trim())
    for(const c of candidates){
      const v = c.trim()
      if(v && !/^[0-9+\s-]+$/.test(v)) return v
    }
  }catch{}
  return ''
}

export default function TopBar({ onToggleSidebar }){
  const user = getUser(); const nav = useNavigate()
  const derived = deriveName(user)
  const tokenName = derived ? '' : nameFromToken(getToken())
  const role = (user?.role||'').toLowerCase()
  const profileHref = role==='admin' ? '/admin/profile' : role==='manager' ? '/manager/profile' : role==='client' ? '/client/profile' : '/profile'
  return (
    <div className='topbar sticky top-0 z-40 flex items-center justify-between p-3 bg-white border-b border-gold-100 shadow-elegant font-cairo animate-fade-in'>
      <div className='flex items-center gap-3'>
        {/* زر فتح السايدبار للجوال */}
        {onToggleSidebar && (
          <button
            className='md:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-gold text-ink hover:bg-gold-50'
            onClick={onToggleSidebar}
            aria-label='فتح القائمة'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className='text-lg font-semibold text-gold'>نظام أتمتة الحجوزات</div>
      </div>
      <div className='flex items-center gap-3'>
        {/* <div className='text-sm'>{derived || tokenName || 'المستخدم'}</div> */}
        {/* <Link to={profileHref} className='text-sm text-blue-600 hover:underline'>الملف الشخصي</Link> */}
        <button onClick={()=>{ logout(); nav('/login') }} className='px-3 py-1 border border-gold text-ink rounded hover:bg-gold-50'>تسجيل الخروج</button>
      </div>
    </div>
  )
}
