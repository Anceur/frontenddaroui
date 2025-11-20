import React from 'react'
import Spinner from './Spinner'

interface FullscreenLoaderProps {
  message?: string
}

export default function FullscreenLoader({ message = 'Loading…' }: FullscreenLoaderProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.65)' }}>
      <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-lg shadow" style={{ background: 'white', border: '1px solid #F3F4F6' }}>
        <Spinner size="lg" color="#111827" />
        <p className="text-sm" style={{ color: '#374151' }}>{message}</p>
      </div>
    </div>
  )
}



