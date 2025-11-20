import React from 'react'
import Modal from '../../../components/Modal'
import { listTemplates, addTemplate, editTemplate, deleteTemplate, getTemplatesAddMeta, getTemplateEditMeta } from '../../../api/admin'

export default function AdminTemplates(){
  const [templates, setTemplates] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState(null)
  const [form, setForm] = React.useState({
    templateName: '',
    image: null,
    hallId: ''
  })
  const [imagePreview, setImagePreview] = React.useState(null)
  const [halls, setHalls] = React.useState([])

  React.useEffect(() => { 
    loadTemplates()
  }, [])

  React.useEffect(() => {
    const fetchMeta = async ()=>{
      try{ const meta = await getTemplatesAddMeta(); setHalls(meta?.halls || []) }catch{}
    }
    if(showForm && !editingTemplate) fetchMeta()
  }, [showForm, editingTemplate])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await listTemplates()
      // normalize
      setTemplates((res||[]).map(t=> ({
        id: t._id || t.id,
        templateName: t.templateName || t.name,
        imageUrl: t.imageUrl,
        hallId: typeof t.hallId === 'object' && t.hallId !== null ? t.hallId._id : t.hallId,
        hallName: typeof t.hallId === 'object' && t.hallId !== null ? t.hallId.name : '',
        isActive: t.isActive !== false
      })))
    } catch (error) { console.error('Error loading templates:', error) } finally { setLoading(false) }
  }

  const resetForm = () => { setForm({ templateName: '', image: null, hallId: '' }); setEditingTemplate(null); setShowForm(false); setImagePreview(null) }

  const handleEdit = async (template) => {
    setEditingTemplate(template)
    setShowForm(true)
    setImagePreview(
  template.imageUrl && template.imageUrl.startsWith('/uploads')
    ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, '')}${template.imageUrl}`
    : template.imageUrl
)
    try{
      const meta = await getTemplateEditMeta(template.id)
      setHalls(meta?.halls || [])
    }catch{}
    setForm({ templateName: template.templateName, image: null, hallId: template?.hallId?._id || template?.hallId || '' })
  }

  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) { setForm(prev => ({ ...prev, image: file })); const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result) }; reader.readAsDataURL(file) } }

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const formData = new FormData()
      formData.append('templateName', form.templateName)
      if(form.hallId) formData.append('hallId', form.hallId)
      if (form.image) formData.append('image', form.image)
      let response;
      if (editingTemplate) response = await editTemplate(editingTemplate.id, formData)
      else response = await addTemplate(formData)
      await loadTemplates();
      // تحديث معاينة الصورة مباشرة إذا كان الريسبونس يحتوي على imageUrl
      if (response?.newTemplate?.imageUrl) setImagePreview(response.newTemplate.imageUrl);
      resetForm();
      alert(editingTemplate ? 'تم تحديث القالب بنجاح' : 'تم إضافة القالب بنجاح')
    } catch (error) { alert('حدث خطأ: ' + error.message) } finally { setLoading(false) }
  }

  const remove = async (id) => { if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return; try { await deleteTemplate(id); setTemplates(templates.filter(t => t.id !== id)); alert('تم حذف القالب بنجاح') } catch (error) { alert('حدث خطأ أثناء الحذف') } }

  const toggleActive = async () => { alert('تفعيل/تعطيل القالب يتطلب باك—سيُفعل لاحقًا عند توفر المسار') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة قوالب الدعوات</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 rounded">{showForm ? 'إلغاء' : 'إضافة قالب جديد'}</button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingTemplate ? 'تعديل القالب' : 'إضافة قالب جديد'}
        footer={(
          <>
            <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">إلغاء</button>
            <button form="template-form" type="submit" disabled={loading} className="btn-primary px-6 py-2 rounded disabled:opacity-70">{loading ? 'جاري الحفظ...' : (editingTemplate ? 'تحديث القالب' : 'إضافة القالب')}</button>
          </>
        )}
      >
          <form id="template-form" onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم القالب *</label>
                <input type="text" value={form.templateName} onChange={e => setForm({...form, templateName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الصالة *</label>
                <select value={form.hallId} onChange={e=> setForm({...form, hallId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">اختر الصالة</option>
                  {halls.map(h=> (<option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة القالب *</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={!editingTemplate} />
              {imagePreview && (<img src={imagePreview} alt="معاينة" className="mt-3 w-32 h-32 object-cover rounded-lg border" />)}
            </div>

          </form>
      </Modal>

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="heading-gold text-lg font-semibold">قائمة القوالب</h3></div>
        {loading ? (
          <div className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : templates.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد قوالب مضافة بعد</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {templates.map(template => (
              <div key={template.id} className="card hover:shadow-md transition-shadow">
                {template.imageUrl && (
  <img
    src={
      template.imageUrl.startsWith('/uploads')
        ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, '')}${template.imageUrl}`
        : template.imageUrl
    }
    alt={template.templateName}
    className="w-full h-48 object-cover rounded-t-lg"
  />
)}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="heading-gold text-lg font-semibold">{template.templateName}</h4>
{template.hallName && (
  <div className="text-xs text-gray-500 mt-1">الصالة: {template.hallName}</div>
) }
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(template)} className="flex-1 btn-primary px-3 py-2 text-sm rounded">تعديل</button>
                    <button onClick={() => remove(template.id)} className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}