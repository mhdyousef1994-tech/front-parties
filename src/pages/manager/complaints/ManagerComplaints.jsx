import React from 'react'
import Pagination from '../../../components/Pagination'
import { listManagerComplaints } from '../../../api/manager'

export default function ManagerComplaints(){
  const [complaints, setComplaints] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(()=>{ load() }, [])

  const load = async()=>{
    setLoading(true)
    try{ const res = await listManagerComplaints(); setComplaints(res || []) }catch{} finally{ setLoading(false) }
  }

  // filter + pagination
  const filtered = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return complaints
    return complaints.filter(c => {
      const from = `${c?.fromUserId?.name || ''} ${c?.fromUserId?.phone || ''}`.toLowerCase()
      const msg = (c?.message || '').toLowerCase()
      const st = (c?.status || '').toLowerCase()
      return from.includes(q) || msg.includes(q) || st.includes(q)
    })
  }, [complaints, searchTerm])
  React.useEffect(()=>{ setPage(1) }, [searchTerm, pageSize])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900">الشكاوى</h2></div>
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">قائمة الشكاوى</h3></div>
        <div className="px-6 py-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input type="text" value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} placeholder="ابحث بالاسم/الجوال/النص/الحالة" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
        ) : complaints.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد شكاوى</div>
        ) : (
          <div>
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النص</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map(c => (
                  <tr key={c._id || c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{c?.fromUserId?.name} ({c?.fromUserId?.phone})</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.createdAt ? new Date(c.createdAt).toLocaleString('ar-SA') : '-'}</td>
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
              {paginated.map(c => (
                <div key={c._id || c.id} className="card p-4">
                  <div className="text-sm text-gray-600">{c?.fromUserId?.name} ({c?.fromUserId?.phone})</div>
                  <div className="mt-1 text-gray-900">{c.message}</div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-700">{c.status}</span>
                    <span className="text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleString('ar-SA') : '-'}</span>
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
    </div>
  )
}

