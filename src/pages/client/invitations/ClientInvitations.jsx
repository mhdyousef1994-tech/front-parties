import React from 'react'
import { listInvitations, deleteInvitation } from '../../../api/client'



export default function ClientInvitations(){
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('all') // all | used | available
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => { loadInvitations() }, [])

  const loadInvitations = async () => {
    setLoading(true)
    try {
      const res = await listInvitations()
      // API returns { invitations: [...] } or array fallback via api layer
      const list = Array.isArray(res) ? res : (res?.invitations || [])
      setItems(list)
    } catch (error) {
      console.error('Error loading invitations:', error)
      setItems([])
    } finally { setLoading(false) }
  }

  const remove = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدعوة؟')) return;
    try {
      await deleteInvitation(id);
      setItems(items.filter(x => (x._id || x.id) !== id));
      alert('تم حذف الدعوة بنجاح')
    } catch (error) {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  // مشتقات الفلترة والصفحات
  const norm = (v)=> (v??'').toString().toLowerCase().trim()
  const filtered = React.useMemo(()=>{
    const q = norm(query)
    return items.filter(i=>{
      const txt = `${norm(i.guestName)} ${norm(i.notes)}`
      const used = !!(i.used ?? i.isUsed)
      const matchTxt = !q || txt.includes(q)
      const matchStatus = status==='all' ? true : (status==='used' ? used : !used)
      return matchTxt && matchStatus
    })
  }, [items, query, status])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  // إعادة الصفحة للأولى عند تغيّر الفلاتر أو حجم الصفحة
  React.useEffect(()=>{ setPage(1) }, [query, status, pageSize])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-gold text-2xl font-bold">قائمة الدعوات</h2>
        <a href="/client/invitations/add" className="btn-primary px-4 py-2 rounded">إضافة دعوة</a>
      </div>


      {/* Invitations List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="heading-gold text-lg font-semibold">قائمة الدعوات</h3>
        </div>
        {/* فلاتر البحث */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="ابحث بالاسم أو الملاحظات..."
              value={query}
              onChange={e=>setQuery(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <select
              value={status}
              onChange={e=>setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            >
              <option value="all">كل الحالات</option>
              <option value="available">متاح</option>
              <option value="used">مستخدم</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">لكل صفحة:</label>
              <select
                value={pageSize}
                onChange={e=>setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-2 bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="spinner animate-spin rounded-full h-8 w-8 border-2 mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد دعوات منشأة بعد
          </div>
        ) : (
          filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500">لا توجد نتائج مطابقة للبحث/الفلتر</div>
          ) : (
          <div>
           <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/60">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدعو
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عدد الضيوف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paged.map(invitation => (
                  <tr key={invitation._id || invitation.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invitation.guestName}</div>
                        <div className="text-sm text-gray-500">
                          {invitation.notes && invitation.notes.length > 0 ? invitation.notes : 'لا توجد ملاحظات'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invitation.numOfPeople ?? invitation.guests} ضيف
                    </td>
                    
                    
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (invitation.used ?? invitation.isUsed) ? 'bg-red-100 text-red-800' : 'badge-gold'
                      }`}>
                        {(invitation.used ?? invitation.isUsed) ? 'مستخدم' : 'متاح'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* زر التعديل والطباعة */}
                        <a
                          href={`/client/invitations/edit/${invitation._id || invitation.id}`}
                          className="text-orange-600 hover:text-orange-800 mr-2"
                          title="تعديل الدعوة"
                        >
                          تعديل
                        </a>
                        <a
                          href={`/client/invitations/${invitation._id || invitation.id}`}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          title="طباعة الدعوة"
                          target="_blank"
                        >
                          طباعة
                        </a>
                        <button
                          onClick={() => remove(invitation._id || invitation.id)}
                          className="text-red-600 hover:text-red-800"
                          title="حذف الدعوة"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* شريط الصفحات */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                عرض {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)} من {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={()=>setPage(p=>Math.max(1, p-1))}
                >السابق</button>
                <span className="text-sm">{currentPage} / {totalPages}</span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={()=>setPage(p=>Math.min(totalPages, p+1))}
                >التالي</button>
              </div>
            </div>
          </div>

          {/* Mobile cards view */}
          <div className="md:hidden">
            <div className="space-y-3 px-4 py-3">
              {paged.map(invitation => (
                <div key={invitation._id || invitation.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-base font-semibold text-gray-900">{invitation.guestName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {invitation.notes && invitation.notes.length > 0 ? invitation.notes : 'لا توجد ملاحظات'}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (invitation.used ?? invitation.isUsed) ? 'bg-red-100 text-red-800' : 'badge-gold'
                    }`}>
                      {(invitation.used ?? invitation.isUsed) ? 'مستخدم' : 'متاح'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">عدد الضيوف: {invitation.numOfPeople ?? invitation.guests}</div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <a
                      href={`/client/invitations/edit/${invitation._id || invitation.id}`}
                      className="text-orange-600 hover:text-orange-800"
                      title="تعديل الدعوة"
                    >
                      تعديل
                    </a>
                    <a
                      href={`/client/invitations/${invitation._id || invitation.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="طباعة الدعوة"
                      target="_blank"
                    >
                      طباعة
                    </a>
                    <button
                      onClick={() => remove(invitation._id || invitation.id)}
                      className="text-red-600 hover:text-red-800"
                      title="حذف الدعوة"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* شريط الصفحات للجوال */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                عرض {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)} من {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={()=>setPage(p=>Math.max(1, p-1))}
                >السابق</button>
                <span className="text-sm">{currentPage} / {totalPages}</span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={()=>setPage(p=>Math.min(totalPages, p+1))}
                >التالي</button>
              </div>
            </div>
          </div>
          </div>
          )
          )}
        </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الدعوات</p>
              <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الدعوات المتاحة</p>
              <p className="text-2xl font-semibold text-gray-900">
                {items.filter(i => !(i.used ?? i.isUsed)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الدعوات المستخدمة</p>
              <p className="text-2xl font-semibold text-gray-900">
                {items.filter(i => (i.used ?? i.isUsed)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full icon-circle-rose">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 0 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الضيوف</p>
              <p className="text-2xl font-semibold text-gray-900">
                {items.reduce((sum, i) => sum + (i.numOfPeople ?? i.guests ?? 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}