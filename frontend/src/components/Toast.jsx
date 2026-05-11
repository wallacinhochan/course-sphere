import { useState, useEffect } from 'react'

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 border rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-fade-in max-w-sm ${colors[type]}`}>
      <span className="text-base">{icons[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
    </div>
  )
}