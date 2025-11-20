import React from 'react'
import Modal from '../../../components/Modal'
import { listHalls, addHall, editHall, deleteHall, getHallEditMeta, listServices } from '../../../api/admin'

export default function AdminHalls(){
  const [halls, setHalls] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [editingHall, setEditingHall] = React.useState(null)
  const [availableServices, setAvailableServices] = React.useState([])
  const [form, setForm] = React.useState({
    name: '',
    location: '',
    capacity: 0,
    maxEmployees: 0,
    tables: 0,
    chairs: 0,
    defaultPrices: 0,
    description: '',
    amenities: [],
    services: [], // الخدمات المتاحة في الصالة
    images: [],
    managerName: '',
    managerPhone: '',
    managerPassword: ''
  })
  const [amenityInput, setAmenityInput] = React.useState('')
  const [imageFiles, setImageFiles] = React.useState([])

  React.useEffect(() => {
    loadHalls()
    loadServices()
  }, [])

  // Debug: طباعة form.services عند تغييره
  React.useEffect(() => {
    console.log('📋 Current form.services:', form.services)
  }, [form.services])

  const loadServices = async () => {
    try {
      const res = await listServices({ limit: 100 }) // جلب جميع الخدمات
      console.log('✅ Services loaded:', res)
      const servicesArray = Array.isArray(res.services) ? res.services : (res?.data || [])
      // فقط الخدمات النشطة
      setAvailableServices(servicesArray.filter(s => s.isActive !== false))
    } catch (error) {
      console.error('❌ Error loading services:', error)
      setAvailableServices([])
    }
  }

  const loadHalls = async () => {
    setLoading(true)
    try {
      const res = await listHalls()
      console.log('✅ Halls loaded:', res)
      // تأكد من أن النتيجة array
      const hallsArray = Array.isArray(res) ? res : (res?.halls || res?.data || [])
      setHalls(hallsArray)
    } catch (error) {
      console.error('❌ Error loading halls:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      })
      // لا تعرض alert إذا كان الخطأ بسبب عدم وجود Backend
      // فقط اترك الصفحة فارغة مع رسالة "لا توجد صالات"
      setHalls([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      capacity: 0,
      maxEmployees: 0,
      tables: 0,
      chairs: 0,
      defaultPrices: 0,
      description: '',
      amenities: [],
      services: [],
      images: [],
      managerName: '',
      managerPhone: '',
      managerPassword: ''
    })
    setAmenityInput('')
    setImageFiles([])
    setEditingHall(null)
    setShowForm(false)
  }

  const handleEdit = async (hall) => {
    // جلب بيانات القاعة الكاملة من السيرفر
    try {
      const res = await getHallEditMeta(hall._id)
      const fullHall = res.hall || hall
      // معالجة الخدمات - قد تكون array من objects أو array من IDs
      let servicesIds = []
      if (Array.isArray(fullHall.services)) {
        servicesIds = fullHall.services.map(service => {
          // إذا كانت object (populated)، استخرج الـ ID
          if (typeof service === 'object' && service !== null) {
            return String(service._id || service.id)
          }
          // إذا كانت string (ID فقط)، استخدمها مباشرة
          return String(service)
        }).filter(Boolean) // إزالة القيم الفارغة
      }

      console.log('✅ Editing hall:', {
        hallName: fullHall.name,
        rawServices: fullHall.services,
        extractedServiceIds: servicesIds,
        availableServicesCount: availableServices.length
      })

      setForm({
        name: fullHall.name || '',
        location: fullHall.location || '',
        capacity: fullHall.capacity || 0,
        maxEmployees: fullHall.maxEmployees || 0,
        tables: fullHall.tables || 0,
        chairs: fullHall.chairs || 0,
        defaultPrices: fullHall.defaultPrices || 0,
        description: fullHall.description || '',
        amenities: fullHall.amenities || [],
        services: servicesIds,
        images: fullHall.images || [],
        managerName: fullHall.generalManager?.name || '',
        managerPhone: fullHall.generalManager?.phone || '',
        managerPassword: ''
      })
      setEditingHall(fullHall)
      setShowForm(true)
    } catch (error) {
      console.error('❌ Error loading hall for edit:', error)
      alert('تعذر تحميل بيانات القاعة للتعديل')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    console.log('📤 Submitting hall with services:', form.services)

    try {
      // إذا كان هناك صور جديدة، استخدم FormData
      if (imageFiles.length > 0) {
        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('location', form.location)
        formData.append('capacity', form.capacity)
        formData.append('maxEmployees', form.maxEmployees)
        formData.append('tables', form.tables)
        formData.append('chairs', form.chairs)
        formData.append('defaultPrices', form.defaultPrices)
        formData.append('description', form.description)
        formData.append('amenities', JSON.stringify(form.amenities))
        formData.append('services', JSON.stringify(form.services))

        console.log('📤 Using FormData with services:', JSON.stringify(form.services))

        if (!editingHall) {
          formData.append('managerName', form.managerName)
          formData.append('managerPhone', form.managerPhone)
          formData.append('managerPassword', form.managerPassword)
        }

        // إضافة الصور
        imageFiles.forEach(file => {
          formData.append('images', file)
        })

        if (editingHall) await editHall(editingHall._id, formData)
        else await addHall(formData)
      } else {
        // استخدم JSON عادي
        console.log('📤 Using JSON with full form:', form)
        if (editingHall) await editHall(editingHall._id, form)
        else await addHall(form)
      }

      await loadHalls()
      resetForm()
      alert(editingHall ? 'تم تحديث الصالة بنجاح' : 'تم إضافة الصالة بنجاح')
    } catch (error) {
      alert('حدث خطأ: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm({...form, amenities: [...form.amenities, amenityInput.trim()]})
      setAmenityInput('')
    }
  }

  const removeAmenity = (index) => {
    setForm({...form, amenities: form.amenities.filter((_, i) => i !== index)})
  }

  const toggleService = (serviceId) => {
    // تحويل جميع IDs إلى strings للمقارنة
    const serviceIdStr = String(serviceId)
    const selectedIds = form.services.map(s => String(s))
    const isSelected = selectedIds.includes(serviceIdStr)

    if (isSelected) {
      // إزالة الخدمة
      const newServices = form.services.filter(id => String(id) !== serviceIdStr)
      console.log('🔴 Removed service:', serviceIdStr, '| Remaining:', newServices)
      setForm({...form, services: newServices})
    } else {
      // إضافة الخدمة
      const newServices = [...form.services, serviceIdStr]
      console.log('🟢 Added service:', serviceIdStr, '| Total:', newServices)
      setForm({...form, services: newServices})
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصالة؟')) return
    
    try {
      await deleteHall(id)
      setHalls(halls.filter(h => (h._id || h.id) !== id))
      alert('تم حذف الصالة بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }
 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة الصالات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 rounded"
        >
          {showForm ? 'إلغاء' : 'إضافة صالة جديدة'}
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingHall ? 'تعديل الصالة' : 'إضافة صالة جديدة'}
        footer={(
          <>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              form="hall-form"
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2 rounded disabled:opacity-70"
            >
              {loading ? 'جاري الحفظ...' : (editingHall ? 'تحديث الصالة' : 'إضافة الصالة')}
            </button>
          </>
        )}
      >
          <form id="hall-form" onSubmit={submit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الصالة *
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الصالة
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="وصف تفصيلي للصالة..."
              />
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعة (عدد الأشخاص) *
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={e => setForm({...form, capacity: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للموظفين *
                </label>
                <input
                  type="number"
                  value={form.maxEmployees}
                  onChange={e => setForm({...form, maxEmployees: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الطاولات *
                </label>
                <input
                  type="number"
                  value={form.tables}
                  onChange={e => setForm({...form, tables: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الكراسي *
                </label>
                <input
                  type="number"
                  value={form.chairs}
                  onChange={e => setForm({...form, chairs: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">السعر الافتراضي</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر الافتراضي
                </label>
                <input
                  type="number"
                  value={form.defaultPrices}
                  onChange={e => setForm({...form, defaultPrices: +e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">المرافق والخدمات</h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={e => setAmenityInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أضف مرفق (مثل: موقف سيارات، مكيفات...)"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  إضافة
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">الخدمات المتاحة في الصالة</h4>
              <p className="text-sm text-gray-600 mb-3">
                اختر الخدمات التي تقدمها هذه الصالة
              </p>

              {availableServices.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                  لا توجد خدمات متاحة. يرجى إضافة خدمات من صفحة الخدمات أولاً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableServices.map(service => {
                    const serviceId = String(service._id || service.id)

                    // تحويل جميع IDs في form.services إلى strings للمقارنة
                    const selectedIds = form.services.map(s => {
                      if (typeof s === 'object' && s !== null) {
                        return String(s._id || s.id)
                      }
                      return String(s)
                    })

                    const isSelected = selectedIds.includes(serviceId)

                    // Debug log
                    if (service.name === availableServices[0]?.name) {
                      console.log('🔍 Checking service:', {
                        serviceName: service.name,
                        serviceId,
                        selectedIds,
                        isSelected
                      })
                    }

                    return (
                      <label
                        key={serviceId}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(serviceId)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-600">
                            {service.basePrice ? `${service.basePrice.toLocaleString('ar-SY')} ل.س` : 'سعر غير محدد'}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}

              {form.services.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ تم اختيار {form.services.length} خدمة
                  </p>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">صور الصالة</h4>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imageFiles.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  تم اختيار {imageFiles.length} صورة
                </p>
              )}
            </div>

            {/* Remove wings UI (not needed for current API) */}

            {/* Manager Information */}
            {!editingHall && (
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">معلومات المدير العام</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المدير *
                    </label>
                    <input
                      type="text"
                      value={form.managerName}
                      onChange={e => setForm({...form, managerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم جوال المدير *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.managerPhone}
                      onChange={e => setForm({...form, managerPhone: e.target.value})}
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
                      value={form.managerPassword}
                      onChange={e => setForm({...form, managerPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

          </form>
      </Modal>

      {/* Halls List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="heading-gold text-lg font-semibold">قائمة الصالات</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : !Array.isArray(halls) || halls.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد صالات مضافة بعد
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {halls.map(hall => {
  // دعم اختلاف التسمية بين generalManager وmanager
  const manager = hall.generalManager || hall.manager || {};
  
    return (
    <div key={hall._id || hall.id} className="p-6 hover:bg-rose-50/40">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-semibold text-gray-900">{hall.name}</h4>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {hall.location}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
            <span>الطاولات: {hall.tables}</span>
            <span>الكراسي: {hall.chairs}</span>
            <span>السعر: <span className="font-bold text-green-700">{hall.defaultPrices ?? '-'}</span></span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            المدير: {manager.name ? (
              <>
                <span className="font-bold">{manager.name}</span>
                {manager.phone && <span> ({manager.phone})</span>}
              </>
            ) : <span className="italic">غير محدد</span>}
          </div>
          {hall.services && hall.services.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">الخدمات المتاحة:</div>
              <div className="flex flex-wrap gap-1">
                {hall.services.map((serviceId, idx) => {
                  const service = availableServices.find(s => s._id === serviceId)
                  return service ? (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                    >
                      {service.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(hall)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            تعديل
          </button>
          <button
            onClick={() => remove(hall._id || hall.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
})}
          </div>
        )}
      </div>
    </div>
  )
}
