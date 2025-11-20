import React from 'react'
import Modal from '../../../components/Modal'
import { listTransactions, addTransaction, updateTransaction, deleteTransaction, getTransactionTypes, getPaymentMethods } from '../../../api/financial'
import { formatCurrency, formatDateTime, getStatusLabel } from '../../../utils'

export default function AdminTransactions() {
  const [transactions, setTransactions] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [editingTransaction, setEditingTransaction] = React.useState(null)
  const [filter, setFilter] = React.useState({ page: 1, limit: 10 })
  const [pagination, setPagination] = React.useState(null)
  const [form, setForm] = React.useState({
    type: 'payment',
    amount: 0,
    paymentMethod: 'cash',
    description: '',
    eventId: '',
    invoiceId: ''
  })

  const transactionTypes = getTransactionTypes()
  const paymentMethods = getPaymentMethods()

  React.useEffect(() => {
    loadTransactions()
  }, [filter])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const res = await listTransactions(filter)
      setTransactions(res.transactions || [])
      setPagination(res.pagination)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      type: 'payment',
      amount: 0,
      paymentMethod: 'cash',
      description: '',
      eventId: '',
      invoiceId: ''
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const handleEdit = (transaction) => {
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      description: transaction.description || '',
      eventId: transaction.eventId?._id || '',
      invoiceId: transaction.invoiceId?._id || ''
    })
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, form)
      } else {
        await addTransaction(form)
      }
      await loadTransactions()
      resetForm()
      alert(editingTransaction ? 'تم تحديث المعاملة بنجاح' : 'تم إضافة المعاملة بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) return

    try {
      await deleteTransaction(id)
      setTransactions(transactions.filter(t => t._id !== id))
      alert('تم حذف المعاملة بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      payment: 'bg-green-100 text-green-800',
      refund: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
      expense: 'bg-orange-100 text-orange-800',
      revenue: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">المعاملات المالية</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 rounded"
        >
          {showForm ? 'إلغاء' : 'إضافة معاملة جديدة'}
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingTransaction ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
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
              form="transaction-form"
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 rounded disabled:opacity-70"
            >
              {loading ? 'جاري الحفظ...' : (editingTransaction ? 'تحديث' : 'إضافة')}
            </button>
          </>
        )}
      >
        <form id="transaction-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع المعاملة *
            </label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ *
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: +e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              طريقة الدفع *
            </label>
            <select
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
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

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
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
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  لا توجد معاملات
                </td>
              </tr>
            ) : (
              transactions.map(transaction => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDateTime(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                      {transactionTypes.find(t => t.value === transaction.type)?.label || transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {paymentMethods.find(m => m.value === transaction.paymentMethod)?.label || transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900 ml-3"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => remove(transaction._id)}
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

