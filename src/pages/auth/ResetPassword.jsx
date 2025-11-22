import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setPassword } from '../../api/auth'

export default function ResetPassword(){
  const [phone, setPhone] = useState('')
  const [password, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if(password.length < 6) return setError('كلمة المرور يجب ألا تقل عن 6 أحرف')
    if(password !== confirm) return setError('تأكيد كلمة المرور غير مطابق')
    setLoading(true)
    try{
      setPassword(phone, password)
      setSuccess('تم تحديث كلمة المرور بنجاح')
      setTimeout(()=> nav('/login'), 800)
    }catch(err){ setError('حدث خطأ غير متوقع') }
    finally{ setLoading(false) }
  }

  return (
    <div
      className='min-h-screen hero-parallax flex items-center justify-center bg-gold-50'
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      <div className='w-full max-w-md px-4'>
        <div className='card p-8 animate-fade-up'>
          <div className='text-center mb-8 font-cairo'>
            <h1 className='text-2xl font-bold text-ink mb-2'>إعادة تعيين كلمة المرور</h1>
            <p className='text-brown'>أدخل رقم الجوال وكلمة المرور الجديدة</p>
          </div>

          {error && <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>{error}</div>}
          {success && <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>{success}</div>}

          <form onSubmit={submit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>رقم الجوال</label>
              <input type='tel' inputMode='numeric' value={phone} onChange={e=>setPhone(e.target.value)} className='input' placeholder='مثال: 0912345678' required />
            </div>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>كلمة المرور الجديدة</label>
              <input type='password' value={password} onChange={e=>setPwd(e.target.value)} className='input' required />
            </div>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>تأكيد كلمة المرور</label>
              <input type='password' value={confirm} onChange={e=>setConfirm(e.target.value)} className='input' required />
            </div>
            <button type='submit' disabled={loading} className='btn w-full'>
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
