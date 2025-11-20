import React from 'react'
import Modal from '../../../components/Modal'
import { listInvoices, addInvoice, updateInvoice, deleteInvoice, getInvoiceStatuses, getInvoiceTypes, recordPayment } from '../../../api/financial'
import { formatCurrency, formatDate, getStatusLabel } from '../../../utils'
import { generateInvoicePDF } from '../../../utils/pdf'

export default function AdminInvoices() {
  const [invoices, setInvoices] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [editingInvoice, setEditingInvoice] = React.useState(null)
  const [selectedInvoice, setSelectedInvoice] = React.useState(null)
  const [filter, setFilter] = React.useState({ page: 1, limit: 10 })
  const [pagination, setPagination] = React.useState(null)
  const [form, setForm] = React.useState({
    clientId: '',
    eventId: '',
    items: [],
    dueDate: '',
    notes: ''
  })
  const [paymentForm, setPaymentForm] = React.useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  })
  const [itemForm, setItemForm] = React.useState({
    description: '',
    quantity: 1,
    unitPrice: 0
  })

  const invoiceStatuses = getInvoiceStatuses()
  const invoiceTypes = getInvoiceTypes()

  React.useEffect(() => {
    loadInvoices()
  }, [filter])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await listInvoices(filter)
      setInvoices(res.invoices || [])
      setPagination(res.pagination)
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      clientId: '',
      eventId: '',
      items: [],
      dueDate: '',
      notes: ''
    })
    setItemForm({
      description: '',
      quantity: 1,
      unitPrice: 0
    })
    setEditingInvoice(null)
    setShowForm(false)
  }

  const addItem = () => {
    if (itemForm.description && itemForm.quantity > 0 && itemForm.unitPrice >= 0) {
      const total = itemForm.quantity * itemForm.unitPrice
      setForm({
        ...form,
        items: [...form.items, { ...itemForm, total }]
      })
      setItemForm({
        description: '',
        quantity: 1,
        unitPrice: 0
      })
    }
  }

  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice._id, form)
      } else {
        await addInvoice(form)
      }
      await loadInvoices()
      resetForm()
      alert(editingInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تم إضافة الفاتورة بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return

    try {
      await deleteInvoice(id)
      setInvoices(invoices.filter(inv => inv._id !== id))
      alert('تم حذف الفاتورة بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await recordPayment(selectedInvoice._id, paymentForm)
      await loadInvoices()
      setShowPaymentModal(false)
      setSelectedInvoice(null)
      setPaymentForm({ amount: 0, paymentMethod: 'cash', notes: '' })
      alert('تم تسجيل الدفعة بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async (invoice) => {
    try {
      await generateInvoicePDF(invoice)
    } catch (error) {
      alert('حدث خطأ أثناء تحميل PDF')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-purple-100 text-purple-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.total, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">الفواتير</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 rounded"
        >
          {showForm ? 'إلغاء' : 'إضافة فاتورة جديدة'}
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingInvoice ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}
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
              form="invoice-form"
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 rounded disabled:opacity-70"
            >
              {loading ? 'جاري الحفظ...' : (editingInvoice ? 'تحديث' : 'إضافة')}
            </button>
          </>
        )}
      >
        <form id="invoice-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الاستحقاق *
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Items */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">البنود</h4>
            
            {/* Add Item Form */}
            <div className="grid grid-cols-12 gap-2 mb-3">
              <input
                type="text"
                value={itemForm.description}
                onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="الوصف"
                className="col-span-5 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                value={itemForm.quantity}
                onChange={e => setItemForm({ ...itemForm, quantity: +e.target.value })}
                placeholder="الكمية"
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
              <input
                type="number"
                value={itemForm.unitPrice}
                onChange={e => setItemForm({ ...itemForm, unitPrice: +e.target.value })}
                placeholder="السعر"
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
              <button
                type="button"
                onClick={addItem}
                className="col-span-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                إضافة
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {form.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            {form.items.length > 0 && (
              <div className="mt-4 text-left font-bold text-lg">
                الإجمالي: {formatCurrency(calculateTotal())}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedInvoice(null)
          setPaymentForm({ amount: 0, paymentMethod: 'cash', notes: '' })
        }}
        title="تسجيل دفعة"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              form="payment-form"
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 rounded disabled:opacity-70"
            >
              {loading ? 'جاري الحفظ...' : 'تسجيل الدفعة'}
            </button>
          </>
        )}
      >
        <form id="payment-form" onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ *
            </label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={e => setPaymentForm({ ...paymentForm, amount: +e.target.value })}
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
              value={paymentForm.paymentMethod}
              onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="cash">نقدي</option>
              <option value="card">بطاقة</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="check">شيك</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={paymentForm.notes}
              onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
        </form>
      </Modal>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفاتورة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدفوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الاستحقاق</th>
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
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  لا توجد فواتير
                </td>
              </tr>
            ) : (
              invoices.map(invoice => (
                <tr key={invoice._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {invoice.invoiceNumber || invoice._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.clientId?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {formatCurrency(invoice.totalAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    {formatCurrency(invoice.paidAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 space-x-reverse">
                    <button
                      onClick={() => downloadPDF(invoice)}
                      className="text-green-600 hover:text-green-900"
                      title="تحميل PDF"
                    >
                      📄
                    </button>
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setPaymentForm({
                            amount: (invoice.totalAmount || 0) - (invoice.paidAmount || 0),
                            paymentMethod: 'cash',
                            notes: ''
                          })
                          setShowPaymentModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        دفع
                      </button>
                    )}
                    <button
                      onClick={() => remove(invoice._id)}
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

