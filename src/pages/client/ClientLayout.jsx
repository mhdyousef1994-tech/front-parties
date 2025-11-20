import React from 'react'
import TopBar from '../../components/TopBar'
import Sidebar from '../../components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import ClientHome from './ClientHome'
import ClientInvitations from './invitations/ClientInvitations'
import ClientInvitationAdd from './invitations/ClientInvitationAdd'
import ClientInvitationEdit from './invitations/ClientInvitationEdit'
import ClientInvitationShow from './invitations/ClientInvitationShow'
import Profile from '../Profile'
import ClientReports from './ClientReports'

export default function ClientLayout(){
  const [open, setOpen] = React.useState(false)
  const items=[
    {to:'/client',label:'الرئيسية'},
    {to:'/client/reports',label:'التقارير'},
    {to:'/client/invitations',label:'دعواتي'},
    {to:'/client/profile',label:'الملف الشخصي'},
  ];
  return (
    <div className='client-theme min-h-screen flex bg-white text-ink font-cairo'>
      <Sidebar items={items} isOpen={open} onClose={()=>setOpen(false)} />
      <div className='flex-1 md:pr-64'>
        <TopBar onToggleSidebar={()=>setOpen(v=>!v)} />
        <div className='p-4 sm:p-6 pt-16 animate-fade-in'>
          <Routes>
            <Route path='/' element={<ClientHome/>} />
            <Route path='reports' element={<ClientReports/>} />
            <Route path='invitations' element={<ClientInvitations/>} />
            <Route path='invitations/add' element={<ClientInvitationAdd/>} />
            <Route path='invitations/edit/:id' element={<ClientInvitationEdit/>} />
            <Route path='invitations/:id' element={<ClientInvitationShow/>} />
            <Route path='profile' element={<Profile/>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
