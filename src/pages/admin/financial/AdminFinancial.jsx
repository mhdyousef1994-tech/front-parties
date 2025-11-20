import React from 'react'
import { getFinancialDashboard } from '../../../api/financial'
import { formatCurrency, formatDate } from '../../../utils'

export default function AdminFinancial() {
  const [dashboard, setDashboard] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [period, setPeriod] = React.useState('month')

  React.useEffect(() => {
    loadDashboard()
  }, [period])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await getFinancialDashboard({ period })
      setDashboard(data)
    } catch (error) {
      console.error('Error loading financial dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">لوحة التحكم المالية</h2>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="day">اليوم</option>
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
          <option value="year">هذا العام</option>
          <option value="all">الكل</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">إجمالي الإيرادات</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(dashboard?.totalRevenue || 0)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">إجمالي المصروفات</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(dashboard?.totalExpenses || 0)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">صافي الربح</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(dashboard?.netProfit || 0)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">المدفوعات المعلقة</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(dashboard?.pendingPayments || 0)}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {dashboard?.monthlyRevenue && dashboard.monthlyRevenue.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">الإيرادات الشهرية</h3>
          <div className="space-y-3">
            {dashboard.monthlyRevenue.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item.month}</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="#/admin/transactions"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-4xl mb-3">💰</div>
          <h3 className="text-lg font-semibold mb-2">المعاملات المالية</h3>
          <p className="text-sm text-gray-600">عرض وإدارة جميع المعاملات</p>
        </a>

        <a
          href="#/admin/invoices"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-lg font-semibold mb-2">الفواتير</h3>
          <p className="text-sm text-gray-600">إدارة الفواتير والمدفوعات</p>
        </a>

        <a
          href="#/admin/reports"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">التقارير المالية</h3>
          <p className="text-sm text-gray-600">تقارير تفصيلية ومخططات</p>
        </a>
      </div>
    </div>
  )
}

