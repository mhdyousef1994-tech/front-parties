import React from 'react'
import { getManagerReports } from '../../api/manager'

export default function ManagerReports(){
  const [period, setPeriod] = React.useState('month')
  const [range, setRange] = React.useState({ startDate: '', endDate: '' })
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async ()=>{
    setLoading(true); setError('')
    try{
      const d = await getManagerReports({ period, startDate: range.startDate || undefined, endDate: range.endDate || undefined })
      setData(d)
    }catch(e){ setError(e?.message || 'فشل جلب التقارير') }
    finally{ setLoading(false) }
  },[period, range.startDate, range.endDate])

  React.useEffect(()=>{ load() },[]) // initial

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold heading-gold'>تقارير الصالة</h1>
      </div>

      <div className='card p-4 animate-fade-in'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm mb-1 text-ink'>الفترة</label>
            <select value={period} onChange={e=> setPeriod(e.target.value)} className='w-full border border-gold-100 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gold'>
              <option value='today'>اليوم</option>
              <option value='month'>هذا الشهر</option>
              <option value='custom'>مخصص</option>
            </select>
          </div>
          <div>
            <label className='block text-sm mb-1 text-ink'>من تاريخ</label>
            <input type='date' value={range.startDate} onChange={e=> setRange(r=>({...r, startDate: e.target.value}))} className='w-full border border-gold-100 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gold' disabled={period!=='custom'}/>
          </div>
          <div>
            <label className='block text-sm mb-1 text-ink'>إلى تاريخ</label>
            <input type='date' value={range.endDate} onChange={e=> setRange(r=>({...r, endDate: e.target.value}))} className='w-full border border-gold-100 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gold' disabled={period!=='custom'}/>
          </div>
          <div className='flex items-end'>
            <button onClick={load} disabled={loading} className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-elegant w-full md:w-auto disabled:brightness-95'>
              {loading ? 'جارٍ التحميل...' : 'تحديث التقارير'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className='flex items-center justify-center h-32'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-gold'></div>
        </div>
      )}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 rounded text-red-700'>{error}</div>
      )}

      {!loading && !error && data && (
        <>
          {/* KPIs */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='card p-6 animate-fade-up'>
              <div className='text-sm text-gray-600'>إجمالي الدعوات</div>
              <div className='text-2xl font-bold text-ink'>{data.invitationStats?.totalInvitations ?? 0}</div>
            </div>
            <div className='card p-6 animate-fade-up'>
              <div className='text-sm text-gray-600'>الدعوات المستخدمة</div>
              <div className='text-2xl font-bold text-ink'>{data.invitationStats?.usedInvitations ?? 0}</div>
            </div>
            <div className='card p-6 animate-fade-up'>
              <div className='text-sm text-gray-600'>الضيوف الإجمالي</div>
              <div className='text-2xl font-bold text-ink'>{data.invitationStats?.totalGuests ?? 0}</div>
            </div>
            <div className='card p-6 animate-fade-up'>
              <div className='text-sm text-gray-600'>نسبة الحضور</div>
              <div className='text-2xl font-bold text-ink'>{data.invitationStats?.attendanceRate ?? '0%'}</div>
            </div>
          </div>

          {/* Revenue by period */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>الإيرادات</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-right'>السنة</th>
                    <th className='px-4 py-2 text-right'>الشهر</th>
                    {period==='today' && <th className='px-4 py-2 text-right'>اليوم</th>}
                    <th className='px-4 py-2 text-right'>الإيراد</th>
                    <th className='px-4 py-2 text-right'>عدد الفعاليات</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {(data.revenueByPeriod||[]).map((row,idx)=> (
                    <tr key={idx}>
                      <td className='px-4 py-2'>{row._id?.year}</td>
                      <td className='px-4 py-2'>{row._id?.month}</td>
                      {period==='today' && <td className='px-4 py-2'>{row._id?.day}</td>}
                      <td className='px-4 py-2'>{row.totalRevenue ?? 0}</td>
                      <td className='px-4 py-2'>{row.eventsCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events list */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>الفعاليات ضمن الفترة</h2>
            <div className='space-y-3'>
              {(data.events||[]).map((e)=> (
                <div key={e._id} className='p-3 bg-gray-50 rounded-md flex items-center justify-between'>
                  <div>
                    <div className='font-medium text-ink'>{e.eventName}</div>
                    <div className='text-sm text-gray-600'>{new Date(e.eventDate).toLocaleDateString('ar-SY')}</div>
                  </div>
                  <div className='text-xs text-gray-500'>{e?.clientId?.name || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
