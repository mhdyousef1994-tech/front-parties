import React, { useEffect, useState, useRef } from 'react';
import { getClientDashboard } from '../../../api/client';
import { getInvitation } from '../../../api/client';
import { formatSyrianDate } from '../../../utils/date'
import { useParams, Link } from 'react-router-dom';
import { toPng } from 'html-to-image';

const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin;

export default function ClientInvitationShow() {
  const { id } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);
  const [imgReady, setImgReady] = useState(true);
  const [dashEvent, setDashEvent] = useState(null);
  const [dashData, setDashData] = useState(null);

  // استخدم أداة التنسيق المشتركة للتقويم الميلادي السوري

  // اسم صاحب الحفل (من بيانات الحدث في الدعوة أو من لوحة تحكم العميل كاحتياط)
  const hostName = (
    invitation?.eventId?.clientName ||
    invitation?.eventId?.clientId?.name ||
    dashData?.client?.name ||
    dashData?.user?.name ||
    dashData?.name ||
    dashEvent?.clientName ||
    dashEvent?.clientId?.name ||
    ''
  );

  // اجلب تفاصيل الحدث من لوحة تحكم العميل لاستخدامها كقيمة احتياطية لاسم وموقع الصالة واسم العميل نفسه
  useEffect(() => {
    getClientDashboard()
      .then(r => { setDashData(r || null); setDashEvent(r?.event || null); })
      .catch(() => { setDashData(null); setDashEvent(null); });
  }, []);

  const waitForImages = (root) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    const pending = imgs.filter(img => !img.complete);
    if (pending.length === 0) return Promise.resolve();
    return Promise.all(pending.map(img => new Promise(res => {
      img.addEventListener('load', () => res(), { once: true });
      img.addEventListener('error', () => res(), { once: true });
    })));
  };

  const downloadPng = async () => {
    if (!cardRef.current) return;
    try {
      const el = cardRef.current;
      // استخدم الأبعاد الظاهرة فعلياً ضمن الديف لضمان تطابق الحجم عند التنزيل
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      await waitForImages(el);
      const dataUrl = await toPng(el, {
        cacheBust: true,
        useCORS: true,
        pixelRatio: 2,
        width: w,
        height: h,
        canvasWidth: w,
        canvasHeight: h,
        backgroundColor: '#ffffff',
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
        style: { transform: 'none', width: `${w}px`, height: `${h}px` }
      });
      const link = document.createElement('a');
      link.download = `invitation-${invitation?._id || id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert('تعذر إنشاء الصورة، حاول مجددًا');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getInvitation(id);
        setInvitation(res);
      } catch (err) {
        setError('تعذر تحميل بيانات الدعوة');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!invitation) return <div className="p-6 text-center">الدعوة غير موجودة</div>;

  return (
    <div className="max-w-xl mx-auto card p-6">
      <h2 className="heading-gold text-2xl font-bold mb-4">تفاصيل الدعوة</h2>
      <div className="mb-4">
        <div className="font-medium"> اسم الضيف السيد/ة: <span className="text-gray-900">{invitation.guestName}</span></div>
        <div className="font-medium">عدد الأشخاص: <span className="text-gray-900">{invitation.numOfPeople}</span></div>
        <div className="font-medium">تاريخ الفعالية: <span className="text-gray-900">{invitation.eventId?.eventDate ? formatSyrianDate(invitation.eventId.eventDate) : '-'}</span></div>
        <div className="font-medium">اسم الفعالية: <span className="text-gray-900">{invitation.eventId?.eventName || '-'}</span></div>
        <div className={invitation.used ? 'text-green-600' : 'text-yellow-600'}>
          الحالة: {invitation.used ? 'مستخدم' : 'متاح'}
        </div>
      </div>

      {/* بطاقة الكرت للطباعة كصورة (حجم كرت فيزيائي تقريباً 1050x600 بكسل) */}
      {(() => {
        const base = (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) ? process.env.PUBLIC_URL : '';
        const templateUrl = `${API_BASE}${invitation?.eventId?.templateId?.imageUrl}` || `${base}/images/invitation-card-template.png`;
        return (
          <div className="w-full" style={{ overflowX: 'auto' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={cardRef}
            className="mx-auto mb-4 bg-white rounded-xl border shadow relative overflow-hidden"
            style={{
              width: 600,
              height: 600,
              direction: 'rtl',
              contain: 'layout paint size',
              backgroundImage: `url(${templateUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* الخلفية الآن عبر CSS فقط لضمان أن نفس المسار يغطي كامل الكرت */}

            {/* طبقة المحتوى */}
            <div className="absolute inset-0 flex flex-col justify-between p-10">
              {/* رأس: الفعالية والصالة والموقع والتاريخ */}
              <div className="text-right space-y-1">
                {hostName && (
                  <div className="inline-block mb-2 text-2xl font-extrabold text-gray-900 px-4 py-2 rounded-lg bg-white/80 backdrop-blur drop-shadow">
                    {hostName} يدعوكم لحضور الحفل
                  </div>
                )}
                <div className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">
                  {invitation.eventId?.eventName || 'دعوة حضور'}
                </div>
                <div className="text-lg text-gray-900">{invitation.eventId?.hallId?.name || dashEvent?.hallId?.name || '-'}</div>
                <div className="text-sm text-gray-800">{invitation.eventId?.hallId?.location || dashEvent?.hallId?.location || '-'}</div>
                <div className="text-sm text-gray-800">{invitation.eventId?.eventDate ? formatSyrianDate(invitation.eventId.eventDate) : '-'}</div>
              </div>

              {/* الوسط: معلومات الضيف و QR */}
              <div className="flex items-center justify-between mt-4">
                {/* معلومات الضيف */}
                <div className="text-right" style={{ maxWidth: 620 }}>
                  <div className="text-2xl text-gray-900 mb-3"><span className="font-semibold">السيد/ة:</span> {invitation.guestName}</div>
                  <div className="text-2xl text-gray-900 mb-3"><span className="font-semibold">عدد الضيوف:</span> {invitation.numOfPeople}</div>
                  {/* معلومات إضافية عن الحفل */}                  
                  <div className="text-xl text-gray-900 mb-1"><span className="font-semibold">الصالة:</span> {invitation.eventId?.hallId?.name || dashEvent?.hallId?.name || '-'}</div>
                  <div className="text-xl text-gray-900"><span className="font-semibold">العنوان:</span> {invitation.eventId?.hallId?.location || dashEvent?.hallId?.location || '-'}</div>
                </div>

                {/* QR */}
                <div className="absolute top-[53%] left-[50%] translate-x-[-47%]  w-26 h-27" >
                  {invitation.qrCodeImage && (
                    <img src={invitation.qrCodeImage} alt="QR Code" className=' absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]' crossOrigin="anonymous"  />
                  )}
                </div>
              </div>

              {/* ذيل: ملاحظة عامة */}
              <div className="text-center text-base text-gray-800">يرجى إبراز هذا الكرت عند الدخول</div>
              <div className="text-center text-base text-gray-800">{invitation.qrCode}</div>
            </div>
          </div>
            </div>
          </div>
        )
      })()}

      <div className="flex gap-2 mt-4">
        <button className="btn px-4 py-2 rounded" onClick={downloadPng}>
          تنزيل PNG
        </button>
        <Link to={`/client/invitations/edit/${invitation._id || id}`} className="btn-secondary px-4 py-2 rounded">تعديل</Link>
        <Link to="/client/invitations" className="btn-secondary px-4 py-2 rounded">العودة للقائمة</Link>
      </div>
    </div>
  );
}
