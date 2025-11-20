import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ResetPassword from '../pages/auth/ResetPassword'
import Profile from '../pages/Profile'
import AdminLayout from '../pages/admin/AdminLayout'
import ManagerLayout from '../pages/manager/ManagerLayout'
import ClientLayout from '../pages/client/ClientLayout'
import ScannerLayout from '../pages/scanner/ScannerLayout'
import { getToken, getUser } from '../api/auth'

function PrivateRoute({ children, roles }) {
  const token = getToken()
  const user = getUser()
  if(!token || !user) return <Navigate to="/login" replace/>
  if(roles && !roles.includes(user.role)) return <Navigate to="/login" replace/>
  return children
}

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
      <Route path="/admin/*" element={<PrivateRoute roles={['admin']}><AdminLayout/></PrivateRoute>} />
      <Route path="/manager/*" element={<PrivateRoute roles={['manager']}><ManagerLayout/></PrivateRoute>} />
      <Route path="/client/*" element={<PrivateRoute roles={['client']}><ClientLayout/></PrivateRoute>} />
      <Route path="/scanner/*" element={<PrivateRoute roles={['scanner']}><ScannerLayout/></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to='/login' replace/>} />
    </Routes>
  )
}
