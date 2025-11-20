import React from 'react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full md:max-w-2xl lg:max-w-4xl card relative flex flex-col max-h-[90vh]">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 z-10 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header - Fixed */}
          {title && (
            <div className="px-6 pt-6 pb-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="heading-gold text-lg font-semibold">{title}</h3>
            </div>
          )}

          {/* Content - Scrollable */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer - Fixed */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-white">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
