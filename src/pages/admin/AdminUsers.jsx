import React from 'react'
import { listUsers, activateUser, deactivateUser, deleteUser } from '../../../api/admin'
import { formatSyrianDate } from '../../utils/date'

export default function AdminUsers(){
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')

  React.useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    try { const res = await listUsers(); setUsers(res) } catch (error) { console.error('Error loading users:', error) } finally { setLoading(false) }
  }

  const handleActivate = async (userId) => { try { await activateUser(userId); await loadUsers(); alert('تم تفعيل المستخدم بنجاح') } catch (error) { alert('حدث خطأ أثناء التفعيل') } }
  const handleDeactivate = async (userId) => { try { await deactivateUser(userId); await loadUsers(); alert('تم تعطيل المستخدم بنجاح') } catch (error) { alert('حدث خطأ أثناء التعطيل') } }
  const handleDelete = async (userId) => { if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return; try { await deleteUser(userId); await loadUsers(); alert('تم حذف المستخدم بنجاح') } catch (error) { alert('حدث خطأ أثناء الحذف') } }

  const getRoleLabel = (role) => ({ 'admin': 'مدير التطبيق', 'manager': 'المدير العام', 'scanner': 'ماسح', 'client': 'عميل' }[role] || role)
  const getRoleColor = (role) => ({ 'admin': 'bg-red-100 text-red-800', 'manager': 'bg-blue-100 text-blue-800', 'scanner': 'bg-green-100 text-green-800', 'client': 'bg-gray-100 text-gray-800' }[role] || 'bg-gray-100 text-gray-800')
  const getStatusColor = (isActive) => isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const exportCSV = () => {
    const rows = [['الاسم','الدور','الحالة','البريد','آخر دخول'], ...filteredUsers.map(u=>[u.name,getRoleLabel(u.role),u.isActive?'نشط':'موقوف',u.email||'',u.lastLogin?formatSyrianDate(u.lastLogin):'' ])]
    const csv = rows.map(r=>r.map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',')).join('\r\n')
    const bom = '\ufeff' // UTF-8 BOM
    const blob = new Blob([bom + csv], {type:'text/csv;charset=utf-8;'})
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'users.csv'; link.click()
  }

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.text('تقرير المستخدمين', 10, 10)
    filteredUsers.slice(0,40).forEach((u,idx)=>{ doc.text(`${idx+1}. ${u.name} - ${getRoleLabel(u.role)} - ${u.isActive?'نشط':'موقوف'}`, 10, 20+idx*6) })
    doc.save('users.pdf')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className='px-3 py-2 border rounded'>تصدير CSV</button>
          <button onClick={exportPDF} className='px-3 py-2 border rounded'>تصدير PDF</button>
        </div>
      </div>
      {/* rest unchanged */}
    </div>
  )
}