import React from 'react'
import Modal from '../../../components/Modal'
import { listEmployees, addEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus, getDepartments, getPositions } from '../../../api/employees'
import { formatCurrency, formatDate } from '../../../utils'

export default function AdminEmployees() {
  const [employees, setEmployees] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState(null)
  const [filter, setFilter] = React.useState({ page: 1, limit: 10, department: '', isActive: '' })
  const [pagination, setPagination] = React.useState(null)
  const [form, setForm] = React.useState({
    name: '',
    position: 'waiter',
    department: 'service',
    phone: '',
    email: '',
    salary: 0,
    hireDate: '',
    hallId: ''
  })

  const departments = getDepartments()
  const positions = getPositions()

  React.useEffect(() => {
    loadEmployees()
  }, [filter])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const res = await listEmployees(filter)
      setEmployees(res.employees || [])
      setPagination(res.pagination)
    } catch (error) {
      console.error('Error loading employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      position: 'waiter',
      department: 'service',
      phone: '',
      email: '',
      salary: 0,
      hireDate: '',
      hallId: ''
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  const handleEdit = (employee) => {
    setForm({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      phone: employee.phone || '',
      email: employee.email || '',
      salary: employee.salary || 0,
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
      hallId: employee.hallId?._id || ''
    })
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, form)
      } else {
        await addEmployee(form)
      }
      await loadEmployees()
      resetForm()
      alert(editingEmployee ? 'تم تحديث الموظف بنجاح' : 'تم إضافة الموظف بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return

    try {
      await deleteEmployee(id)
      setEmployees(employees.filter(e => e._id !== id))
      alert('تم حذف الموظف بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await toggleEmployeeStatus(id, !currentStatus)
      await loadEmployees()
    } catch (error) {
      alert('حدث خطأ أثناء تغيير الحالة')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة الموظفين</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 rounded"
        >
          {showForm ? 'إلغاء' : 'إضافة موظف جديد'}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              القسم
            </label>
            <select
              value={filter.department}
              onChange={e => setFilter({ ...filter, department: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={filter.isActive}
              onChange={e => setFilter({ ...filter, isActive: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
        footer={(
          <>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              form="employee-form"
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 rounded disabled:opacity-70"
            >
              {loading ? 'جاري الحفظ...' : (editingEmployee ? 'تحديث' : 'إضافة')}
            </button>
          </>
        )}
      >
        <form id="employee-form" onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم *
              </label>
              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنصب *
              </label>
              <select
                value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الراتب *
              </label>
              <input
                type="number"
                value={form.salary}
                onChange={e => setForm({ ...form, salary: +e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ التوظيف *
            </label>
            <input
              type="date"
              value={form.hireDate}
              onChange={e => setForm({ ...form, hireDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنصب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الجوال</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الراتب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  لا يوجد موظفون
                </td>
              </tr>
            ) : (
              employees.map(employee => (
                <tr key={employee._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {departments.find(d => d.value === employee.department)?.label || employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {positions.find(p => p.value === employee.position)?.label || employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {formatCurrency(employee.salary || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(employee._id, employee.isActive)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        employee.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {employee.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => remove(employee._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setFilter({ ...filter, page })}
              className={`px-4 py-2 rounded ${
                filter.page === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

