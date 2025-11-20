import React from 'react'
import { getClientDashboard } from '../../api/client'
import { Link } from 'react-router-dom'
import { formatSyrianDate } from '../../utils/date'

export default function ClientHome() { 
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => { 
    let mounted = true
    setLoading(true)
    setError('')
    getClientDashboard()
      .then(d => { 
        if (mounted) setData(d) 
      })
      .catch(() => {
        if (mounted) {
          setError('تعذر تحميل البيانات، حاول لاحقاً')
          setData({ title: 'لوحة تحكم العميل', event: null, invitationsCount: 0 })
        }
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-rose-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-center">
        {error}
      </div>
    )
  }

  const event = data?.event

  return (
    <div className="space-y-6">
      {/* العنوان والترحيب */}
      <div className="flex items-center justify-between">
        <h1 className="heading-gold text-3xl font-bold">
          {data?.title || 'لوحة تحكم العميل'}
        </h1>
        <div className="text-sm text-gray-600">مرحباً بك</div>
      </div>

      {/* تفاصيل الحفل */}
      <div className="card p-6 animate-fade-up">
        <h2 className="text-lg font-semibold heading-gold mb-2">تفاصيل الحفل</h2>
        {event ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">اسم الحفل</div>
              <div className="font-semibold text-ink">{event.eventName}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">الصالة</div>
              <div className="font-semibold text-ink">{event.hallId?.name || '-'}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">لا يوجد تفاصيل حالياً</div>
        )}
      </div>

      {/* البطاقات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* إجمالي الدعوات */}
        <div className="card p-6 animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الدعوات</p>
              <p className="text-2xl font-semibold text-gray-900">{data?.invitationsCount ?? 0}</p>
            </div>
          </div>
        </div>

        {/* إدارة الدعوات */}
        <Link 
          to="/client/invitations" 
          className="card p-6 hover:shadow-lg transition-shadow animate-fade-up"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">إدارة الدعوات</h3>
              <p className="text-gray-600">إنشاء وإدارة دعوات الحفل</p>
            </div>
          </div>
        </Link>

        {/* تاريخ الحفل */}
        <div className="card p-6 animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">تاريخ الحفل</h3>
              <p className="text-gray-600">
                {event?.eventDate ? formatSyrianDate(event.eventDate) : 'لا يوجد حفل'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
