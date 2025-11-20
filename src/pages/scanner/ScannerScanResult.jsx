import React from 'react'
import { useParams } from 'react-router-dom'
import { verifyCode } from '../../api/scanner'
import { formatSyrianDate } from '../../utils/date'

export default function ScannerScanResult(){
  const { code } = useParams()
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(()=>{ (async()=>{
    try{ const res = await verifyCode(code); setData(res) }catch(e){ setError(e?.message || 'فشل التحقق') }finally{ setLoading(false) }
  })() }, [code])

  if (loading) return <div className='p-6'><div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div></div>

  const ok = data?.success || data?.ok
  const message = data?.message || (ok ? 'تم التحقق من الدعوة بنجاح' : error || 'فشل التحقق')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">نتيجة التحقق</h2>
      <div className={`p-4 rounded-lg ${ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="mb-2 font-medium">{message}</div>
        {ok && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">الضيف</div>
              <div className="font-medium text-gray-900">{data?.guestName || data?.data?.guestName}</div>
            </div>
            <div>
              <div className="text-gray-600">الفعالية</div>
              <div className="font-medium text-gray-900">{data?.eventName || data?.data?.eventName}</div>
            </div>
            <div>
              <div className="text-gray-600">التاريخ</div>
              <div className="font-medium text-gray-900">{data?.data?.eventDate ? formatSyrianDate(data.data.eventDate) : '-'}</div>
            </div>
            <div>
              <div className="text-gray-600">عدد الأشخاص</div>
              <div className="font-medium text-gray-900">{data?.data?.numOfPeople ?? '-'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

