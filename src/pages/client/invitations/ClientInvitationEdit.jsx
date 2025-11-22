import React, { useEffect, useState } from 'react';
import { editInvitation, getInvitation, getAddInvitationContext, listInvitations } from '../../../api/client';
import { useParams, useNavigate } from 'react-router-dom';

export default function ClientInvitationEdit() {
  const { id } = useParams();
  const [form, setForm] = useState({ guestName: '', numOfPeople: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [capacity, setCapacity] = useState(null);
  const [usedGuests, setUsedGuests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // جلب بيانات الدعوة
        const invitation = await getInvitation(id);
        setForm({
          guestName: invitation.guestName || '',
          numOfPeople: invitation.numOfPeople || 1,
        });

        // جلب سياق الإضافة للسعة الكلية
        const ctx = await getAddInvitationContext();
        const cap = ctx?.event?.numOfPeople;
        if (typeof cap === 'number') setCapacity(cap);

        // حساب الضيوف المستخدمين
        const list = await listInvitations();
        const arr = Array.isArray(list) ? list : (list?.invitations || []);
        const sum = arr.reduce((s, it) => s + (parseInt(it.numOfPeople, 10) || 0), 0);
        setUsedGuests(sum - invitation.numOfPeople); // استثناء العدد الحالي للدعوة نفسها
      } catch (err) {
        setError('تعذر تحميل بيانات الدعوة أو سياق الإضافة');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'numOfPeople') {
      const n = Math.max(1, parseInt(value || '1', 10));
      v = Number.isNaN(n) ? 1 : n;
    }
    setForm(f => ({ ...f, [name]: v }));
    setFieldErrors(fe => ({ ...fe, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.guestName || !form.guestName.trim()) errs.guestName = 'اسم الضيف مطلوب';
    const n = parseInt(form.numOfPeople, 10);
    if (!n || Number.isNaN(n) || n < 1) errs.numOfPeople = 'عدد الأشخاص يجب أن يكون رقمًا أكبر من أو يساوي 1';
    
    if (capacity != null) {
      const remaining = Math.max(0, capacity - usedGuests);
      if (n > remaining) {
        errs.numOfPeople = `العدد المطلوب (${n}) يتجاوز المتاح (${remaining}).`;
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!validate()) { setLoading(false); return; }
    try {
      const payload = {
        guestName: form.guestName.trim(),
        numOfPeople: parseInt(form.numOfPeople, 10)
      };
      const res = await editInvitation(id, payload);
      setSuccess(res.message || 'تم تعديل الدعوة بنجاح');
      setTimeout(() => navigate('/client/invitations'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-xl mx-auto card p-6">
      <h2 className="heading-gold text-2xl font-bold mb-4">تعديل الدعوة</h2>

      {(capacity != null) && (
        <div className="mb-4 p-3 rounded border text-sm"
             style={{
               backgroundColor: (capacity - usedGuests) <= 0 ? '#FEF2F2' : '#F0FDF4',
               borderColor: (capacity - usedGuests) <= 0 ? '#FCA5A5' : '#86EFAC',
               color: (capacity - usedGuests) <= 0 ? '#B91C1C' : '#166534'
             }}>
          <div>السعة الكلية للحفل: <b>{capacity}</b></div>
          <div>المستخدم حالياً: <b>{usedGuests}</b></div>
          <div>المتبقي: <b>{Math.max(0, capacity - usedGuests)}</b></div>
          {(capacity - usedGuests) <= 0 && (
            <div className="mt-1">لا يمكنك تعديل العدد ليزيد عن الحد المتاح.</div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">اسم الضيف</label>
          <input
            type="text"
            name="guestName"
            value={form.guestName}
            onChange={handleChange}
            required
            className="input"
          />
          {fieldErrors.guestName && <div className="text-red-600 text-sm mt-1">{fieldErrors.guestName}</div>}
        </div>
        <div>
          <label className="block mb-1 font-medium">عدد الأشخاص</label>
          <input
            type="number"
            name="numOfPeople"
            value={form.numOfPeople}
            onChange={handleChange}
            min="1"
            required
            className="input"
          />
          {fieldErrors.numOfPeople && <div className="text-red-600 text-sm mt-1">{fieldErrors.numOfPeople}</div>}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button
          type="submit"
          className="btn"
          disabled={loading || (capacity != null && Math.max(0, capacity - usedGuests) <= 0)}
        >
          {loading ? 'يتم التعديل...' : 'تعديل الدعوة'}
        </button>
      </form>
    </div>
  );
}
