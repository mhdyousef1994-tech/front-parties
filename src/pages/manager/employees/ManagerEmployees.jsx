import React from 'react'
import Pagination from '../../../components/Pagination'
import { listStaff, addStaff, editStaff, deleteStaff } from '../../../api/manager'
import { formatSyrianDate } from '../../../utils/date'

export default function ManagerEmployees(){
  const [employees, setEmployees] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState(null)
  const [form, setForm] = React.useState({ name: '', phone: '', role: 'scanner', password: '', isActive: true })
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => { loadEmployees() }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const res = await listStaff()
      setEmployees((res||[]).map(s=> ({
        id: s._id || s.id,
        name: s.name,
        phone: s.phone,
        role: s.role,
        isActive: s.isActive !== false,
        lastLogin: s.lastLogin
      })))
    } catch (error) { console.error('Error loading employees:', error) } finally { setLoading(false) }
  }

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      role: 'scanner',
      password: '',
      isActive: true
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  const handleEdit = (employee) => {
    setForm({ name: employee.name, phone: employee.phone, role: employee.role, password: '', isActive: employee.isActive })
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (editingEmployee) await editStaff(editingEmployee.id, { name: form.name, phone: form.phone, role: form.role, password: form.password || undefined })
      else await addStaff({ name: form.name, phone: form.phone, password: form.password, role: form.role })
      await loadEmployees(); resetForm(); alert(editingEmployee ? 'تم تحديث الموظف بنجاح' : 'تم إضافة الموظف بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return
    
    try { await deleteStaff(id); await loadEmployees(); alert('تم حذف الموظف بنجاح') } catch (error) { alert('حدث خطأ أثناء الحذف') }
  }

  const toggleActive = async (employee) => {
    try {
      const updatedEmployee = { ...employee, isActive: !employee.isActive }
      setEmployees(prev => prev.map(emp => 
        emp.id === employee.id ? updatedEmployee : emp
      ))
      alert(updatedEmployee.isActive ? 'تم تفعيل الموظف' : 'تم تعطيل الموظف')
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الحالة')
    }
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      'manager': 'مدير صالة',
      'scanner': 'ماسح'
    }
    return roleLabels[role] || role
  }

  const getRoleColor = (role) => {
    const roleColors = {
      'manager': 'bg-blue-100 text-blue-800',
      'scanner': 'bg-green-100 text-green-800'
    }
    return roleColors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  // فلترة الموظفين لعرض فقط الذين لديهم الدور ماسح
  const filteredEmployees = employees.filter(emp => {
    // keep scanners by default like original behavior
    const roleOk = emp.role === 'scanner'
    const q = searchTerm.trim().toLowerCase()
    if (!q) return roleOk
    const name = (emp.name || '').toLowerCase()
    const phone = (emp.phone || '').toLowerCase()
    const role = (emp.role || '').toLowerCase()
    const status = emp.isActive ? 'نشط' : 'موقوف'
    return roleOk && (name.includes(q) || phone.includes(q) || role.includes(q) || status.includes(q))
  });
  React.useEffect(()=>{ setPage(1) }, [searchTerm, pageSize])
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize))
  const start = (page - 1) * pageSize
  const paginatedEmployees = filteredEmployees.slice(start, start + pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'إلغاء' : 'إضافة موظف جديد'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
          </h3>
          
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الموظف *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال * </label>
                <input type="tel" inputMode="numeric" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور *
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="scanner">ماسح</option>
                  <option value="manager">مدير صالة</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور {editingEmployee ? '' : '*'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingEmployee}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="mr-2 text-sm text-gray-700">مفعل</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? 'جاري الحفظ...' : (editingEmployee ? 'تحديث الموظف' : 'إضافة الموظف')}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">قائمة الموظفين</h3>
        </div>
        <div className="px-6 py-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input type="text" value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} placeholder="ابحث بالاسم/الجوال/الدور/الحالة" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد العناصر</label>
            <select value={pageSize} onChange={e=> setPageSize(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد موظفين مضافة بعد
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموظف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر دخول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.map(employee => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">{employee.phone}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                        {getRoleLabel(employee.role)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.isActive)}`}>
                        {employee.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.lastLogin ? formatSyrianDate(employee.lastLogin) : 'لم يسجل دخول'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          تعديل
                        </button>
                        
                        {employee.isActive ? (
                          <button
                            onClick={() => toggleActive(employee)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            تعطيل
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleActive(employee)}
                            className="text-green-600 hover:text-green-900"
                          >
                            تفعيل
                          </button>
                        )}
                        
                        <button
                          onClick={() => remove(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
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
              {paginatedEmployees.map(employee => (
                <div key={employee.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{employee.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="mr-3">
                        <div className="text-base font-semibold text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.phone}</div>
                        <div className="mt-1 flex gap-2 items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>{getRoleLabel(employee.role)}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.isActive)}`}>{employee.isActive ? 'نشط' : 'موقوف'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{employee.lastLogin ? formatSyrianDate(employee.lastLogin) : 'لم يسجل دخول'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <button onClick={() => handleEdit(employee)} className="text-blue-600">تعديل</button>
                      <button onClick={() => toggleActive(employee)} className="text-orange-600">{employee.isActive ? 'تعطيل' : 'تفعيل'}</button>
                      <button onClick={() => remove(employee.id)} className="text-red-600">حذف</button>
                    </div>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الموظفون النشطون</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employees.filter(emp => emp.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الماسحون</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employees.filter(emp => emp.role === 'scanner').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 