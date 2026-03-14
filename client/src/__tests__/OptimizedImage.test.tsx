import OptimizedImage from '@/components/OptimizedImage'
import { fireEvent, render, screen } from '@testing-library/react'

describe('OptimizedImage', () => {
  it('renders placeholder and swaps to real image on load', () => {
    render(<OptimizedImage src="/test.jpg" alt="test" placeholder="/tiny.jpg" />)

    const img = screen.getByAltText('test') as HTMLImageElement
    // image should be present but hidden until load
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('loading', 'lazy')

    // simulate load
    fireEvent.load(img)
    // after load class should make it visible
    expect(img.className).toMatch(/opacity-100/)
  })

  it('accepts srcSet and sizes and priority', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="test"
        srcSet="/small.jpg 480w, /medium.jpg 1024w"
        sizes="(max-width: 600px) 480px, 1024px"
        priority
      />
    )

    const img = screen.getByAltText('test')
    expect(img).toHaveAttribute('srcset')
    expect(img).toHaveAttribute('sizes')
    expect(img).toHaveAttribute('loading', 'eager')
  })
})
