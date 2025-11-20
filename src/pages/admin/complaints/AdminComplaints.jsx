import React from 'react'
import Modal from '../../../components/Modal'
import { listComplaints, getComplaint, updateComplaintStatus, deleteComplaint, addComplaintResponse } from '../../../api/admin'
import { formatDateTime, getStatusLabel } from '../../../utils'

export default function AdminComplaints(){
  const [complaints, setComplaints] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [showDetailModal, setShowDetailModal] = React.useState(false)
  const [showResponseModal, setShowResponseModal] = React.useState(false)
  const [selectedComplaint, setSelectedComplaint] = React.useState(null)
  const [filter, setFilter] = React.useState({ page: 1, limit: 10, status: '' })
  const [pagination, setPagination] = React.useState(null)
  const [responseText, setResponseText] = React.useState('')

  React.useEffect(() => {
    loadComplaints()
  }, [filter])

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const res = await listComplaints(filter)
      setComplaints(res.complaints || [])
      setPagination(res.pagination)
    } catch (error) {
      console.error('Error loading complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = async (complaint) => {
    try {
      const fullComplaint = await getComplaint(complaint._id)
      setSelectedComplaint(fullComplaint)
      setShowDetailModal(true)
    } catch (error) {
      alert('حدث خطأ أثناء تحميل التفاصيل')
    }
  }

  const changeStatus = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus)
      await loadComplaints()
      alert('تم تحديث الحالة بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الحالة')
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشكوى؟')) return

    try {
      await deleteComplaint(id)
      setComplaints(complaints.filter(c => c._id !== id))
      alert('تم حذف الشكوى بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const submitResponse = async (e) => {
    e.preventDefault()
    if (!responseText.trim()) return

    try {
      await addComplaintResponse(selectedComplaint._id, responseText)
      setShowResponseModal(false)
      setResponseText('')
      await loadComplaints()
      alert('تم إضافة الرد بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الرد')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (category) => {
    const categories = {
      service: 'الخدمة',
      facility: 'المرافق',
      staff: 'الموظفين',
      billing: 'الفواتير',
      general: 'عام',
      other: 'أخرى'
    }
    return categories[category] || category
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة الشكاوى</h2>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in_progress">جاري المعالجة</option>
              <option value="resolved">تم الحل</option>
              <option value="closed">مغلق</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedComplaint(null)
        }}
        title="تفاصيل الشكوى"
        footer={(
          <button
            type="button"
            onClick={() => setShowDetailModal(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            إغلاق
          </button>
        )}
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع</label>
              <p className="text-gray-900">{selectedComplaint.subject}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <p className="text-gray-900">{getCategoryLabel(selectedComplaint.category)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
              <p className="text-gray-900">{selectedComplaint.clientId?.name || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <p className="text-gray-900">{formatDateTime(selectedComplaint.createdAt)}</p>
            </div>

            {selectedComplaint.response && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">الرد</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.response}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false)
          setResponseText('')
          setSelectedComplaint(null)
        }}
        title="إضافة رد على الشكوى"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setShowResponseModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              form="response-form"
              type="submit"
              className="btn-primary px-6 py-2 rounded"
            >
              إرسال الرد
            </button>
          </>
        )}
      >
        <form id="response-form" onSubmit={submitResponse}>
          <textarea
            value={responseText}
            onChange={e => setResponseText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="5"
            placeholder="اكتب ردك هنا..."
            required
          />
        </form>
      </Modal>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموضوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  لا توجد شكاوى
                </td>
              </tr>
            ) : (
              complaints.map(complaint => (
                <tr key={complaint._id}>
                  <td className="px-6 py-4 font-medium">
                    {complaint.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryLabel(complaint.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {complaint.clientId?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(complaint.status)}`}>
                      {getStatusLabel(complaint.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDateTime(complaint.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 space-x-reverse">
                    <button
                      onClick={() => viewDetails(complaint)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      عرض
                    </button>
                    {!complaint.response && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setShowResponseModal(true)
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        رد
                      </button>
                    )}
                    <select
                      value={complaint.status}
                      onChange={e => changeStatus(complaint._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="in_progress">جاري المعالجة</option>
                      <option value="resolved">تم الحل</option>
                      <option value="closed">مغلق</option>
                    </select>
                    <button
                      onClick={() => remove(complaint._id)}
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

