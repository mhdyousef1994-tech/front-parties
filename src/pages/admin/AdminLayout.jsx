import React from 'react'
import TopBar from '../../components/TopBar'
import Sidebar from '../../components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import AdminHome from './AdminHome'
import Profile from '../Profile'
import AdminHalls from './halls/AdminHalls'
import AdminServices from './services/AdminServices'
import AdminTemplates from './templates/AdminTemplates'
import AdminUsers from './users/AdminUsers'
import AdminManagers from './managers/AdminManagers'
import AdminComplaints from './complaints/AdminComplaints'
import AdminReports from './AdminReports'
export default function AdminLayout(){
  const [open, setOpen] = React.useState(false)
  const items=[
    {to:'/admin',label:'الرئيسية'},
    {to:'/admin/reports',label:'التقارير'},
    {to:'/admin/halls',label:'الصالات'},
    {to:'/admin/services',label:'الخدمات'},
    {to:'/admin/templates',label:'القوالب'},
    {to:'/admin/users',label:'المستخدمون'},
    {to:'/admin/managers',label:'المدراء'},
    {to:'/admin/complaints',label:'الشكاوى'},
    {to:'/admin/profile',label:'الملف الشخصي'},
  ]
  return (
    <div className='client-theme min-h-screen flex bg-white text-ink font-cairo'>
      <Sidebar items={items} isOpen={open} onClose={()=>setOpen(false)} />
      <div className='flex-1 md:pr-64'>
        <TopBar onToggleSidebar={()=>setOpen(v=>!v)} />
        <div className='p-4 sm:p-6 pt-16 animate-fade-in'>
          <Routes>
            <Route path='/' element={<AdminHome/>} />
            <Route path='reports' element={<AdminReports/>} />
            <Route path='profile' element={<Profile/>} />
            <Route path='halls/*' element={<AdminHalls/>} />
            <Route path='services/*' element={<AdminServices/>} />
            <Route path='templates/*' element={<AdminTemplates/>} />
            <Route path='users/*' element={<AdminUsers/>} />
            <Route path='managers/*' element={<AdminManagers/>} />
            <Route path='complaints/*' element={<AdminComplaints/>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
