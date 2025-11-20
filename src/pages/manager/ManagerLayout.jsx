import React from 'react'
import TopBar from '../../components/TopBar'
import Sidebar from '../../components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import ManagerHome from './ManagerHome'
import ManagerEvents from './events/ManagerEvents'
import ManagerEmployees from './employees/ManagerEmployees'
import ManagerClients from './clients/ManagerClients'
import ManagerComplaints from './complaints/ManagerComplaints'
import ManagerTemplates from './templates/ManagerTemplates'
import ManagerHallSettings from './hall/ManagerHallSettings'
import Profile from '../Profile'
import ManagerReports from './ManagerReports'

export default function ManagerLayout(){
  const [open, setOpen] = React.useState(false)
  const items = [
    {to:'/manager',label:'الرئيسية'},
    {to:'/manager/reports',label:'التقارير'},
    {to:'/manager/events',label:'الحجوزات'},
    {to:'/manager/employees',label:'الموظفون'},
    {to:'/manager/templates',label:'قوالب الدعوات'},
    {to:'/manager/hall',label:'إعدادات الصالة'},
    {to:'/manager/clients',label:'العملاء'},
    {to:'/manager/complaints',label:'الشكاوى'},
    {to:'/manager/profile',label:'الملف الشخصي'},
  ]
  
  return (
    <div className='client-theme min-h-screen flex bg-white text-ink font-cairo'>
      <Sidebar items={items} isOpen={open} onClose={()=>setOpen(false)} />
      <div className='flex-1 md:pr-64'>
         <TopBar onToggleSidebar={()=>setOpen(v=>!v)} />
        <div className='p-4 sm:p-6 pt-16 animate-fade-in'>
          <Routes>
            <Route path='/' element={<ManagerHome/>} />
            <Route path='reports' element={<ManagerReports/>} />
            <Route path='events/*' element={<ManagerEvents/>} />
            <Route path='employees/*' element={<ManagerEmployees/>} />
            <Route path='templates/*' element={<ManagerTemplates/>} />
            <Route path='hall/*' element={<ManagerHallSettings/>} />
            <Route path='clients/*' element={<ManagerClients/>} />
            <Route path='complaints/*' element={<ManagerComplaints/>} />
            <Route path='profile' element={<Profile/>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
