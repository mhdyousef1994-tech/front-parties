import React from 'react'
import { listTemplatesManager, addTemplateManager, editTemplateManager, deleteTemplateManager } from '../../../api/manager'

// استخدم عنوان الباكند أو عنوان الموقع الحالي
const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin;

export default function ManagerTemplates(){
  const [templates, setTemplates] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState(null)
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    image: null,
    isActive: true,
    fields: []
  })
  const [imagePreview, setImagePreview] = React.useState(null)

  React.useEffect(() => { 
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await listTemplatesManager()
      setTemplates((res||[]).map(t=> ({
        id: t._id || t.id,
        name: t.templateName || t.name,
        description: t.description,
        imageUrl: t.imageUrl,
        isActive: t.isActive !== false,
        fields: t.fields || []
      })))
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      image: null,
      isActive: true,
      fields: []
    })
    setEditingTemplate(null)
    setShowForm(false)
    setImagePreview(null)
  }

  const handleEdit = (template) => {
    setForm({
      name: template.name,
      description: template.description,
      image: null,
      isActive: template.isActive,
      fields: template.fields || []
    })
    setEditingTemplate(template)
    setShowForm(true)
    setImagePreview(template.imageUrl)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addField = () => {
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', type: 'text', required: false, label: '' }]
    }))
  }

  const removeField = (index) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const updateField = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const fd = new FormData()
      fd.append('templateName', form.name)
      if (form.image) fd.append('image', form.image)
      if (editingTemplate) await editTemplateManager(editingTemplate.id, fd)
      else await addTemplateManager(fd)
      await loadTemplates(); resetForm(); alert(editingTemplate ? 'تم تحديث القالب بنجاح' : 'تم إضافة القالب بنجاح')
    } catch (error) {
      console.log('API Error:', error.response?.data || error)
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return
    
    try { await deleteTemplateManager(id); await loadTemplates(); alert('تم حذف القالب بنجاح') } catch (error) { alert('حدث خطأ أثناء الحذف') }
  }

  // تم إزالة إجراء التفعيل/التعطيل بناءً على الطلب

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة قوالب الدعوات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'إلغاء' : 'إضافة قالب جديد'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTemplate ? 'تعديل القالب' : 'إضافة قالب جديد'}
          </h3>
          
          <form onSubmit={submit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم القالب *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* حقول وصف القالب والحالة غير مطلوبة للربط وتمت إزالتها */}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة القالب
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {imagePreview && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معاينة الصورة:
                  </label>
                  <img 
                    src={imagePreview?.startsWith('/') ? `${API_BASE}${imagePreview}` : imagePreview} 
                    alt="معاينة" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* حقول مخصصة غير مطلوبة وتمت إزالتها */}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? 'جاري الحفظ...' : (editingTemplate ? 'تحديث القالب' : 'إضافة القالب')}
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

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">قائمة القوالب</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد قوالب مضافة بعد
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">

{templates.map(template => (
  <div key={template.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
    {template.imageUrl && (
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={template.imageUrl.startsWith('/') ? `${API_BASE}${template.imageUrl}` : template.imageUrl}
          alt={template.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>
    )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.isActive ? 'مفعل' : 'معطل'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description || 'لا يوجد وصف'}
                  </p>
                  
                  {template.fields && template.fields.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">الحقول: {template.fields.length}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      تعديل
                    </button>
                    
                    <button
                      onClick={() => remove(template.id)}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي القوالب</p>
              <p className="text-2xl font-semibold text-gray-900">{templates.length}</p>
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
              <p className="text-sm font-medium text-gray-600">القوالب المفعلة</p>
              <p className="text-2xl font-semibold text-gray-900">
                {templates.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الحقول</p>
              <p className="text-2xl font-semibold text-gray-900">
                {templates.reduce((sum, t) => sum + (t.fields?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 