import React from 'react'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={'/attached_assets/logo_new.png'}
      alt="Logo"
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: '8px' }}
    />
  )
}
