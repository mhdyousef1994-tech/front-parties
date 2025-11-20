import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../api/auth'

export default function Login(){
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await login(phone, password)
      const role = res.user?.role
      if(role === 'admin') nav('/admin')
      else if(role === 'manager') nav('/manager')
      else if(role === 'scanner') nav('/scanner')
      else nav('/client')
    } catch(err) { 
      setError('فشل تسجيل الدخول - تأكد من رقم الجوال وكلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='min-h-screen hero-parallax flex items-center justify-center bg-gold-50'
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      <div className='w-full max-w-md px-4'>
        <div className='card-elegant p-8 animate-fade-up'>
          <div className='text-center mb-8 font-cairo'>
            <h1 className='text-3xl font-bold text-ink mb-2'>نظام أتمتة الحجوزات</h1>
            <p className='text-brown'>تسجيل الدخول إلى النظام</p>
          </div>
          
          {error && (
            <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
              {error}
            </div>
          )}
          
          <form onSubmit={submit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>
                رقم الجوال
              </label>
              <input 
                type='tel'
                inputMode='numeric'
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className='w-full px-3 py-2 border border-gold-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent'
                placeholder='مثال: 0912345678'
                required
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-ink mb-2 font-cairo'>
                كلمة المرور
              </label>
              <input 
                type='password' 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className='w-full px-3 py-2 border border-gold-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent'
                placeholder='أدخل كلمة المرور' 
                required
              />
            </div>
            
            <button 
              type='submit'
              disabled={loading}
              
              className='w-full py-3 px-4 disabled:brightness-95 font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 border border-gold text-ink rounded hover:bg-gold-100'
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          
          <div className='mt-6 text-center'>
            <Link to='/reset-password' className='text-sm text-gold hover:underline'>
              نسيت كلمة المرور؟
            </Link>
            <div className='mt-2'>
              <Link to='/register' className='text-sm text-ink hover:text-brown'>
                مستخدم جديد؟ إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
