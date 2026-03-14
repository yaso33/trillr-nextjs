import type React from 'react'
import { useState } from 'react'

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** If true, image is considered high priority (LCP) and will be loaded eagerly */
  priority?: boolean
  /** small base64 or tiny placeholder image to show while real image loads */
  placeholder?: string
}

export default function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  placeholder,
  onLoad,
  srcSet,
  sizes,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false)

  const wrapperStyle: React.CSSProperties =
    placeholder && !loaded
      ? {
          backgroundImage: `url(${placeholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}

  return (
    <div className={`relative overflow-hidden ${className || ''}`} style={wrapperStyle}>
      {!loaded && (
        // subtle blurred overlay while image loads
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 to-muted/20" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        // Some browsers support `fetchpriority` (lowercase); React warns on unknown camelCase props
        {...(priority ? ({ fetchpriority: 'high' } as any) : {})}
        decoding="async"
        srcSet={srcSet}
        sizes={sizes}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={(e) => {
          setLoaded(true)
          if (onLoad) onLoad(e as any)
        }}
        {...rest}
      />
    </div>
  )
}
