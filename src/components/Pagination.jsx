import React from 'react'

export default function Pagination({ currentPage, totalPages, onPageChange }){
  if (totalPages <= 1) return null

  const goTo = (p) => {
    const page = Math.max(1, Math.min(totalPages, p))
    if (page !== currentPage) onPageChange(page)
  }

  // window of pages
  const windowSize = 5
  const half = Math.floor(windowSize / 2)
  let start = Math.max(1, currentPage - half)
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, Math.min(start, end - windowSize + 1))

  const pages = []
  for (let p = start; p <= end; p++) pages.push(p)

  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={() => goTo(1)} className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50" disabled={currentPage === 1}>الأولى</button>
      <button onClick={() => goTo(currentPage - 1)} className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50" disabled={currentPage === 1}>السابق</button>
      {pages.map(p => (
        <button key={p} onClick={() => goTo(p)} className={`px-3 py-1 text-sm rounded border ${p === currentPage ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-200 hover:bg-gray-50'}`}>{p}</button>
      ))}
      <button onClick={() => goTo(currentPage + 1)} className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50" disabled={currentPage === totalPages}>التالي</button>
      <button onClick={() => goTo(totalPages)} className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50" disabled={currentPage === totalPages}>الأخيرة</button>
    </div>
  )
}
