import React from 'react'
import Pagination from '../../../components/Pagination'
import { listManagerClients, getManagerHall, listTemplatesManager } from '../../../api/manager'

export default function ManagerClients(){
  const [clients, setClients] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [expanded, setExpanded] = React.useState({})
  const [hall, setHall] = React.useState(null)
  const [templatesMap, setTemplatesMap] = React.useState({})
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const toggleExpanded = (id)=> setExpanded(prev => ({...prev, [id]: !prev[id]}))
  const formatDate = (d)=> d ? new Date(d).toLocaleString('ar-SY', { calendar: 'gregory', timeZone: 'Asia/Damascus' }) : ''

  React.useEffect(()=>{ load() },[])

  const load = async()=>{
    setLoading(true)
    try{
      const [clientsRes, hallRes, templatesRes] = await Promise.all([
        listManagerClients(),
        getManagerHall(),
        listTemplatesManager()
      ])
      setClients(clientsRes || [])
      setHall(hallRes || null)
      const tmap = (templatesRes || []).reduce((acc, t)=>{ const id = t._id || t.id; if(id) acc[id] = t.templateName || t.name; return acc }, {})
      setTemplatesMap(tmap)
    }catch{} finally{ setLoading(false) }
  }

  const filteredClients = clients.filter(c => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    const name = (c.name || '').toLowerCase()
    const phone = (c.phone || '').toLowerCase()
    const active = c.isActive ? 'نشط' : 'غير نشط'
    const eventsCount = String(c.events?.length || 0)
    return name.includes(q) || phone.includes(q) || active.includes(q) || eventsCount.includes(q)
  })
  React.useEffect(()=>{ setPage(1) }, [searchTerm, pageSize])
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize))
  const start = (page - 1) * pageSize
  const paginatedClients = filteredClients.slice(start, start + pageSize)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900">العملاء</h2></div>
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">قائمة العملاء</h3></div>
        <div className="px-6 py-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input type="text" value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} placeholder="ابحث بالاسم/الجوال/الحالة/عدد الحفلات" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
        ) : clients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا يوجد عملاء</div>
        ) : (
          <div>
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجوال</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">قاعة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نشط</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تم الإنشاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">آخر تحديث</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحفلات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedClients.map(c => {
                  const id = c._id || c.id
                  return (
                    <React.Fragment key={id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{c.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">{hall?.name || ''}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                            {c.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(c.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(c.updatedAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{c.events?.length || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={()=> toggleExpanded(id)} className="text-blue-600 hover:text-blue-900">
                            {expanded[id] ? 'إخفاء الحفلات' : 'عرض الحفلات'}
                          </button>
                        </td>
                      </tr>
                       {expanded[id] && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            {(c.events && c.events.length > 0) ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-white">
                                    <tr>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوقت</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأشخاص</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القالب</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {c.events.map(ev => (
                                      <tr key={ev._id || ev.id}>
                                        <td className="px-4 py-2">{ev.eventName}</td>
                                        <td className="px-4 py-2 text-sm">{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('ar-SY', { calendar: 'gregory', timeZone: 'Asia/Damascus' }) : ''}</td>
                                        <td className="px-4 py-2 text-sm">{ev.startTime} - {ev.endTime}</td>
                                        <td className={`px-4 py-2 text-sm${getStatusColor(ev.status)}`}>{getStatusLabel(ev.status)}</td>
                                        <td className="px-4 py-2 text-sm">{ev.numOfPeople ?? ev.chairsCount ?? 0}</td>
                                        <td className="px-4 py-2 text-xs">{templatesMap[ev.templateId] || ev.templateId || ''}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">لا توجد حفلات لهذا العميل</div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-100">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {paginatedClients.map(c => {
                const id = c._id || c.id
                const isExp = !!expanded[id]
                return (
                  <div key={id} className="card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{c.name}</div>
                        <div className="text-sm text-gray-600">{c.phone}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{c.isActive ? 'نشط' : 'غير نشط'}</span>
                          <span className="text-xs text-gray-500">قاعة: {hall?.name || '-'}</span>
                          <span className="text-xs text-gray-500">حفلـات: {c.events?.length || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">تم الإنشاء: {c.createdAt ? new Date(c.createdAt).toLocaleString('ar-SY', { calendar: 'gregory', timeZone: 'Asia/Damascus' }) : '-'}</div>
                      </div>
                      <button onClick={()=> toggleExpanded(id)} className="text-blue-600 text-sm">{isExp ? 'إخفاء الحفلات' : 'عرض الحفلات'}</button>
                    </div>
                    {isExp && (
                      <div className="mt-3 space-y-2">
                        {(c.events && c.events.length > 0) ? (
                          c.events.map(ev => (
                            <div key={ev._id || ev.id} className="rounded border border-gray-100 p-3 bg-white">
                              <div className="text-sm font-medium text-gray-900">{ev.eventName}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('ar-SY', { calendar: 'gregory', timeZone: 'Asia/Damascus' }) : ''} {ev.startTime && `- ${ev.startTime}`} {ev.endTime && `– ${ev.endTime}`}
                              </div>
                              <div className="text-xs text-gray-700 mt-1 flex gap-2">
                                <span>الحالة: {ev.status}</span>
                                <span>الأشخاص: {ev.numOfPeople ?? ev.chairsCount ?? 0}</span>
                                <span>القالب: {templatesMap[ev.templateId] || ev.templateId || ''}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-600">لا توجد حفلات لهذا العميل</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="pt-2">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

