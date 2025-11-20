import React from 'react'
import Pagination from '../../components/Pagination'
import { useParams, Link } from 'react-router-dom'
import { getEventInvitations, verifyCode } from '../../api/scanner'
import { formatSyrianDate ,formatSyrianTime } from '../../utils/date'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScannerEventInvitations(){
  const { id } = useParams()
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [eventInfo, setEventInfo] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Scanner states
  const [showScanner, setShowScanner] = React.useState(false)
  const [isScanning, setIsScanning] = React.useState(false)
  const [cameras, setCameras] = React.useState([])
  const [selectedCamera, setSelectedCamera] = React.useState('')
  const [scanResult, setScanResult] = React.useState(null)
  const [scanError, setScanError] = React.useState('')
  const [scanHistory, setScanHistory] = React.useState([])
  const [manualCode, setManualCode] = React.useState('')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const html5QrCodeRef = React.useRef(null)
  const qrcodeRegionId = 'event-qrcode-reader'

  React.useEffect(()=>{
    load()
    loadCameras()
    loadScanHistory()
  }, [id])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [])

  const load = async()=>{
    setLoading(true)
    try{
      const res = await getEventInvitations(id);
      setData(res?.invitations || [])
      setEventInfo(res?.eventInfo || null)
    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  const loadCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    } catch (err) {
      console.error('Error loading cameras:', err);
    }
  };

  const loadScanHistory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(`event_scan_history_${id}`) || '[]');
      setScanHistory(stored);
    } catch (e) {
      console.error('Error loading scan history:', e);
    }
  };

  const verifyEventCode = async (code) => {
    try {
      // استخدام نفس API المستخدم في صفحة المسح الرئيسية
      const result = await verifyCode(code);

      // التحقق من أن الدعوة تنتمي لهذه الفعالية
      const invitation = data.find(inv => inv.qrCode === code);
      if (!invitation) {
        throw new Error('هذه الدعوة غير مخصصة لهذه الفعالية');
      }

      // تحديث حالة الدعوة في البيانات المحلية
      const updatedData = data.map(inv =>
        inv.qrCode === code ? { ...inv, used: true } : inv
      );
      setData(updatedData);

      // إعادة تحميل البيانات للتأكد من التزامن
      load();

      return {
        guestName: result.guestName || invitation.guestName,
        eventName: result.eventName || invitation.eventName || eventInfo?.eventName || 'فعالية',
        numOfPeople: result.numOfPeople || invitation.numOfPeople,
        message: result.message || 'تم قبول الدعوة بنجاح'
      };
    } catch (error) {
      // التحقق من أن الدعوة تنتمي لهذه الفعالية حتى لو فشل التحقق
      const invitation = data.find(inv => inv.qrCode === code);
      if (!invitation) {
        throw new Error('هذه الدعوة غير مخصصة لهذه الفعالية');
      }

      // إعادة رمي الخطأ الأصلي من السيرفر
      throw error;
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      setScanError('يرجى اختيار كاميرا');
      return;
    }

    try {
      setScanError('');
      setScanResult(null);
      setIsScanning(true);

      html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);

      await html5QrCodeRef.current.start(
        selectedCamera,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setScanError('فشل في بدء المسح: ' + (err.message || 'خطأ غير معروف'));
      setIsScanning(false);
      html5QrCodeRef.current = null;
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      setScanError('');
      const result = await verifyEventCode(decodedText);

      const scanData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: result.guestName,
        eventName: result.eventName,
        numOfPeople: result.numOfPeople,
        status: 'success',
        qrCode: decodedText,
        method: 'camera'
      };

      setScanResult(scanData);

      // حفظ في سجل هذه الفعالية
      const newHistory = [scanData, ...scanHistory.slice(0, 49)];
      setScanHistory(newHistory);
      localStorage.setItem(`event_scan_history_${id}`, JSON.stringify(newHistory));

      await stopScanning();
    } catch (err) {
      console.error('Verification failed:', err);
      setScanError(err?.message || 'فشل في التحقق من الدعوة');

      // محاولة الحصول على معلومات الدعوة
      const invitation = data.find(inv => inv.qrCode === decodedText);

      const failedScan = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: invitation?.guestName || 'غير معروف',
        eventName: eventInfo?.eventName || 'غير معروف',
        numOfPeople: invitation?.numOfPeople,
        status: 'failed',
        qrCode: decodedText,
        rejectionReason: err?.message || 'دعوة غير صالحة',
        method: 'camera'
      };

      setScanResult(failedScan);

      const newHistory = [failedScan, ...scanHistory.slice(0, 49)];
      setScanHistory(newHistory);
      localStorage.setItem(`event_scan_history_${id}`, JSON.stringify(newHistory));

      await stopScanning();
    }
  };

  const onScanError = (errorMessage) => {
    console.log('Scan error:', errorMessage);
  };

  const handleManualVerify = async () => {
    const code = manualCode.trim();
    if (!code) {
      setScanError('يرجى إدخال رمز الدعوة');
      return;
    }

    setIsVerifying(true);
    setScanError('');
    setScanResult(null);

    try {
      const result = await verifyEventCode(code);

      const scanData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: result.guestName,
        eventName: result.eventName,
        numOfPeople: result.numOfPeople,
        status: 'success',
        qrCode: code,
        method: 'manual'
      };

      setScanResult(scanData);

      // حفظ في سجل هذه الفعالية
      const newHistory = [scanData, ...scanHistory.slice(0, 49)];
      setScanHistory(newHistory);
      localStorage.setItem(`event_scan_history_${id}`, JSON.stringify(newHistory));

      setManualCode(''); // مسح الحقل بعد النجاح
    } catch (err) {
      console.error('Manual verification failed:', err);
      setScanError(err?.message || 'فشل في التحقق من الدعوة');

      // محاولة الحصول على معلومات الدعوة
      const invitation = data.find(inv => inv.qrCode === code);

      const failedScan = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: invitation?.guestName || 'غير معروف',
        eventName: eventInfo?.eventName || 'غير معروف',
        numOfPeople: invitation?.numOfPeople,
        status: 'failed',
        qrCode: code,
        rejectionReason: err?.message || 'دعوة غير صالحة',
        method: 'manual'
      };

      setScanResult(failedScan);

      const newHistory = [failedScan, ...scanHistory.slice(0, 49)];
      setScanHistory(newHistory);
      localStorage.setItem(`event_scan_history_${id}`, JSON.stringify(newHistory));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">دعوات الفعالية</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
            </svg>
            {showScanner ? 'إخفاء المسح' : 'مسح الدعوات'}
          </button>
          <Link to="/scanner" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">العودة للوحة التحكم</Link>
        </div>
      </div>

      {/* معلومات الفعالية */}
      {eventInfo && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-gray-900 font-medium">
              {eventInfo.eventName || 'فعالية'}
            </div>
            <div className="text-gray-600 text-sm">
              {eventInfo.eventDate ? formatSyrianDate(eventInfo.eventDate) : ''}
              {eventInfo.eventTime ? ` - ${eventInfo.eventTime}` : ''}
            </div>
          </div>
          {eventInfo.hallId && (
            <div className="text-sm text-gray-500 mt-1">
              {eventInfo.hallId.name} - {eventInfo.hallId.location}
            </div>
          )}
        </div>
      )}

      {/* Scanner Section */}
      {showScanner && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">مسح دعوات الفعالية</h3>

          {/* Scanner Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اختيار الكاميرا</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isScanning}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الكاميرا</option>
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  disabled={!selectedCamera}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  بدء المسح
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  إيقاف المسح
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {scanError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {scanError}
            </div>
          )}

          {/* Success Message */}
          {scanResult && scanResult.status === 'success' && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ تم قبول الدعوة! الضيف: {scanResult.guestName} - عدد الأشخاص: {scanResult.numOfPeople}
            </div>
          )}

          {/* Scanner Area */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {!isScanning && (
                <div className="flex items-center justify-center text-gray-500" style={{ width: 300, height: 300, border: '2px dashed #ccc', borderRadius: '8px' }}>
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                    </svg>
                    <p className="text-lg font-medium">اضغط "بدء المسح" لتفعيل الكاميرا</p>
                    <p className="text-sm text-gray-600 mt-2">سيتم التحقق من الدعوات المخصصة لهذه الفعالية فقط</p>
                  </div>
                </div>
              )}
              <div id={qrcodeRegionId} style={{ width: 300, borderRadius: '8px', overflow: 'hidden' }}></div>
            </div>
          </div>

          {/* Manual Code Entry */}
          <div className="border-t pt-6 mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">إدخال رمز الدعوة يدوياً</h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="أدخل رمز الدعوة هنا..."
                  disabled={isVerifying}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isVerifying) {
                      handleManualVerify();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleManualVerify}
                disabled={!manualCode.trim() || isVerifying}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الفحص...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    فحص
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              يمكنك إدخال رمز الدعوة يدوياً إذا لم تتمكن من مسحه بالكاميرا
            </p>
          </div>

          {/* Scan History for this event */}
          {scanHistory.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">سجل مسح هذه الفعالية</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scanHistory.slice(0, 5).map((scan) => (
                  <div key={scan.id} className={`p-3 rounded border-l-4 ${
                    scan.status === 'success'
                      ? 'bg-green-50 border-green-400'
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{scan.guestName}</span>
                        {scan.numOfPeople && (
                          <span className="mr-2 text-blue-600">👥 {scan.numOfPeople}</span>
                        )}
                        <span className={`mr-2 px-2 py-1 text-xs rounded-full ${
                          scan.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scan.status === 'success' ? '✓ مقبول' : '✗ مرفوض'}
                        </span>
                        {scan.method && (
                          <span className="mr-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {scan.method === 'manual' ? '✍️ يدوي' : '📷 كاميرا'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(scan.timestamp).toLocaleTimeString('ar-SY')}
                      </span>
                    </div>
                    {scan.status === 'failed' && scan.rejectionReason && (
                      <div className="text-sm text-red-600 mt-1">
                        السبب: {scan.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics for Invitations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

        {/* إجمالي الدعوات */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="p-4 bg-blue-200 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 0l3-3m-3 3l-3-3M4 6h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600">إجمالي الدعوات</h3>
            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
          </div>
        </div>

        {/* مستخدمة */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="p-4 bg-red-200 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}  d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600">مستخدمة</h3>
            <p className="text-2xl font-bold text-red-900">
              {data.filter(inv => inv.used).length}
            </p>
          </div>
        </div>

        {/* غير مستخدمة */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="p-4 bg-green-200 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600"> متاحة</h3>
            <p className="text-2xl font-bold text-green-800">
              {data.filter(inv => !inv.used).length}
            </p>
          </div>
        </div>

        {/* إجمالي الأشخاص */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="p-4 bg-indigo-200 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5v14" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600">إجمالي الحضور المتوقع</h3>
            <p className="text-2xl font-bold text-indigo-900">
              {data.reduce((sum, inv) => sum + (inv.numOfPeople || 0), 0)}
            </p>
          </div>
        </div>

        {/* الحضور الفعلي */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-600">الحضور الفعلي</h3>
            <p className="text-2xl font-bold text-green-900">
              {data.filter(inv => inv.used).reduce((sum, inv) => sum + (inv.numOfPeople || 0), 0)}
            </p>
          </div>
        </div>

      </div>




      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">القائمة</h3></div>
        <div className="px-6 py-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e=> setSearchTerm(e.target.value)} 
              placeholder="ابحث باسم الضيف/الحالة/QR/عدد الأشخاص" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عدد العناصر</label>
            <select 
              value={pageSize} 
              onChange={e=> setPageSize(Number(e.target.value))} 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد دعوات</div>
        ) : (
          <div className="p-4 space-y-8">
            {(() => {
              const q = searchTerm.trim().toLowerCase()
              const filtered = q ? data.filter(inv => {
                const name = (inv.guestName || '').toLowerCase()
                const used = inv.used ? 'مستخدم' : 'متاح'
                const qr = String(inv.qrCode || '')
                const ppl = String(inv.numOfPeople || '')
                return name.includes(q) || used.includes(q) || qr.includes(q) || ppl.includes(q)
              }) : data

              const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
              const start = (page - 1) * pageSize
              const pageItems = filtered.slice(start, start + pageSize)

              return (
                <div>
                  {/* جدول على الشاشات الكبيرة */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الضيف</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الأشخاص</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">QR</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الاستخدام</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pageItems.map(inv => (
                          <tr key={inv._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{inv.guestName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{inv.numOfPeople}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                inv.used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {inv.used ? 'مستخدم' : 'متاح'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs text-gray-500 break-all">{inv.qrCode}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               {inv.usedDate 
                                  ? (
                                    <>
                                      {formatSyrianTime(inv.usedDate)}<br />
                                      <span className="text-sm text-gray-500">
                                        {formatSyrianDate(inv.usedDate)}
                                      </span>
                                    </>
                                  ) 
                                  : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-6 py-4 border-t border-gray-100">
                      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                  </div>

                  {/* كروت على الموبايل */}
                  <div className="md:hidden space-y-3">
                    {pageItems.map(inv => (
                      <div key={inv._id} className="card p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-base font-semibold text-gray-900">{inv.guestName}</div>
                            <div className="text-sm text-gray-600">عدد الأشخاص: {inv.numOfPeople}</div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${inv.used ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                            {inv.used ? 'مستخدم' : 'متاح'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 break-all">{inv.qrCode}</div>
                        {inv.usedDate && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="text-sm text-gray-600">تاريخ الاستخدام:</span>{' '}
                            {formatSyrianTime(inv.usedDate)} - {formatSyrianDate(inv.usedDate)}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="pt-2">
                      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
