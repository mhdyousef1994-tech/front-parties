import React from 'react'
import { getAdminDashboard } from '../../api/admin'
import { Link } from 'react-router-dom'
import { formatSyrianDate } from '../../utils/date'

export default function AdminHome(){
  const [stats, setStats] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => { 
    getAdminDashboard()
      .then(d => setStats(d))
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

  const exportCSV = () => {
    const rows = [['الفئة','القيمة'], ['إجمالي الصالات', stats?.totalHalls||0], ['إجمالي المستخدمين', stats?.totalUsers||0], ['حجوزات اليوم', stats?.todayBookings||0], ['حجوزات نشطة', stats?.activeBookings||0] ]
    const csv = rows.map(r=>r.map(v=>`"${(v??'').toString().replace(/"/g,'""')}"`).join(',')).join('\r\n')
    const bom = '\ufeff' // UTF-8 BOM
    const blob = new Blob([bom + csv], {type:'text/csv;charset=utf-8;'})
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'summary.csv'; link.click()
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-gold text-3xl font-bold">لوحة تحكم مدير التطبيق</h1>
        <div className="text-sm text-gray-500">مرحباً بك في نظام إدارة صالات الأفراح</div>
      </div>

      <div className="flex justify-end">
        <button onClick={exportCSV} className='px-4 py-2 rounded shadow-elegant text-white bg-gold hover:bg-gold/90 transition-colors'>تصدير ملخص CSV</button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/halls" className="card p-6 hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">إدارة الصالات</h3>
              <p className="text-gray-600">إضافة وتعديل الصالات</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" className="card p-6 hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">إدارة المستخدمين</h3>
              <p className="text-gray-600">إدارة المدراء والموظفين</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/templates" className="card p-6 hover:shadow-lg transition-shadow animate-fade-up">
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

        <Link to="/admin/templates" className="card p-6 hover:shadow-lg transition-shadow animate-fade-up">
          <div className="flex items-center">
            <div className="p-3 bg-gold-50 rounded-full">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">التقارير</h3>
              <p className="text-gray-600">إحصائيات النظام</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-50 rounded-full">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">إجمالي الصالات</p>
                <p className="text-2xl font-bold text-ink">{stats.totalHalls || 0}</p>
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
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-ink">{stats.totalUsers || 0}</p>
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
                <p className="text-2xl font-bold text-ink">{stats.todayBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gold-50 rounded-full">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">الحجوزات النشطة</p>
                <p className="text-2xl font-bold text-ink">{stats.activeBookings || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {stats && Array.isArray(stats.recentActivities) && stats.recentActivities.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="heading-gold text-lg font-semibold">النشاطات الأخيرة</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...stats.recentActivities]
                .sort((a,b)=> new Date(b.date) - new Date(a.date))
                .slice(0,5)
                .map((item,idx)=> (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.type} - {item.date ? formatSyrianDate(item.date) : ''}</p>
                    </div>
                    {item.status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (item.status||'').toLowerCase()==='success' ? 'bg-green-100 text-green-800' :
                        (item.status||'').toLowerCase()==='pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}
