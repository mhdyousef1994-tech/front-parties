import React, { useState, useEffect } from 'react';
import { addInvitation, getAddInvitationContext, listInvitations } from '../../../api/client';
import { useNavigate } from 'react-router-dom';

export default function ClientInvitationAdd() {
  const [form, setForm] = useState({ guestName: '', numOfPeople: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [capacity, setCapacity] = useState(null); // الحد الأقصى من الضيوف للحفل
  const [usedGuests, setUsedGuests] = useState(0); // مجموع الضيوف الحاليين في الدعوات
  const navigate = useNavigate();

  useEffect(() => {
    // جلب سياق الإضافة لمعرفة سعة الحفل
    getAddInvitationContext()
      .then(ctx => {
        const cap = ctx?.event?.numOfPeople;
        if (typeof cap === 'number') setCapacity(cap);
      })
      .catch(() => {})
      .finally(() => {
        // حساب الضيوف المستخدمين حالياً من الدعوات
        listInvitations()
          .then(list => {
            const arr = Array.isArray(list) ? list : (list?.invitations || []);
            const sum = arr.reduce((s, it) => s + (parseInt(it.numOfPeople, 10) || 0), 0);
            setUsedGuests(sum);
          })
          .catch(() => setUsedGuests(0));
      });
  }, []);

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
    // تحقق من عدم تجاوز السعة
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
      const res = await addInvitation(payload);
      setSuccess(res.message || 'تمت إضافة الدعوة بنجاح');
      setTimeout(() => navigate('/client/invitations'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء الإضافة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto card p-6">
      <h2 className="heading-gold text-2xl font-bold mb-4">إضافة دعوة</h2>
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
            <div className="mt-1">لا يمكنك إضافة مزيد من الضيوف، لقد وصلت للحد الأقصى.</div>
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
          {loading ? 'يتم الإضافة...' : 'إضافة الدعوة'}
        </button>
      </form>
    </div>
  );
}
