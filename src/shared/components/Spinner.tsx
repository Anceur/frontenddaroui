import React from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize | number
  color?: string
  className?: string
  label?: string
}

function getPixelSize(size: SpinnerSize | number): number {
  if (typeof size === 'number') return size
  if (size === 'sm') return 16
  if (size === 'md') return 24
  return 32
}

export default function Spinner({ size = 'md', color = '#111827', className = '', label }: SpinnerProps): JSX.Element {
  const px = getPixelSize(size)
  const stroke = color

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite" aria-busy="true">
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke={stroke} strokeOpacity="0.15" strokeWidth="4" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      </svg>
      {label && (
        <span style={{ color: '#6B7280' }} className="text-sm">{label}</span>
      )}
    </div>
  )
}



