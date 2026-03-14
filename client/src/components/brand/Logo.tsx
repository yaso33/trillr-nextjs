import type { HTMLAttributes } from 'react'

interface LogoProps extends HTMLAttributes<HTMLImageElement> {
  width?: number
  height?: number
}

export function Logo({ width = 48, height = 48, ...props }: LogoProps) {
  return <img src="/trillr.png" alt="Trillr Logo" width={width} height={height} {...props} />
}
