import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Link, Mail } from 'lucide-react'
import { useState } from 'react'
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  postType?: 'post' | 'video'
}

export default function ShareDialog({
  open,
  onOpenChange,
  postId,
  postType = 'post',
}: ShareDialogProps) {
  const { toast } = useToast()
  const shareUrl = `${window.location.origin}/${postType}/${postId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'Link copied!',
      description: 'Share link has been copied to clipboard.',
    })
    onOpenChange(false)
  }

  const shareVia = (platform: string) => {
    let url = ''
    const text = `Check out this ${postType} on Tinar!`

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(shareUrl)}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/30 neon-glow">
        <DialogHeader>
          <DialogTitle className="neon-text">Share {postType}</DialogTitle>
          <DialogDescription>
            Share this {postType} with your friends and followers
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Button
            onClick={copyToClipboard}
            className="w-full justify-start neon-glow hover-elevate"
            variant="outline"
          >
            <Link className="h-5 w-5 mr-3" strokeWidth={2} />
            Copy Link
          </Button>

          <Button
            onClick={() => shareVia('facebook')}
            className="w-full justify-start hover-elevate bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FaFacebook className="h-5 w-5 mr-3" />
            Share on Facebook
          </Button>

          <Button
            onClick={() => shareVia('twitter')}
            className="w-full justify-start hover-elevate bg-sky-500 hover:bg-sky-600 text-white"
          >
            <FaTwitter className="h-5 w-5 mr-3" />
            Share on Twitter
          </Button>

          <Button
            onClick={() => shareVia('whatsapp')}
            className="w-full justify-start hover-elevate bg-green-600 hover:bg-green-700 text-white"
          >
            <FaWhatsapp className="h-5 w-5 mr-3" />
            Share on WhatsApp
          </Button>

          <Button
            onClick={() => shareVia('email')}
            className="w-full justify-start neon-glow hover-elevate"
            variant="outline"
          >
            <Mail className="h-5 w-5 mr-3" strokeWidth={2} />
            Share via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
