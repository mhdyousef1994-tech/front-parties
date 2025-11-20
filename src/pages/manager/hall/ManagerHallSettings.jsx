import React from 'react'
import { getManagerHall, updateManagerHall } from '../../../api/manager'

export default function ManagerHallSettings(){
  const [loading, setLoading] = React.useState(true)
  const [hall, setHall] = React.useState({ name:'', location:'', tables:0, chairs:0, defaultPrices: 0 })

  // تأمين وجود defaultPrices دائمًا حتى لو لم يرجعها الباكند
  const safeHall = {
    ...hall,
    defaultPrices: typeof hall.defaultPrices === 'number' ? hall.defaultPrices : 0
  }

  React.useEffect(()=>{ loadHall() },[])

  const loadHall = async () => {
    setLoading(true)
    try { const res = await getManagerHall(); setHall({
      name: res.name,
      location: res.location,
      tables: res.tables,
      chairs: res.chairs,
      defaultPrices: typeof res.defaultPrices === 'number' ? res.defaultPrices : 0
    }) } catch(e){ console.error(e) } finally { setLoading(false) }
  }

  const updateField = (path, value) => {
    setHall(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = copy
      for(let i=0;i<keys.length-1;i++){ obj = obj[keys[i]] }
      obj[keys[keys.length-1]] = value
      return copy
    })
  }

  const save = async (e) => {
    e.preventDefault()
    // أرسل فقط الحقول المطلوبة
    const payload = {
      name: hall.name,
      location: hall.location,
      tables: hall.tables,
      chairs: hall.chairs,
      defaultPrices: hall.defaultPrices
    }
    try{ await updateManagerHall(payload); alert('تم حفظ الإعدادات بنجاح') }catch{ alert('فشل حفظ الإعدادات') }
  }

  if (loading) return <div className='p-6'><div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div></div>

  // إذا لم توجد بيانات للصالة
  if (!hall || !hall.name) {
    return (
      <div className='p-6 text-center'>
        <h2 className='text-xl font-bold text-gray-700 mb-4'>لا توجد إعدادات للصالة بعد</h2>
        <p className='mb-4 text-gray-500'>لم يتم العثور على بيانات الصالة الخاصة بك. يرجى التواصل مع الإدارة أو إعادة المحاولة لاحقًا.</p>
        <button onClick={loadHall} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>إعادة المحاولة</button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900'>إعدادات الصالة</h2>
      <form onSubmit={save} className='bg-white rounded shadow p-6 space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm mb-2'>اسم الصالة</label>
            <input value={hall.name} onChange={e=>updateField('name', e.target.value)} className='w-full border p-2 rounded' />
          </div>
          <div>
            <label className='block text-sm mb-2'>الموقع</label>
            <input value={hall.location} onChange={e=>updateField('location', e.target.value)} className='w-full border p-2 rounded' />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm mb-2'>عدد الطاولات</label>
            <input type='number' value={hall.tables} onChange={e=>updateField('tables', +e.target.value)} className='w-full border p-2 rounded' />
          </div>
          <div>
            <label className='block text-sm mb-2'>عدد الكراسي</label>
            <input type='number' value={hall.chairs} onChange={e=>updateField('chairs', +e.target.value)} className='w-full border p-2 rounded' />
          </div>
        </div>
        <div>
          <label className='block text-sm mb-2'>السعر الافتراضي</label>
          <input type='number' value={safeHall.defaultPrices} onChange={e=> setHall(prev => ({ ...prev, defaultPrices: +e.target.value }))} className='w-full border p-2 rounded' placeholder='السعر الافتراضي' />
        </div>
        {/* <div>
          <label className='block text-sm mb-2'>الأجنحة</label>
          <div className='space-y-2'>
            {safeHall.wings.map((w,i)=> (
              <div key={i} className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                <input value={w.name} onChange={e=>{
                  const arr=[...safeHall.wings]; arr[i]={...arr[i], name:e.target.value}; setHall({...hall, wings:arr})
                }} className='border p-2 rounded' placeholder='اسم' />
                <input type='number' value={w.capacity} onChange={e=>{ const arr=[...safeHall.wings]; arr[i]={...arr[i], capacity:+e.target.value}; setHall({...hall, wings:arr}) }} className='border p-2 rounded' placeholder='السعة' />
                <input type='number' value={w.price} onChange={e=>{ const arr=[...safeHall.wings]; arr[i]={...arr[i], price:+e.target.value}; setHall({...hall, wings:arr}) }} className='border p-2 rounded' placeholder='السعر' />
                <button type='button' onClick={()=>{ const arr=safeHall.wings.filter((_,idx)=>idx!==i); setHall({...hall, wings:arr}) }} className='px-2 py-1 bg-red-600 text-white rounded'>حذف</button>
              </div>
            ))}
            <button type='button' onClick={()=> setHall({...hall, wings:[...(hall.wings||[]), {name:'', capacity:0, price:0}]}) } className='px-3 py-1 bg-green-600 text-white rounded'>إضافة جناح</button>
          </div>
        </div> */}
        <button className='px-4 py-2 bg-blue-600 text-white rounded'>حفظ</button>
      </form>
    </div>
  )
}