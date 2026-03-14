import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateChannel } from '@/hooks/useCommunities'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface CreateChannelDialogProps {
  communityId: string
  onCreated?: (channel: any) => void
}

export default function CreateChannelDialog({ communityId, onCreated }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'voice'>('text')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const createChannelMutation = useCreateChannel(communityId)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: 'Missing name',
        description: 'Please enter a channel name.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      const channel = await createChannelMutation.mutateAsync({
        name: name.trim(),
        type,
        isPrivate,
      })
      toast({
        title: 'Channel created',
        description: `#${channel.name} has been created.`,
      })
      setName('')
      setType('text')
      setIsPrivate(false)
      setOpen(false)
      onCreated?.(channel)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create channel. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>Channels help organize conversations within the community.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel-name" className="text-right">
              Name
            </Label>
            <Input
              id="channel-name"
              placeholder="e.g. general"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel-type" className="text-right">
              Type
            </Label>
            <select
              id="channel-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'text' | 'voice')}
              className="col-span-3 px-3 py-2 border rounded-md border-input bg-background"
              disabled={isLoading}
            >
              <option value="text">Text</option>
              <option value="voice">Voice</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel-private" className="text-right">
              Private
            </Label>
            <input
              id="channel-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
