import React from 'react'
import { getClientReports } from '../../api/client'
import { formatSyrianDate ,formatSyrianTime } from '../../utils/date'

export default function ClientReports(){
  const [period, setPeriod] = React.useState('all')
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async ()=>{
    setLoading(true); setError('')
    try{
      const d = await getClientReports({ period })
      setData(d)
    }catch(e){ setError(e?.message || 'فشل جلب التقارير') }
    finally{ setLoading(false) }
  },[period])

  React.useEffect(()=>{ load() },[]) // initial

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold heading-gold'>تقاريري</h1>
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
          {!data.hasEvent && (
            <div className='card p-6'>
              <div className='text-gray-600'>لا يوجد حفل مرتبط ضمن الفترة المحددة.</div>
            </div>
          )}

          {data.hasEvent && data.event && (
            <div className='card p-6 animate-fade-up'>
              <h2 className='text-lg font-semibold heading-gold mb-4'>تفاصيل الحفل</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-3 bg-gray-50 rounded'>
                  <div className='text-sm text-gray-600'>اسم الحفل</div>
                  <div className='font-semibold text-ink'>{data.event?.eventName || '-'}</div>
                </div>
                <div className='p-3 bg-gray-50 rounded'>
                  <div className='text-sm text-gray-600'>الصالة</div>
                  <div className='font-semibold text-ink'>{data.event?.hallId?.name || '-'}</div>
                </div>
              </div>
            </div>
          )}

          {/* KPIs computed from invitations */}
          {data.hasEvent && (
            (()=>{
              const invs = Array.isArray(data.invitations) ? data.invitations : []
              const totalInvitations = invs.length
              const totalPersons = Number(data.event?.numOfPeople)||0
              const usedPersons = invs.reduce((s, x)=> s + (Number(x.numOfPeople)||0), 0)
              const personUnattended = totalPersons - usedPersons;
              return (
                <div className='grid grid-cols-1 sm:grid-cols-4 gap-6'>
                  <div className='card p-6 animate-fade-up'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 bg-gold-50 rounded-full'>
                        <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>إجمالي الدعوات</div>
                        <div className='text-2xl font-bold text-ink'>{totalInvitations}</div>
                      </div>
                    </div>
                  </div>
                  <div className='card p-6 animate-fade-up'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 bg-gold-50 rounded-full'>
                        <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' />
                        </svg>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>إجمالي الأشخاص</div>
                        <div className='text-2xl font-bold text-ink'>{totalPersons}</div>
                      </div>
                    </div>
                  </div>
                  <div className='card p-6 animate-fade-up'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 bg-gold-50 rounded-full'>
                        <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>العدد الباقي</div>
                        <div className='text-2xl font-bold text-ink'>{personUnattended}</div>
                      </div>
                    </div>
                  </div>
                  <div className='card p-6 animate-fade-up'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 bg-gold-50 rounded-full'>
                        <svg className='w-6 h-6 text-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                      <div>
                        <div className='text-sm text-gray-600'>الأشخاص المدعوين</div>
                        <div className='text-2xl font-bold text-ink'>{usedPersons}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          )}

          {/* Invitations table */}
          {data.hasEvent && (
            <div className='card p-6 animate-fade-up'>
              <h2 className='text-lg font-semibold heading-gold mb-4'>قائمة الدعوات</h2>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead>
                    <tr>
                      <th className='px-4 py-2 text-center'>الاسم</th>
                      <th className='px-4 py-2 text-center'>عدد الأشخاص</th>
                      <th className='px-4 py-2 text-center'>الحالة</th>
                      <th className='px-4 py-2 text-center'>تاريخ الاستخدام</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {(data.invitations||[]).map((inv)=> {
                      const status = inv.used ? 'مستخدم' : 'غير مستخدم'
                      return (
                        <tr key={inv._id}>
                          <td className='px-4 py-2 text-center'>{inv.name || inv.guestName || '-'}</td>
                          <td className='px-4 py-2 text-center'>{inv.numOfPeople ?? inv.peopleCount ?? 0}</td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (inv.used ?? inv.isUsed) ? 'bg-red-100 text-red-800' : 'badge-gold'
                            }`}>
                              {(inv.used ?? inv.isUsed) ? 'مستخدم' : 'متاح'}
                            </span>
                          </td>
                          <td className='px-4 py-2 text-center'>
                             {inv.usedDate 
                          ? (
                            <>
                              {formatSyrianTime(inv.usedDate)}<br />
                              <span className="text-sm text-gray-500">
                                {formatSyrianDate(inv.usedDate)}
                              </span>
                            </>
                          ) 
                          : '-'}
                            </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
