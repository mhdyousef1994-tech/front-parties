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
        <div className='card p-8 animate-fade-up'>
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
                className='input'
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
                className='input'
                placeholder='أدخل كلمة المرور' 
                required
              />
            </div>
            
            <button 
              type='submit'
              disabled={loading}
              className='btn w-full'
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

// import React, { useState, useEffect } from 'react'
// import { useNavigate, Link, useLocation } from 'react-router-dom'
// import { Eye, EyeOff, Lock, User } from 'lucide-react'
// import { login } from '../../api/auth'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from "@/components/ui/card"

// export default function Login() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [formData, setFormData] = useState({
//     phone: '',
//     password: ''
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const navigate = useNavigate()
//   const location = useLocation()

//   useEffect(() => {
//     // إعادة التوجيه إذا كان المستخدم مسجلاً الدخول بالفعل
//     const token = localStorage.getItem('token')
//     if (token) {
//       const from = location.state?.from?.pathname || "/dashboard"
//       navigate(from, { replace: true })
//     }
//   }, [navigate, location])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     e.stopPropagation()

//     if (loading) return
//     setError('')
//     setLoading(true)

//     if (!formData.phone.trim() || !formData.password.trim()) {
//       setError('يرجى إدخال رقم الجوال وكلمة المرور')
//       setLoading(false)
//       return
//     }

//     try {
//       const res = await login(formData.phone, formData.password)
//       const role = res.user?.role
      
//       // التوجيه بناءً على الدور
//       let redirectPath = "/dashboard"
//       if (role === 'admin') redirectPath = "/admin"
//       else if (role === 'manager') redirectPath = "/manager"
//       else if (role === 'scanner') redirectPath = "/scanner"
//       else if (role === 'client') redirectPath = "/client"

//       navigate(redirectPath, { replace: true })
//     } catch (err) {
//       console.error('Login error:', err)
//       const errorMessage =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         err.message ||
//         'فشل تسجيل الدخول - تأكد من رقم الجوال وكلمة المرور'
//       setError(errorMessage)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div
//       className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100"
//       dir="rtl"
//     >
//       {/* تأثيرات الخلفية */}
//       <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
//       <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

//       <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
//         {/* اللوحة اليمنى - نموذج التسجيل */}
//         <div className="flex items-center justify-center p-6 md:p-10">
//           <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-amber-200/60 shadow-xl">
//             <CardHeader className="text-center space-y-2">
//               <div className="flex justify-center">
//                 <div className="h-16 w-16 bg-amber-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xl font-bold">ن</span>
//                 </div>
//               </div>
//               <CardTitle className="text-2xl font-cairo text-amber-900">
//                 تسجيل الدخول
//               </CardTitle>
//               <CardDescription className="font-cairo text-amber-700">
//                 أدخل بياناتك للوصول إلى النظام
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <form
//                 onSubmit={handleSubmit}
//                 className="space-y-6"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
//                     e.preventDefault()
//                     handleSubmit(e)
//                   }
//                 }}
//               >
//                 {/* رقم الجوال */}
//                 <div className="space-y-2">
//                   <Label htmlFor="phone" className="text-right block font-cairo text-amber-900">
//                     رقم الجوال
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="phone"
//                       type="tel"
//                       inputMode="numeric"
//                       placeholder="مثال: 0912345678"
//                       value={formData.phone}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           phone: e.target.value
//                         }))
//                       }
//                       className="pr-10 pl-3 border-amber-200 focus:border-amber-400"
//                       dir="rtl"
//                       required
//                     />
//                     <User className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
//                   </div>
//                 </div>

//                 {/* كلمة المرور */}
//                 <div className="space-y-2">
//                   <Label htmlFor="password" className="text-right block font-cairo text-amber-900">
//                     كلمة المرور
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="أدخل كلمة المرور"
//                       value={formData.password}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           password: e.target.value
//                         }))
//                       }
//                       className="pr-10 pl-10 border-amber-200 focus:border-amber-400"
//                       required
//                     />
//                     <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       disabled={loading}
//                       className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-amber-100"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="w-4 h-4 text-amber-600" />
//                       ) : (
//                         <Eye className="w-4 h-4 text-amber-600" />
//                       )}
//                     </Button>
//                   </div>
//                 </div>

//                 {/* روابط إضافية */}
//                 <div className="flex items-center justify-between gap-4 pt-2">
//                   <Link
//                     to="/reset-password"
//                     className="text-sm text-amber-600 hover:text-amber-700 transition-colors font-cairo"
//                   >
//                     نسيت كلمة المرور؟
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="text-sm text-amber-800 hover:text-amber-900 transition-colors font-cairo"
//                   >
//                     مستخدم جديد؟ إنشاء حساب
//                   </Link>
//                 </div>

//                 {/* عرض الخطأ */}
//                 {error && (
//                   <div className="bg-red-50 border border-red-200 rounded-md p-3 !mt-4">
//                     <p className="text-sm text-center text-red-700 font-medium font-cairo">
//                       {error}
//                     </p>
//                   </div>
//                 )}

//                 {/* زر الدخول */}
//                 <Button
//                   type="submit"
//                   className="w-full cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-cairo"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
//                       جاري تسجيل الدخول...
//                     </span>
//                   ) : (
//                     "تسجيل الدخول"
//                   )}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </div>

//         {/* اللوحة اليسرى - صورة الخلفية */}
//         <div className="relative bg-amber-500 hidden md:block">
//           <div
//             className="absolute inset-0 bg-center bg-cover bg-no-repeat"
//             style={{ backgroundImage: "url('/hero.jpg')" }}
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-amber-900/70 to-amber-500/20" />
//           <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12">
//             <h1 className="text-3xl font-bold text-white mb-3 font-cairo">
//               نظام أتمتة الحجوزات
//             </h1>
//             <p className="text-white/80 max-w-md font-cairo">
//               سجل دخولك للوصول إلى النظام وإدارة الحجوزات بسهولة وأمان.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }