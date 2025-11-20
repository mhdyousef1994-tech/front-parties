import React from 'react'
import Modal from '../../../components/Modal'
import { listServices, addService, updateService, deleteService, toggleServiceStatus } from '../../../api/admin'
import { getServiceCategories } from '../../../api/services'
import { formatCurrency } from '../../../utils'

export default function AdminServices() {
  const [services, setServices] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [editingService, setEditingService] = React.useState(null)
  const [filter, setFilter] = React.useState({ category: '', page: 1, limit: 10 })
  const [pagination, setPagination] = React.useState(null)
  const [form, setForm] = React.useState({
    name: '',
    category: 'catering',
    basePrice: 0,
    description: ''
  })

  const categories = getServiceCategories()

  React.useEffect(() => {
    loadServices()
  }, [filter])

  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await listServices(filter)
      console.log('✅ Services loaded:', res)
      const servicesArray = Array.isArray(res.services) ? res.services : (res?.data || [])
      setServices(servicesArray)
      setPagination(res.pagination)
    } catch (error) {
      console.error('❌ Error loading services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      category: 'catering',
      basePrice: 0,
      description: ''
    })
    setEditingService(null)
    setShowForm(false)
  }

  const handleEdit = (service) => {
    setForm({
      name: service.name,
      category: service.category,
      basePrice: service.basePrice,
      description: service.description || ''
    })
    setEditingService(service)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingService) {
        await updateService(editingService._id, form)
      } else {
        await addService(form)
      }
      await loadServices()
      resetForm()
      alert(editingService ? 'تم تحديث الخدمة بنجاح' : 'تم إضافة الخدمة بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return

    try {
      await deleteService(id)
      setServices(services.filter(s => s._id !== id))
      alert('تم حذف الخدمة بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await toggleServiceStatus(id, !currentStatus)
      await loadServices()
    } catch (error) {
      alert('حدث خطأ أثناء تغيير الحالة')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة الخدمات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 rounded"
        >
          {showForm ? 'إلغاء' : 'إضافة خدمة جديدة'}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select
              value={filter.category}
              onChange={e => setFilter({ ...filter, category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
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
              form="service-form"
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 rounded disabled:opacity-70"
            >
              {loading ? 'جاري الحفظ...' : (editingService ? 'تحديث' : 'إضافة')}
            </button>
          </>
        )}
      >
        <form id="service-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الخدمة *
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
              الفئة *
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السعر الأساسي *
            </label>
            <input
              type="number"
              value={form.basePrice}
              onChange={e => setForm({ ...form, basePrice: +e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
        </form>
      </Modal>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  لا توجد خدمات
                </td>
              </tr>
            ) : (
              services.map(service => (
                <tr key={service._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categories.find(c => c.value === service.category)?.label || service.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(service.basePrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(service._id, service.isActive)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        service.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {service.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => remove(service._id)}
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

