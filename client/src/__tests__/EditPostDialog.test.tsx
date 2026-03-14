import EditPostDialog from '@/components/EditPostDialog'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/usePosts', () => ({
  useUpdatePost: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: '1', content: 'updated' }),
    isPending: false,
  }),
}))

// Provide minimal language context so component can render text
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k: string) => k, language: 'en', isRTL: false, setLanguage: () => {} }),
}))

describe('EditPostDialog', () => {
  it('renders and calls save', async () => {
    const onOpenChange = vi.fn()
    render(
      <EditPostDialog open={true} onOpenChange={onOpenChange} postId="1" initialContent="hello" />
    )

    const saveBtn = screen.getByText(/Save|حفظ/)
    expect(saveBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
