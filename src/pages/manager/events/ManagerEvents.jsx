import React from 'react'
import { listManagerEvents, addManagerEvent, editManagerEvent, deleteManagerEvent, getManagerEventsBundle } from '../../../api/manager'
import { listServices } from '../../../api/services'
import { formatSyrianDate } from '../../../utils/date'

function timesOverlap(aStart, aEnd, bStart, bEnd){
  return aStart < bEnd && bStart < aEnd
}

export default function ManagerEvents(){
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingEvent, setEditingEvent] = React.useState(null)
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0])
  const [filter, setFilter] = React.useState('all')
  const [error, setError] = React.useState('')
  const [form, setForm] = React.useState({
    eventName: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    eventType: 'wedding',
    guestCount: 0,
    clientName: '',
    phone: '',
    password: '',
    templateId: '',
    services: [],
    notes: '',
    specialRequests: '',
    requiredEmployees: 0,
    playlist: '',
    status: 'scheduled'
  })
  const [templates, setTemplates] = React.useState([])
  const [staffList, setStaffList] = React.useState([])
  const [availableServices, setAvailableServices] = React.useState([])

  React.useEffect(() => {
    loadEvents()
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const res = await listServices({ limit: 100 })
      setAvailableServices(res.services || [])
    } catch (err) {
      console.error('فشل تحميل الخدمات:', err)
    }
  }

  const loadEvents = async () => {
    setLoading(true)
    try {
      const bundle = await getManagerEventsBundle()
      // دعم تعدد أسماء الحقول في الريسبونس
      const rawEvents = bundle?.events || bundle?.bookings || bundle?.reservations || []
      // تطبيع الحقول لتوافق جدول العرض
      const normalizedEvents = rawEvents.map(ev => ({
        id: ev._id || ev.id,
        eventName: ev.eventName,
        eventDate: ev.eventDate,
        startTime: ev.startTime,
        endTime: ev.endTime,
        eventType: ev.eventType,
        guestCount: ev.guestCount ?? ev.chairsCount ?? 0,
        clientName: ev.clientName || '',
        phone: ev.phone || ev.clientPhone || '',
        templateId: ev.templateId?._id || ev.templateId || '',
        services: ev.services || [],
        notes: ev.notes || '',
        specialRequests: ev.specialRequests || '',
        requiredEmployees: ev.requiredEmployees || 0,
        playlist: ev.playlist || '',
        status: ev.status || 'scheduled',
      }))
      setEvents(normalizedEvents)
      setTemplates(bundle?.templates || [])
      setStaffList(bundle?.staff || bundle?.employees || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      eventName: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      eventType: 'wedding',
      guestCount: 0,
      clientName: '',
      phone: '',
      password: '',
      templateId: '',
      services: [],
      notes: '',
      specialRequests: '',
      requiredEmployees: 0,
      playlist: '',
      status: 'scheduled'
    })
    setEditingEvent(null)
    setShowForm(false)
    setError('')
  }

  const handleEdit = (event) => {
    // تطبيع التاريخ لصيغة YYYY-MM-DD
    let eventDate = event.eventDate || '';
    if (eventDate && eventDate.length > 10) {
      eventDate = eventDate.slice(0, 10);
    }
    console.log('Editing event:', event, 'Normalized eventDate:', eventDate);

    // تحويل services إلى البنية الصحيحة {service, price, quantity}
    const normalizedServices = (event.services || []).map(s => {
      if (typeof s === 'object' && s.service) {
        // البيانات من Backend بالفعل بالبنية الصحيحة
        return {
          service: s.service?._id || s.service,
          price: s.price || 0,
          quantity: s.quantity || 1
        }
      } else {
        // البيانات قديمة أو مجرد IDs
        return {
          service: s._id || s,
          price: 0,
          quantity: 1
        }
      }
    })

    setForm({
      eventName: event.eventName || '',
      eventDate: eventDate,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      eventType: event.eventType || 'wedding',
      guestCount: event.guestCount ?? event.chairsCount ?? 0,
      clientName: event.clientName || '',
      phone: event.phone || '',
      password: '', // لا نعرض كلمة المرور عند التعديل
      templateId: event.templateId || '',
      services: normalizedServices,
      notes: event.notes || '',
      specialRequests: event.specialRequests || '',
      requiredEmployees: event.requiredEmployees || 0,
      playlist: event.playlist || '',
      status: event.status || 'scheduled',
    })
    setEditingEvent(event)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editingEvent) {
        await editManagerEvent(editingEvent.id, form)
      } else {
        await addManagerEvent(form)
      }
      await loadEvents()
      resetForm()
      alert(editingEvent ? 'تم تحديث الحجز بنجاح' : 'تم إضافة الحجز بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return

    try {
      await deleteManagerEvent(id)
      setEvents(events.filter(x => x.id !== id))
      alert('تم حذف الحجز بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  // إضافة خدمة جديدة للحجز
  const addServiceToEvent = () => {
    setForm({
      ...form,
      services: [...form.services, { service: '', price: 0, quantity: 1 }]
    })
  }

  // حذف خدمة من الحجز
  const removeServiceFromEvent = (index) => {
    setForm({
      ...form,
      services: form.services.filter((_, i) => i !== index)
    })
  }

  // تحديث خدمة في الحجز
  const updateServiceInEvent = (index, field, value) => {
    const updatedServices = [...form.services]

    // إذا تم تغيير الخدمة، نضع السعر الافتراضي تلقائياً
    if (field === 'service') {
      // التحقق من عدم تكرار الخدمة
      const isDuplicate = form.services.some((s, i) => i !== index && s.service === value)
      if (isDuplicate && value) {
        alert('هذه الخدمة مضافة بالفعل! يرجى اختيار خدمة أخرى أو تعديل الكمية في الخدمة الموجودة.')
        return
      }

      const selectedService = availableServices.find(s => s._id === value)
      updatedServices[index] = {
        ...updatedServices[index],
        service: value,
        price: selectedService?.basePrice || 0
      }
    } else {
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value
      }
    }

    setForm({
      ...form,
      services: updatedServices
    })
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const statusLabels = {
      'scheduled': 'في الانتظار', 'confirmed': 'مؤكد', 'cancelled': 'ملغي', 'completed': 'مكتمل'

    }
    return statusLabels[status] || status
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

  // فلترة حسب حالتين فقط: مجدولة أو ملغية
  const filteredEvents = events.filter(event => {
    const status = event.status 
    const matchesFilter = filter === 'all' || status === filter
    const eventDay = event.eventDate ? event.eventDate.substring(0, 10) : ''
    const matchesDate = !selectedDate || eventDay === selectedDate
    return matchesFilter && matchesDate
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الحجوزات</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {showForm ? 'إلغاء' : 'إضافة حجز جديد'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">جميع الحالات</option>
              <option value="scheduled">في الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="cancelled">ملغي</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>
        </div>
        {error && <div className='mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>{error}</div>}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingEvent ? 'تعديل الحجز' : 'إضافة حجز جديد'}
          </h3>
          
          <form onSubmit={submit} className="space-y-6">
            {/* Event Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الفعالية *
                </label>
                <input
                  type="text"
                  value={form.eventName}
                  onChange={e => setForm({...form, eventName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الفعالية *
                </label>
                <select
                  value={form.eventType}
                  onChange={e => setForm({...form, eventType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر نوع الفعالية</option>
                  <option value="wedding">زفاف</option>
                  <option value="engagement">خطوبة</option>
                  <option value="birthday">عيد ميلاد</option>
                  <option value="graduation">تخرج</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الفعالية *
                </label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm({...form, eventDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وقت البداية *
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm({...form, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وقت النهاية *
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm({...form, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Guest Count and Required Employees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الضيوف *
                </label>
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={e => setForm({...form, guestCount: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الموظفين المطلوبين
                </label>
                <input
                  type="number"
                  value={form.requiredEmployees}
                  onChange={e => setForm({...form, requiredEmployees: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            {/* Client Information */}
            {!editingEvent && (
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">معلومات العميل</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم العميل *
                    </label>
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={e => setForm({...form, clientName: e.target.value})}
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
                      inputMode="numeric"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور *
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">القالب</label>
              <select
                value={form.templateId}
                onChange={e => setForm({...form, templateId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">بدون قالب</option>
                {templates.map(t => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.templateName || t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Services - Multi-select with price and quantity */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  الخدمات المطلوبة
                  <span className="text-xs text-gray-500 mr-2">
                    ({form.services.filter(s => s.service).length} من {availableServices.length})
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addServiceToEvent}
                  disabled={form.services.filter(s => s.service).length >= availableServices.length}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    form.services.filter(s => s.service).length >= availableServices.length
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  title={
                    form.services.filter(s => s.service).length >= availableServices.length
                      ? 'تم إضافة جميع الخدمات المتاحة'
                      : 'إضافة خدمة جديدة'
                  }
                >
                  + إضافة خدمة
                </button>
              </div>

              {/* رسالة عند إضافة جميع الخدمات */}
              {form.services.filter(s => s.service).length >= availableServices.length && availableServices.length > 0 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ℹ️ تم إضافة جميع الخدمات المتاحة ({availableServices.length} خدمة)
                </div>
              )}

              {form.services.length === 0 ? (
                <p className="text-sm text-gray-500 italic">لا توجد خدمات مضافة</p>
              ) : (
                <div className="space-y-3">
                  {form.services.map((serviceItem, index) => {
                    const isServiceEmpty = !serviceItem.service
                    return (
                      <div
                        key={index}
                        className={`flex gap-2 items-start p-3 rounded-md ${
                          isServiceEmpty ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          {/* Service Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              الخدمة {isServiceEmpty && <span className="text-red-600">*</span>}
                            </label>
                            <select
                              value={serviceItem.service}
                              onChange={e => updateServiceInEvent(index, 'service', e.target.value)}
                              className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 ${
                                isServiceEmpty
                                  ? 'border-red-300 focus:ring-red-500'
                                  : 'border-gray-300 focus:ring-blue-500'
                              }`}
                            >
                            <option value="">اختر خدمة</option>
                            {availableServices.map(s => {
                              // التحقق إذا كانت الخدمة مضافة بالفعل
                              const isAlreadyAdded = form.services.some((srv, i) => i !== index && srv.service === s._id)
                              return (
                                <option
                                  key={s._id}
                                  value={s._id}
                                  disabled={isAlreadyAdded}
                                  style={isAlreadyAdded ? { color: '#999', fontStyle: 'italic' } : {}}
                                >
                                  {s.name} - {s.basePrice?.toLocaleString() || 0} ل.س
                                  {isAlreadyAdded ? ' (مضافة بالفعل)' : ''}
                                </option>
                              )
                            })}
                          </select>
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            السعر (قابل للتعديل)
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={serviceItem.price}
                              onChange={e => updateServiceInEvent(index, 'price', +e.target.value)}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              placeholder="السعر"
                            />
                            {serviceItem.service && (() => {
                              const selectedService = availableServices.find(s => s._id === serviceItem.service)
                              const basePrice = selectedService?.basePrice || 0
                              if (basePrice > 0 && serviceItem.price !== basePrice) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => updateServiceInEvent(index, 'price', basePrice)}
                                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    title={`إعادة للسعر الأصلي: ${basePrice.toLocaleString()} ل.س`}
                                  >
                                    ↻
                                  </button>
                                )
                              }
                            })()}
                          </div>
                          {serviceItem.service && (() => {
                            const selectedService = availableServices.find(s => s._id === serviceItem.service)
                            const basePrice = selectedService?.basePrice || 0
                            if (basePrice > 0 && serviceItem.price !== basePrice) {
                              return (
                                <div className="text-xs text-gray-500 mt-1">
                                  السعر الأصلي: {basePrice.toLocaleString()} ل.س
                                </div>
                              )
                            }
                          })()}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            الكمية
                          </label>
                          <input
                            type="number"
                            value={serviceItem.quantity}
                            onChange={e => updateServiceInEvent(index, 'quantity', +e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeServiceFromEvent(index)}
                        className="mt-6 px-2 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="حذف الخدمة"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
                </div>
              )}

              {/* Total Price */}
              {form.services.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                  <strong>إجمالي الخدمات:</strong>{' '}
                  {form.services.reduce((sum, s) => sum + (s.price * s.quantity), 0).toLocaleString()} ل.س
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طلبات خاصة
              </label>
              <textarea
                value={form.specialRequests}
                onChange={e => setForm({...form, specialRequests: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Playlist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قائمة التشغيل
              </label>
              <input
                type="text"
                value={form.playlist}
                onChange={e => setForm({...form, playlist: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="رابط قائمة التشغيل"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <select
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">في الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>

            {/* Old Client Information Section - Removed since we now use clientId dropdown */}



            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? 'جاري الحفظ...' : (editingEvent ? 'تحديث الحجز' : 'إضافة الحجز')}
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

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">قائمة الحجوزات</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد حجوزات
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    الفعالية
                  </th>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    التاريخ والوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    عدد الضيوف
                  </th>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    الخدمات
                  </th>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xl font-semibold text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.eventName}</div>
                        <div className={`text-sm text-gray-600 ${getEventColor(event.eventType)}`}> {getEventLabel(event.eventType)}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.clientName}</div>
                        <div className="text-sm text-gray-500">{event.phone}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{formatSyrianDate(event.eventDate)}</div>
                        <div className="text-sm text-gray-500">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.guestCount} ضيف
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {event.services && event.services.length > 0 ? (
                          <div className="space-y-1">
                            {event.services.map((s, idx) => {
                              const serviceName = s.service?.name || availableServices.find(as => as._id === s.service)?.name || 'خدمة'
                              return (
                                <div key={idx} className="text-xs">
                                  {serviceName} ({s.quantity}x {s.price?.toLocaleString()} ل.س)
                                </div>
                              )
                            })}
                            <div className="text-xs font-bold text-green-700 mt-1">
                              المجموع: {event.services.reduce((sum, s) => sum + (s.price * s.quantity), 0).toLocaleString()} ل.س
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">لا توجد خدمات</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          تعديل
                        </button>
                        
                        <button
                          onClick={() => remove(event.id)}
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
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الحجوزات</p>
              <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
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
              <p className="text-sm font-medium text-gray-600">الحجوزات المجدولة</p>
              <p className="text-2xl font-semibold text-gray-900">{events.filter(e => e.status !== 'cancelled').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الحجوزات الملغية</p>
              <p className="text-2xl font-semibold text-gray-900">{events.filter(e => e.status === 'cancelled').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الكراسي</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.reduce((sum, e) => sum + e.chairsCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}