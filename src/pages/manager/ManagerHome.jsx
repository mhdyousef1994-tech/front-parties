import React from 'react'
import { getManagerDashboard } from '../../api/manager'
import { Link } from 'react-router-dom'
import { formatSyrianDate } from '../../utils/date'

export default function ManagerHome(){ 
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => { 
    getManagerDashboard()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

    const getEventColor = (event) => {
    const eventColors = {
      'wedding': 'bg-pink-100 text-pink-800',
      'engagement': 'bg-purple-100 text-purple-800',
      'birthday': 'bg-yellow-100 text-yellow-800',
      'graduation': 'bg-blue-100 text-blue-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    return eventColors[event] || 'bg-gray-100 text-gray-800'
  }

  const getEventLabel = (event) => {
    const eventLabels = {
      'wedding': 'زفاف',
      'engagement': 'خطوبة',
      'birthday': 'عيد ميلاد',
      'graduation': 'تخرج',
      'other': 'أخرى'
    }
    return eventLabels[event] || event
  }
  console.log(data)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold heading-gold">لوحة تحكم المدير العام</h1>
        <div className="text-sm text-gray-500">مرحباً بك في إدارة صالتك</div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/manager/events" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">إدارة الحجوزات</h3>
              <p className="text-gray-600">عرض وإدارة الحجوزات</p>
            </div>
          </div>
        </Link>

        <Link to="/manager/employees" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">إدارة الموظفين</h3>
              <p className="text-gray-600">إضافة وتعديل الموظفين</p>
            </div>
          </div>
        </Link>

        <Link to="/manager/templates" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">قوالب الدعوات</h3>
              <p className="text-gray-600">إدارة قوالب الدعوات</p>
            </div>
          </div>
        </Link>

        <Link to="/manager/hall" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">إعدادات الصالة</h3>
              <p className="text-gray-600">الموارد والأسعار</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-50 rounded-full">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3M5 21h14' />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">إجمالي الفعاليات</p>
                <p className="text-2xl font-bold text-ink">{data.totalEvents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-50 rounded-full">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">الحجوزات اليوم</p>
                <p className="text-2xl font-bold text-ink">{data.todayBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-50 rounded-full">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-ink">{data.totalClients || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-50 rounded-full">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">الإيرادات الشهرية</p>
                <p className="text-2xl font-bold text-ink">{data.monthlyRevenue || 0} ل.س</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md animate-fade-up">
        <div className="px-6 py-4 border-b border-gold-100">
          <h3 className="text-lg font-medium heading-gold">الحجوزات الأخيرة</h3>
        </div>
        <div className="p-6">
          {data && data.recentBookings && data.recentBookings.length > 0 ? (
            <div className="space-y-4">
              {data.recentBookings.slice(0, 5).map((booking, index) => {
                const s = (booking.status || '').toLowerCase()
                const statusLabel = s === 'confirmed' ? 'مؤكد'
                  : s === 'scheduled' ? 'في الانتظار'
                  : (s === 'cancelled' || s === 'canceled') ? 'ملغي'
                  : s === 'completed'  ? 'مكتمل'
                  : (booking.status || '')
                const statusClass = s === 'confirmed' ? 'bg-green-100 text-green-800'
                  : s === 'scheduled' ? 'bg-yellow-100 text-yellow-800'
                  : (s === 'cancelled' || s === 'canceled') ? 'bg-red-100 text-red-800'
                  : s === 'completed'  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
                const extras = []
                if (booking.address) extras.push(`العنوان: ${booking.address}`)
                if (booking.peopleCount != null) extras.push(`عدد الأشخاص: ${booking.peopleCount}`)
                if (booking.phone) extras.push(`الهاتف: ${booking.phone}`)
                const timeRange = [booking.startTime, booking.endTime].filter(Boolean).join(' - ')
                if (timeRange) extras.push(`الوقت: ${timeRange}`)
                if (booking.templateName) extras.push(`القالب: ${booking.templateName}`)
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{booking.clientName}</h4>
                      <p className={`text-sm text-gray-600 ${getEventColor(booking.eventType)}`}>{getEventLabel(booking.eventType)} - {formatSyrianDate(booking.date)}</p>
                      {extras.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{extras.join(' • ')}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <span className="text-gold text-sm">عرض الدعوات</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              لا توجد حجوزات حديثة
            </div>
          )}
        </div>
      </div>

      {/* Hall Information */}
     {data && data.hallInfo && (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-up">
        <div className="px-6 py-4 border-b border-gold-100">
          <h3 className="text-xl font-semibold heading-gold">معلومات الصالة</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 shadow-inner">
            <h4 className="font-medium text-gray-900 mb-4">الموارد المتاحة</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الطاولات</span>
                <span className="font-semibold text-gray-800">{data.hallInfo.tables}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الكراسي</span>
                <span className="font-semibold text-gray-800">{data.hallInfo.chairs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">سعر الحجز</span>
                <span className="font-semibold text-gray-800">
                  {data.hallInfo.defaultPrices ?? 0} ل.س
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
