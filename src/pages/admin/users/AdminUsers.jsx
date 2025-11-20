import React from 'react'
import Pagination from '../../../components/Pagination'
import { listUsers, activateUser, deactivateUser, deleteUser } from '../../../api/admin'
import { formatSyrianDate } from '../../../utils/date'

export default function AdminUsers(){
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => { 
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await listUsers()
      setUsers(res)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (userId) => {
    try {
      await activateUser(userId)
      await loadUsers()
      alert('تم تفعيل المستخدم بنجاح')
    } catch (error) {
      console.log('API Error (activate):', error.response?.data || error)
      alert('حدث خطأ أثناء التفعيل')
    }
  }

  const handleDeactivate = async (userId) => {
    try {
      await deactivateUser(userId)
      await loadUsers()
      alert('تم تعطيل المستخدم بنجاح')
    } catch (error) {
      console.log('API Error (deactivate):', error.response?.data || error)
      alert('حدث خطأ أثناء التعطيل')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    
    try {
      await deleteUser(userId)
      await loadUsers()
      alert('تم حذف المستخدم بنجاح')
    } catch (error) {
      console.log('API Error (delete):', error.response?.data || error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      'admin': 'مدير التطبيق',
      'manager': 'مدير صالة',
      'scanner': 'ماسح',
      'client': 'عميل'
    }
    return roleLabels[role] || role
  }

  const getRoleColor = (role) => {
    const roleColors = {
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-blue-100 text-blue-800',
      'scanner': 'bg-green-100 text-green-800',
      'client': 'bg-gray-100 text-gray-800'
    }
    return roleColors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // reset to first page when filters change
  React.useEffect(() => { setPage(1) }, [filter, searchTerm, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedUsers = filteredUsers.slice(start, end)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة المستخدمين</h2>
        <div className="text-sm text-gray-500">
          إجمالي المستخدمين: {users.length}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث
            </label>
            <input
              type="text"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدور
            </label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأدوار</option>
              <option value="admin">مدير التطبيق</option>
              <option value="manager">مدير صالة</option>
              <option value="scanner">ماسح</option>
              <option value="client">عميل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد العناصر في الصفحة</label>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="heading-gold text-lg font-semibold">قائمة المستخدمين</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد نتائج
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر دخول
                  </th> */}
                  {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'بدون اسم'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phone || 'بدون رقم جوال'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatSyrianDate(user.lastLogin) : 'لم يسجل دخول'}
                    </td> */}
                    
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user._id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            تعطيل
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            تفعيل
                          </button>
                        )}
                        
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-100">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {paginatedUsers.map(user => (
                <div key={user._id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                      <div className="mr-3">
                        <div className="text-base font-semibold text-gray-900">{user.name || 'بدون اسم'}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'بدون رقم جوال'}</div>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'نشط' : 'موقوف'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>{getRoleLabel(user.role)}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </div>
        )}
        </div>
      <div className="mr-4">
        <p className="text-sm font-medium text-gray-600">آخر تسجيل دخول</p>
        <p className="text-sm font-semibold text-gray-900">
          {users.length > 0 ? 
            new Date(Math.max(...users.map(u => u.lastLogin || 0))).toLocaleDateString('ar-SA') : 
            'لا يوجد'
          }
        </p>
      </div>
    </div>
  )
}
