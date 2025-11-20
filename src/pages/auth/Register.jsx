import React from 'react'
import { register } from '../../api/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register(){
  const [form, setForm] = React.useState({ name: '', phone: '', password: '', role: 'client' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try{
      const res = await register(form)
      setSuccess('تم إنشاء الحساب بنجاح')
      setTimeout(()=> nav('/login'), 1000)
    }catch(err){
      setError(err?.response?.data?.error || 'فشل إنشاء الحساب')
    }finally{ setLoading(false) }
  }

  return (
    <div
      className='min-h-screen hero-parallax flex items-center justify-center bg-gold-50'
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      <div className='w-full max-w-md px-4'>
        <div className='card-elegant p-8 animate-fade-up'>
          <div className='text-center mb-8 font-cairo'>
            <h1 className='text-3xl font-bold text-ink mb-2'>إنشاء حساب</h1>
            <p className='text-brown'>سجّل كعميل جديد</p>
          </div>
          {error && (<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>{error}</div>)}
          {success && (<div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>{success}</div>)}
          <form onSubmit={submit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>الاسم *</label>
              <input type='text' value={form.name} onChange={e=> setForm({...form, name: e.target.value})} className='w-full px-3 py-2 border border-gold-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold' required />
            </div>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>رقم الجوال *</label>
              <input type='tel' inputMode='numeric' value={form.phone} onChange={e=> setForm({...form, phone: e.target.value})} className='w-full px-3 py-2 border border-gold-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold' required />
            </div>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>كلمة المرور *</label>
              <input type='password' value={form.password} onChange={e=> setForm({...form, password: e.target.value})} className='w-full px-3 py-2 border border-gold-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold' required />
            </div>
            <div className='flex gap-3 pt-2'>
              <button type='submit' disabled={loading} className='px-6 py-2 btn-gold rounded-lg disabled:brightness-95 transition-colors'>
                {loading ? 'جاري التسجيل...' : 'تسجيل'}
              </button>
              <Link to='/login' className='px-6 py-2 border border-gold-100 text-ink rounded-lg hover:bg-gold-50 transition-colors'>لديك حساب؟ تسجيل دخول</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

