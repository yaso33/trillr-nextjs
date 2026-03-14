import EditPostDialog from '@/components/EditPostDialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function E2EHarness() {
  const [post, setPost] = useState({ id: '1', content: 'hello' })
  const [open, setOpen] = useState(false)

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-card/50 border rounded p-4">
        <h3 className="font-semibold mb-2">Post</h3>
        <p data-testid="harness-post-content" className="mb-4">
          {post.content}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Edit post</Button>
        </div>
      </div>

      <EditPostDialog
        open={open}
        onOpenChange={setOpen}
        postId={post.id}
        initialContent={post.content}
        onSaveOverride={async (_postId, content) => {
          // eslint-disable-next-line no-console
          console.log('E2E harness onSaveOverride called with', content)
          setPost((p) => ({ ...p, content: content || p.content }))
        }}
      />
    </div>
  )
}
