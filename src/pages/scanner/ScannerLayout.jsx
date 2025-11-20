import React from 'react'
import TopBar from '../../components/TopBar'
import { Routes, Route } from 'react-router-dom'
import ScannerHome from './ScannerHome'
import ScannerScan from './ScannerScan'
import ScannerEventInvitations from './ScannerEventInvitations'
import ScannerScanResult from './ScannerScanResult'
import ScannerReports from './ScannerReports'

export default function ScannerLayout(){ return (<div className='min-h-screen bg-white text-ink font-cairo'><TopBar /><div className='p-6 animate-fade-in'><Routes>
  <Route path='/' element={<ScannerHome/>} />
  <Route path='reports' element={<ScannerReports/>} />
  <Route path='scan' element={<ScannerScan/>} />
  <Route path='events/:id/invitations' element={<ScannerEventInvitations/>} />
  <Route path='verify/:code' element={<ScannerScanResult/>} />
</Routes></div></div>) }
