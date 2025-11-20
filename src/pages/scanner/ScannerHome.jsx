import React from 'react'
import { Link } from 'react-router-dom'
import { getScannerDashboard } from '../../api/scanner'
import { formatSyrianDate } from '../../utils/date'

export default function ScannerHome(){ 
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    setLoading(true); setError('')
    getScannerDashboard()
      .then(d => { if(mounted) setData(d) })
      .catch(e => { if(mounted) setError(e?.message || 'فشل جلب بيانات لوحة التحكم') })
      .finally(() => { if(mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const getStatusColor = (status) => {
    const statusColors = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const statusLabels = {
      'scheduled': 'في الانتظار', 'confirmed': 'مؤكد', 'cancelled': 'ملغي', 'completed': 'مكتمل'

    }
    return statusLabels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold heading-gold">لوحة تحكم الماسح</h1>
        {data?.welcome && (<div className="text-sm text-gray-500">{data.welcome}</div>)}
      </div>
      {/* Statistics for Events */}
     {data?.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* إجمالي الفعاليات */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 animate-fade-up">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 0l3-3m-3 3l-3-3M4 6h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">إجمالي الفعاليات</h3>
              <p className="text-2xl font-bold text-ink">{data.stats.totalEvents}</p>
            </div>
          </div>

          {/* مجدولة */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 animate-fade-up">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 12h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">مجدولة</h3>
              <p className="text-2xl font-bold text-yellow-800">{data.stats.scheduledEvents}</p>
            </div>
          </div>

          {/* مؤكدة */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 animate-fade-up">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">مؤكدة</h3>
              <p className="text-2xl font-bold text-green-800">{data.stats.confirmedEvents}</p>
            </div>
          </div>

          {/* ملغية */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 animate-fade-up">
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">ملغية</h3>
              <p className="text-2xl font-bold text-red-800">{data.stats.cancelledEvents}</p>
            </div>
          </div>

          {/* مكتملة */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 animate-fade-up">
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">مكتملة</h3>
              <p className="text-2xl font-bold text-indigo-800">{data.stats.completedEvents}</p>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md animate-fade-up">
        <div className="px-6 py-4 border-b border-gold-100">
          <h3 className="text-lg font-medium heading-gold">قائمة الفعاليات</h3>
        </div>
        <div className="p-6 space-y-4">
          {Array.isArray(data?.events) && data.events.length > 0 ? (
            data.events.map((ev) => (
              <Link key={ev._id} to={`/scanner/events/${ev._id}/invitations`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gold-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{ev.eventName || 'فعالية بدون اسم'}</div>
                    <div className="text-sm text-gray-600">
                      {ev.eventDate ? formatSyrianDate(ev.eventDate) : '-'}
                      {ev.eventTime ? ` - ${ev.eventTime}` : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ev.clientName || ''} — 
                      <span className={`${getStatusColor(ev.status)} font-semibold ml-1`}>
                        {getStatusLabel(ev.status)}
                      </span>
                    </div>
                  </div>

                  <span className="text-gold text-sm">عرض الدعوات</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-gray-600">لا توجد فعاليات حالياً.</div>
          )}
        </div>
      </div>
    </div>
  )
}
