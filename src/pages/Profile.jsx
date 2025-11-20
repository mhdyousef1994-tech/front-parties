import React from 'react'
import api from '../api/apiClient'

export default function Profile(){
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [pwd, setPwd] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // جلب البيانات عند تحميل الصفحة
  React.useEffect(()=>{
    (async()=>{
      try{
        const res = await api.get('/auth/me')
        const u = res?.data?.user || res?.data
        if(u){
          setName(u.name || '')
          setPhone(u.phone || '')
        }
      }catch(e){
        console.error("فشل جلب بيانات المستخدم:", e.message)
      }
    })()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setMsg(''); setLoading(true)

    if(!name.trim()) return setMsg('يرجى إدخال الاسم')
    if(!phone.trim()) return setMsg('يرجى إدخال رقم الجوال')

    if(pwd){
      if (pwd.length < 6) return setMsg('كلمة المرور يجب ألا تقل عن 6 أحرف')
      if (pwd !== confirm) return setMsg('تأكيد كلمة المرور غير مطابق')
    }

    try {
      const payload = { name: name.trim(), phone: phone.trim() }
      if(pwd) payload.password = pwd

      const res = await api.put('/auth/profile', payload)
      setMsg(res.data.message || 'تم تحديث الملف الشخصي بنجاح')
      setPwd(''); setConfirm('')
    }catch(err){
      setMsg(err?.response?.data?.message || 'فشل تحديث الملف الشخصي')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className='max-w-md mx-auto card-elegant p-6 font-cairo animate-fade-in'>
      <h1 className='text-xl font-bold heading-gold mb-4'>الملف الشخصي</h1>
      {msg && <div className='mb-4 p-3 bg-gold-50 border border-gold-100 text-ink rounded'>{msg}</div>}
      <form onSubmit={save} className='space-y-4'>
        <div>
          <label className='block text-sm mb-2 text-ink'>الاسم</label>
          <input value={name} onChange={e=>setName(e.target.value)} className='w-full border border-gold-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gold' />
        </div>
        <div>
          <label className='block text-sm mb-2 text-ink'>رقم الجوال</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className='w-full border border-gold-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gold' />
        </div>
        <div>
          <label className='block text-sm mb-2 text-ink'>كلمة مرور جديدة</label>
          <input type='password' value={pwd} onChange={e=>setPwd(e.target.value)} className='w-full border border-gold-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gold' />
        </div>
        <div>
          <label className='block text-sm mb-2 text-ink'>تأكيد كلمة المرور</label>
          <input type='password' value={confirm} onChange={e=>setConfirm(e.target.value)} className='w-full border border-gold-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gold' />
        </div>
        <button disabled={loading} className='btn-gold px-4 py-2 rounded shadow-elegant disabled:brightness-95'>
          {loading ? 'جارٍ الحفظ...' : 'حفظ'}
        </button>
      </form>
    </div>
  )
}
