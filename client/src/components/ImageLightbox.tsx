import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ImageLightboxProps {
  src: string
  alt?: string
  isOpen: boolean
  onClose: () => void
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setScale(1)
      setIsLoading(true)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.25, 3))
      if (e.key === '-') setScale((s) => Math.max(s - 0.25, 0.5))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'image'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setScale((s) => Math.max(s - 0.25, 0.5))
          }}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setScale((s) => Math.min(s + 0.25, 3))
          }}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <img
          src={src}
          loading="eager"
          alt={alt || 'Image'}
          className={cn(
            'max-w-full max-h-[90vh] object-contain transition-all duration-300 select-none',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{ transform: `scale(${scale})` }}
          onLoad={() => setIsLoading(false)}
          draggable={false}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {Math.round(scale * 100)}% | Press ESC to close
      </div>
    </div>
  )
}

interface ClickableImageProps {
  src: string
  alt?: string
  className?: string
  containerClassName?: string
}

export function ClickableImage({ src, alt, className, containerClassName }: ClickableImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={cn('cursor-zoom-in', containerClassName)} onClick={() => setIsOpen(true)}>
        <img src={src} loading="lazy" alt={alt} className={className} />
      </div>
      <ImageLightbox src={src} alt={alt} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
