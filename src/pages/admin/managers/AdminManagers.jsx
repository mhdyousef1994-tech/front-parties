import React from 'react'
import Pagination from '../../../components/Pagination'
import Modal from '../../../components/Modal'
import { listManagers, getManagersAddMeta, addManager, getManagerEditMeta, editManager, deleteManager } from '../../../api/admin'

export default function AdminManagers(){
  const [managers, setManagers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editing, setEditing] = React.useState(null)
  const [form, setForm] = React.useState({ name: '', phone: '', password: '', hallId: '' })
  const [halls, setHalls] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(()=>{ load() }, [])

  const load = async()=>{
    setLoading(true)
    try{
      const res = await listManagers()
      setManagers(res || [])
    }catch(e){
      // noop
    }finally{ setLoading(false) }
  }

  const openAdd = async()=>{
    setEditing(null)
    setForm({ name: '', phone: '', password: '', hallId: '' })
    setShowForm(true)
    try{ const meta = await getManagersAddMeta(); setHalls(meta?.halls || []) }catch{}
  }

  const openEdit = async(m)=>{
    setEditing(m)
    setForm({ name: m.name || '', phone: m.phone || '', password: '', hallId: m?.hallId?._id || m?.hallId || '' })
    setShowForm(true)
    try{ const meta = await getManagerEditMeta(m._id || m.id); setHalls(meta?.halls || []) }catch{}
  }

  const submit = async(e)=>{
    e.preventDefault()
    setLoading(true)
    try{
      if(editing) await editManager(editing._id || editing.id, form)
      else await addManager(form)
      await load(); setShowForm(false)
      alert(editing ? 'تم تعديل بيانات المدير بنجاح' : 'تم إضافة المدير بنجاح')
    }catch(err){ alert('فشل الحفظ') }
    finally{ setLoading(false) }
  }

  const remove = async(id)=>{
    if(!confirm('هل أنت متأكد من حذف هذا المدير؟')) return
    try{ await deleteManager(id); await load(); alert('تم حذف المدير بنجاح') }catch{ alert('فشل الحذف') }
  }

  const filteredManagers = managers.filter(m => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    const hallName = m?.hallId?.name || m?.hall?.name || ''
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.phone || m.mobile || '').toLowerCase().includes(q) ||
      hallName.toLowerCase().includes(q)
    )
  })
  React.useEffect(()=>{ setPage(1) }, [searchTerm, pageSize])
  const totalPages = Math.max(1, Math.ceil(filteredManagers.length / pageSize))
  const start = (page - 1) * pageSize
  const paginatedManagers = filteredManagers.slice(start, start + pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">إدارة المدراء</h2>
      </div>
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="heading-gold text-lg font-semibold">قائمة المدراء</h3></div>
        <div className="px-6 py-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input type="text" value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} placeholder="ابحث بالاسم/الجوال/الصالة" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          <div className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : managers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا يوجد مدراء</div>
        ) : (
          <div>
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجوال</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedManagers.map(m => (
                  <tr key={m.id || m._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{m.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{m.phone || m.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{m?.hallId?.name || m?.hall?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={()=> openEdit(m)} className="text-blue-700 hover:text-blue-900 ml-3">تعديل</button>
                      <button onClick={()=> remove(m._id || m.id)} className="text-red-600 hover:text-red-800">حذف</button>
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
              {paginatedManagers.map(m => (
                <div key={m.id || m._id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-base font-semibold text-gray-900">{m.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{m.phone || m.mobile}</div>
                      <div className="text-xs text-gray-500 mt-1">الصالة: {m?.hallId?.name || m?.hall?.name || '-'}</div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button onClick={()=> openEdit(m)} className="text-blue-700">تعديل</button>
                      <button onClick={()=> remove(m._id || m.id)} className="text-red-600">حذف</button>
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

      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary px-4 py-2 rounded">إضافة مدير</button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={()=> setShowForm(false)}
        title={editing ? 'تعديل مدير' : 'إضافة مدير'}
        footer={(
          <>
            <button type="button" onClick={()=> setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">إلغاء</button>
            <button form="manager-form" type="submit" className="btn-primary px-6 py-2 rounded">{editing ? 'تحديث' : 'إضافة'}</button>
          </>
        )}
      >
        <form id="manager-form" onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
              <input type="text" value={form.name} onChange={e=> setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال *</label>
              <input type="tel" inputMode="numeric" value={form.phone} onChange={e=> setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصالة *</label>
              <select value={form.hallId} onChange={e=> setForm({...form, hallId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">اختر الصالة</option>
                {halls.map(h=> (<option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور {editing ? '' : '*'}</label>
              <input type="password" value={form.password} onChange={e=> setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required={!editing} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

