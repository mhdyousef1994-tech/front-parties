import React from 'react'
import { getAdminReports } from '../../api/admin'

export default function AdminReports(){
  const [range, setRange] = React.useState(()=>({ startDate: '', endDate: '' }))
  const [period, setPeriod] = React.useState('month')
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async ()=>{
    setLoading(true); setError('')
    try{
      const d = await getAdminReports({ period, startDate: range.startDate || undefined, endDate: range.endDate || undefined })
      setData(d)
    }catch(e){ setError(e?.message || 'فشل جلب التقارير') }
    finally{ setLoading(false) }
  },[period, range.startDate, range.endDate])

  React.useEffect(()=>{ load() },[]) // initial

  const getRolesLabel = (role) => {
    const roleLabels = {
      'admin': 'مدير التطبيق',
      'manager': 'مدير الصالة',
      'client': 'مستخدم',
      'scanner': 'ماسح',
      'other': 'أخرى'
    }
    return roleLabels[role] || role
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold heading-gold'>تقارير الإدارة</h1>
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
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gold-50 rounded-full'>
                  <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8' />
                  </svg>
                </div>
                <div>
                  <div className='text-sm text-gray-600'>الدعوات</div>
                  <div className='text-2xl font-bold text-ink'>{data.invitationStats?.totalInvitations ?? 0}</div>
                </div>
              </div>
            </div>
            <div className='card p-6 animate-fade-up'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gold-50 rounded-full'>
                  <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                </div>
                <div>
                  <div className='text-sm text-gray-600'>المستخدمة</div>
                  <div className='text-2xl font-bold text-ink'>{data.invitationStats?.usedInvitations ?? 0}</div>
                </div>
              </div>
            </div>
            <div className='card p-6 animate-fade-up'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gold-50 rounded-full'>
                  <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3' />
                  </svg>
                </div>
                <div>
                  <div className='text-sm text-gray-600'>الفعاليات</div>
                  <div className='text-2xl font-bold text-ink'>{Array.isArray(data.eventsByHall) ? data.eventsByHall.reduce((s,x)=> s + (x.eventsCount||0),0) : 0}</div>
                </div>
              </div>
            </div>
            <div className='card p-6 animate-fade-up'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gold-50 rounded-full'>
                  <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v8' />
                  </svg>
                </div>
                <div>
                  <div className='text-sm text-gray-600'>نسبة الحضور</div>
                  <div className='text-2xl font-bold text-ink'>{data.invitationStats?.attendanceRate ?? '0%'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Users by role */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>المستخدمون حسب الدور</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-right'>الدور</th>
                    <th className='px-4 py-2 text-right'>العدد</th>
                    <th className='px-4 py-2 text-right'>النشط</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {(data.usersByRole||[]).map((r)=> (
                    <tr key={r._id}>
                      <td className='px-4 py-2'>{getRolesLabel(r._id)}</td>
                      <td className='px-4 py-2'>{r.count}</td>
                      <td className='px-4 py-2'>{r.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events by hall */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>الفعاليات حسب الصالة</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-right'>الصالة</th>
                    <th className='px-4 py-2 text-right'>عدد الفعاليات</th>
                    <th className='px-4 py-2 text-right'>الإيراد</th>
                    <th className='px-4 py-2 text-right'>الضيوف</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {(data.eventsByHall||[]).map((h,idx)=> (
                    <tr key={idx}>
                      <td className='px-4 py-2'>{h.hallName}</td>
                      <td className='px-4 py-2'>{h.eventsCount}</td>
                      <td className='px-4 py-2'>{h.totalRevenue ?? 0}</td>
                      <td className='px-4 py-2'>{h.totalGuests ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent activities */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>أحدث الأنشطة</h2>
            <div className='space-y-3'>
              {(data.recentActivities||[]).map((a,idx)=> (
                <div key={idx} className='p-3 bg-gray-50 rounded-md flex items-center justify-between'>
                  <div>
                    <div className='font-medium text-ink'>{a?.clientId?.name || '-'}</div>
                    <div className='text-sm text-gray-600'>{a?.hallId?.name || '-'} — {a?.eventName || ''}</div>
                  </div>
                  <div className='text-xs text-gray-500'>{a?.createdAt ? new Date(a.createdAt).toLocaleString('ar-SY') : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly revenue by hall */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>الإيرادات الشهرية حسب الصالة</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-right'>الصالة</th>
                    <th className='px-4 py-2 text-right'>السنة</th>
                    <th className='px-4 py-2 text-right'>الشهر</th>
                    <th className='px-4 py-2 text-right'>الإيراد</th>
                    <th className='px-4 py-2 text-right'>عدد الفعاليات</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {(data.monthlyRevenueByHall||[]).map((row,idx)=> (
                    <tr key={idx}>
                      <td className='px-4 py-2'>{row._id?.hallName}</td>
                      <td className='px-4 py-2'>{row._id?.year}</td>
                      <td className='px-4 py-2'>{row._id?.month}</td>
                      <td className='px-4 py-2'>{row.revenue ?? 0}</td>
                      <td className='px-4 py-2'>{row.eventsCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
