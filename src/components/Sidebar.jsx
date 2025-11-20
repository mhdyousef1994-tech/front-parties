import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar({items, isOpen=false, onClose}){
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className='hidden md:block fixed top-16 right-0 h-[calc(100vh-64px)] w-64 border-r border-gold-100 bg-white p-4 overflow-y-auto z-30 shadow-elegant'>
        <nav className='flex flex-col gap-1 font-cairo'>
          {items.map(i=> (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.to.split('/').filter(Boolean).length===1}
              className={({isActive})=>[
                'block px-3 py-2 rounded transition-colors border-r-4 border-transparent',
                isActive ? 'active bg-gold-50 font-semibold border-r-4 border-gold text-ink' : 'hover:bg-gold-50'
              ].join(' ')}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-40 ${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div className='absolute inset-0 bg-black/40' onClick={onClose} />
        {/* Panel */}
        <div className='absolute top-16 right-0 h-[calc(100vh-64px)] w-64 bg-white border-l border-gold-100 shadow-elegant p-4 overflow-y-auto'>
          <button className='mb-3 px-3 py-1 border border-gold text-ink rounded hover:bg-gold-50' onClick={onClose}>إغلاق</button>
          <nav className='flex flex-col gap-1 font-cairo'>
            {items.map(i=> (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.to.split('/').filter(Boolean).length===1}
                className={({isActive})=>[
                  'block px-3 py-2 rounded transition-colors border-r-4 border-transparent',
                  isActive ? 'active bg-gold-50 font-semibold border-r-4 border-gold text-ink' : 'hover:bg-gold-50'
                ].join(' ')}
                onClick={onClose}
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
