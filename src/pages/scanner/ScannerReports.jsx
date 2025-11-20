import React from 'react'
import { getScannerReports } from '../../api/scanner'

export default function ScannerReports(){
  const [period, setPeriod] = React.useState('today')
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async ()=>{
    setLoading(true); setError('')
    try{
      const d = await getScannerReports({ period })
      setData(d)
    }catch(e){ setError(e?.message || 'فشل جلب التقارير') }
    finally{ setLoading(false) }
  },[period])

  React.useEffect(()=>{ load() },[]) // initial

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold heading-gold'>تقارير جهاز المسح</h1>
      </div>

      <div className='card p-4 animate-fade-in'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm mb-1 text-ink'>الفترة</label>
            <select value={period} onChange={e=> setPeriod(e.target.value)} className='w-full border border-gold-100 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gold'>
              <option value='today'>اليوم</option>
              <option value='week'>آخر 7 أيام</option>
            </select>
          </div>
          <div className='flex items-end'>
            <button onClick={load} disabled={loading} className='btn-gold px-4 py-2 rounded-md shadow-elegant w-full md:w-auto disabled:brightness-95'>
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
          {/* Scanned invitations */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>الدعوات الممسوحة</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-right'>الكود</th>
                    <th className='px-4 py-2 text-right'>الضيف</th>
                    <th className='px-4 py-2 text-right'>عدد الأشخاص</th>
                    <th className='px-4 py-2 text-right'>اسم الحفل</th>
                    <th className='px-4 py-2 text-right'>العميل</th>
                    <th className='px-4 py-2 text-right'>الهاتف</th>
                    <th className='px-4 py-2 text-right'>وقت المسح</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {(data.scannedInvitations||[]).map((inv)=> (
                    <tr key={inv._id}>
                      <td className='px-4 py-2'>{inv.code || inv.shortCode || inv._id}</td>
                      <td className='px-4 py-2'>{inv.guestName || '-'}</td>
                      <td className='px-4 py-2'>{inv.numOfPeople ?? 0}</td>
                      <td className='px-4 py-2'>{inv.eventId?.eventName || '-'}</td>
                      <td className='px-4 py-2'>{inv.eventId?.clientId?.name || '-'}</td>
                      <td className='px-4 py-2'>{inv.eventId?.clientId?.phone || '-'}</td>
                      <td className='px-4 py-2'>{inv.usedAt ? new Date(inv.usedAt).toLocaleString('ar-SY') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hourly scans (today) */}
          <div className='card p-6 animate-fade-up'>
            <h2 className='text-lg font-semibold heading-gold mb-4'>المسح بالساعة (اليوم)</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-right'>الساعة</th>
                    <th className='px-4 py-2 text-right'>عدد المسحات</th>
                    <th className='px-4 py-2 text-right'>عدد الضيوف</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {(data.hourlyScans||[]).map((h,idx)=> (
                    <tr key={idx}>
                      <td className='px-4 py-2'>{h._id?.hour ?? '-'}</td>
                      <td className='px-4 py-2'>{h.count ?? 0}</td>
                      <td className='px-4 py-2'>{h.guests ?? 0}</td>
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
