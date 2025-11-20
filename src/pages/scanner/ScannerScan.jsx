import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { verifyCode } from '../../api/scanner';
import { formatSyrianDate, formatSyrianTime } from '../../utils/date';

export default function ScannerScan() {
  const qrcodeRegionId = 'html5qrdiv';
  const html5QrCodeRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [cameras, setCameras] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [manualCode, setManualCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCameras();

    // Load persisted history
    try {
      const stored = JSON.parse(localStorage.getItem('scanner_scan_history') || '[]');
      if (Array.isArray(stored) && stored.length) setScanHistory(stored);
    } catch {}


    // Stop camera on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // إيقاف الكاميرا فوراً
      return true;
    } catch (err) {
      console.error('Camera permission denied:', err);
      return false;
    }
  };

  const loadCameras = async () => {
    try {
      // طلب الصلاحيات أولاً
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setError('يرجى السماح بالوصول للكاميرا لاستخدام المسح');
        return;
      }

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
        console.log('تم تحميل الكاميرات بنجاح:', devices.length);
      } else {
        setError('لم يتم العثور على كاميرات متاحة');
      }
    } catch (err) {
      console.error('Error loading cameras:', err);
      setError('فشل في تحميل الكاميرات: ' + (err.message || 'تأكد من منح الصلاحيات للكاميرا'));
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) return setError('يرجى اختيار كاميرا');

    try {
      setError('');
      setSuccessMessage('');
      setScanResult(null);

      console.log('بدء المسح مع الكاميرا:', selectedCamera);

      // التأكد من وجود العنصر قبل بدء المسح
      const element = document.getElementById(qrcodeRegionId);
      if (!element) {
        throw new Error('عنصر المسح غير موجود');
      }

      setIsScanning(true);

      // إنشاء مثيل جديد في كل مرة
      html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      console.log('إعداد المسح:', config);

      await html5QrCodeRef.current.start(
        selectedCamera,
        config,
        onScanSuccess,
        onScanError
      );

      console.log('تم بدء المسح بنجاح');
    } catch (err) {
      console.error('Failed to start scanner:', err);

      let errorMessage = 'خطأ غير معروف';
      setError('فشل في بدء المسح: ' + errorMessage);
      setIsScanning(false);
      html5QrCodeRef.current = null;
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null; // إعادة تعيين المرجع
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      setError('');
      setSuccessMessage(''); // مسح رسالة النجاح السابقة

      const result = await verifyCode(decodedText);
      if (result && result.success === false) {
        throw new Error(result.message || 'عملية التحقق فشلت');
      }

      const scanData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: result.guestName || result?.data?.guestName || 'غير معروف',
        eventName: result.eventName || result?.data?.eventName || 'غير معروف',
        numOfPeople: result.numOfPeople ?? result?.data?.numOfPeople ?? result?.peopleCount ?? result?.data?.peopleCount,
        status: 'success',
        qrCode: decodedText
      };

      // عرض رسالة النجاح مع عدد الأشخاص
      const peopleCount = scanData.numOfPeople;
      const peopleText = peopleCount ? ` - عدد الأشخاص: ${peopleCount}` : '';
      setSuccessMessage(`✅ تم قبول الدعوة بنجاح! الضيف: ${scanData.guestName}${peopleText}`);

      setScanResult(scanData);
      setScanHistory(prev => {
        const next = [scanData, ...prev.slice(0, 49)];
        localStorage.setItem('scanner_scan_history', JSON.stringify(next));
        return next;
      });

      await stopScanning();

      // إخفاء رسالة النجاح بعد 5 ثوان
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      console.error('Verification failed:', err);
      setError(err?.message || 'فشل في التحقق من الدعوة');

      // محاولة الحصول على معلومات الدعوة حتى لو كانت مرفوضة
      let invitationInfo = null;
      try {
        // البحث في الدعوات المحلية للحصول على المعلومات
        const storedInvitations = JSON.parse(localStorage.getItem('invitations_all') || '[]');
        invitationInfo = storedInvitations.find(inv => inv.code === decodedText);
      } catch (e) {
        console.log('Could not load invitation info:', e);
      }

      // تحديد سبب الرفض ووقت الاستخدام
      let rejectionReason = err?.message || 'دعوة غير صالحة';
      let usedTime = null;

      if (err?.message === 'تم استخدام هذه الدعوة مسبقًا') {
        // البحث عن وقت الاستخدام في سجل المسح
        try {
          const scanHistory = JSON.parse(localStorage.getItem('scanner_scan_history') || '[]');
          const previousScan = scanHistory.find(scan => scan.qrCode === decodedText && scan.status === 'success');
          if (previousScan) {
            usedTime = previousScan.timestamp;
          }
        } catch (e) {
          console.log('Could not find usage time:', e);
        }
      }

      const failedScan = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: invitationInfo?.guestName || 'غير معروف',
        eventName: invitationInfo?.eventName || 'غير معروف',
        numOfPeople: invitationInfo?.numOfPeople ?? invitationInfo?.peopleCount ?? invitationInfo?.guestsCount ?? invitationInfo?.guests ?? invitationInfo?.quantity,
        status: 'failed',
        qrCode: decodedText,
        rejectionReason: rejectionReason,
        usedTime: usedTime // وقت الاستخدام السابق إذا كانت مستخدمة
      };

      setScanResult(failedScan);
      setScanHistory(prev => {
        const next = [failedScan, ...prev.slice(0, 49)];
        localStorage.setItem('scanner_scan_history', JSON.stringify(next));
        return next;
      });

      await stopScanning();
    }
  };

  const onScanError = (errorMessage) => {
    console.log('Scan error:', errorMessage);
  };

  const clearResult = () => {
    setScanResult(null);
    setError('');
  };

  const manualVerify = async () => {
    const code = manualCode.trim();
    if (!code) { setError('يرجى إدخال الرمز النصي'); return; }

    try {
      if (isScanning) await stopScanning();
      setError('');
      const result = await verifyCode(code);

      if (result && result.success === false) {
        throw new Error(result.message || 'عملية التحقق فشلت');
      }

      const scanData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: result.guestName || result?.data?.guestName || 'غير معروف',
        eventName: result.eventName || result?.data?.eventName || 'غير معروف',
        numOfPeople: result.numOfPeople ?? result?.data?.numOfPeople ?? result?.peopleCount ?? result?.data?.peopleCount,
        status: 'success',
        qrCode: code
      };

      setScanResult(scanData);
      setScanHistory(prev => {
        const next = [scanData, ...prev.slice(0, 49)];
        localStorage.setItem('scanner_scan_history', JSON.stringify(next));
        return next;
      });
      setManualCode('');
      await stopScanning();
    } catch (e) {
      setError(e?.message || 'فشل التحقق من الرمز المدخل');

      // محاولة الحصول على معلومات الدعوة حتى لو كانت مرفوضة
      let invitationInfo = null;
      try {
        const storedInvitations = JSON.parse(localStorage.getItem('invitations_all') || '[]');
        invitationInfo = storedInvitations.find(inv => inv.code === code);
      } catch (err) {
        console.log('Could not load invitation info:', err);
      }

      // تحديد سبب الرفض ووقت الاستخدام
      let rejectionReason = e?.message || 'دعوة غير صالحة';
      let usedTime = null;

      if (e?.message === 'تم استخدام هذه الدعوة مسبقًا') {
        try {
          const scanHistory = JSON.parse(localStorage.getItem('scanner_scan_history') || '[]');
          const previousScan = scanHistory.find(scan => scan.qrCode === code && scan.status === 'success');
          if (previousScan) {
            usedTime = previousScan.timestamp;
          }
        } catch (err) {
          console.log('Could not find usage time:', err);
        }
      }

      const failedScan = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        guestName: invitationInfo?.guestName || 'غير معروف',
        eventName: invitationInfo?.eventName || 'غير معروف',
        numOfPeople: invitationInfo?.numOfPeople ?? invitationInfo?.peopleCount ?? invitationInfo?.guestsCount ?? invitationInfo?.guests ?? invitationInfo?.quantity,
        status: 'failed',
        qrCode: code,
        rejectionReason: rejectionReason,
        usedTime: usedTime
      };

      setScanResult(failedScan);
      setScanHistory(prev => {
        const next = [failedScan, ...prev.slice(0, 49)];
        localStorage.setItem('scanner_scan_history', JSON.stringify(next));
        return next;
      });
    }
  };

  const resetScanner = async () => {
    try {
      await stopScanning();
      setScanResult(null);
      setError('');
      setSuccessMessage('');
      setIsScanning(false);
    } catch (err) {
      console.error('Error resetting scanner:', err);
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">مسح الدعوات بالكاميرا</h2>
        <div className="flex gap-2">
          {!isScanning ? (
            <button onClick={startScanning} disabled={!selectedCamera} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
              بدء المسح
            </button>
          ) : (
            <button onClick={stopScanning} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              إيقاف المسح
            </button>
          )}
          <button onClick={resetScanner} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            إعادة تعيين
          </button>
          <Link to="/scanner" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Camera Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات الكاميرا</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختيار الكاميرا</label>
            <select value={selectedCamera} onChange={(e)=>setSelectedCamera(e.target.value)} disabled={isScanning} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">اختر الكاميرا</option>
              {cameras.map(cam => (<option key={cam.id} value={cam.id}>{cam.label}</option>))}
            </select>
            {cameras.length === 0 && (
              <p className="text-xs text-red-600 mt-1">لم يتم العثور على كاميرات</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">حالة الكاميرا</label>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isScanning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">{isScanning ? 'تعمل' : 'متوقفة'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              الكاميرات المتاحة: {cameras.length}
            </p>
          </div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">منطقة المسح</h3>
        <div className="flex justify-center">
          <div className="relative">
            {!isScanning && (
              <div className="flex items-center justify-center text-gray-500" style={{ width: 250, height: 250, border: '2px dashed #ccc', borderRadius: '8px' }}>
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  <p className="text-lg font-medium">اضغط "بدء المسح" لتفعيل الكاميرا</p>
                  <p className="text-sm text-gray-600 mt-2">ضع رمز QR في وسط الإطار</p>
                </div>
              </div>
            )}
            
            <div id={qrcodeRegionId} style={{ width: 250, height: 250, borderRadius: '8px', overflow: 'hidden' }}></div>
            
          </div>
        </div>

        {isScanning && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              <div className="animate-pulse rounded-full h-4 w-4 bg-blue-600 mr-2"></div>
              الكاميرا تعمل - جاري المسح...
            </div>
          </div>
        )}
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">سجل المسح</h3>
            <span className="text-sm text-gray-500">آخر {Math.min(scanHistory.length, 10)} عمليات مسح</span>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {scanHistory.slice(0, 10).map((scan) => (
                <div key={scan.id} className={`p-4 rounded-lg border-l-4 ${
                  scan.status === 'success'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          scan.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <h4 className="font-medium text-gray-900">{scan.guestName}</h4>
                        {scan.status === 'success' && (
                          <span className="mr-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            ✓ مقبول
                          </span>
                        )}
                        {scan.status === 'failed' && (
                          <span className="mr-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            ✗ مرفوض
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <span>{scan.eventName}</span>
                        {scan.numOfPeople && (
                          <span className="mr-3 font-medium text-blue-600">
                            👥 {scan.numOfPeople} أشخاص
                          </span>
                        )}
                        <span className="mr-3 text-gray-500">
                          🕒 {new Date(scan.timestamp).toLocaleTimeString('ar-SY')}
                        </span>
                      </div>

                      {/* معلومات إضافية للدعوات المرفوضة */}
                      {scan.status === 'failed' && (
                        <div className="mt-2 text-sm">
                          {scan.rejectionReason && (
                            <div className="text-red-600 font-medium">
                              ❌ السبب: {scan.rejectionReason}
                            </div>
                          )}
                          {scan.usedTime && (
                            <div className="text-orange-600 mt-1">
                              ⏰ تم استخدامها في: {new Date(scan.usedTime).toLocaleString('ar-SY', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {scan.qrCode.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {scanHistory.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  يتم عرض آخر 10 عمليات مسح فقط. المجموع: {scanHistory.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">تعليمات المسح</h3>
        <div className="text-blue-800 space-y-2">
          <p>• تأكد من أن الكاميرا تعمل بشكل صحيح</p>
          <p>• ضع رمز QR في وسط إطار الكاميرا</p>
          <p>• انتظر حتى يظهر تأكيد المسح</p>
          <p>• تأكد من صحة البيانات قبل السماح بالدخول</p>
          <p>• في حالة فشل المسح، حاول مرة أخرى أو تحقق من صحة الرمز</p>
        </div>
      </div>
    </div>
  );
}
