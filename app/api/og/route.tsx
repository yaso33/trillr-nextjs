import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

function isArabic(str: string): boolean {
  return /[\u0600-\u06FF]/.test(str)
}

function safeTruncate(text: string, max: number): string {
  if (!text) return ''
  const clean = isArabic(text) ? '' : text
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'default'
  const rawTitle = searchParams.get('title') || 'Trillr'
  const rawDesc = searchParams.get('description') || 'Social media platform'
  const username = searchParams.get('username') || ''
  const avatar = searchParams.get('avatar') || ''

  const title = isArabic(rawTitle) ? 'Trillr' : safeTruncate(rawTitle, 120)
  const description = isArabic(rawDesc) ? 'Social media platform' : safeTruncate(rawDesc, 200)

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1A1D21 0%, #0f1114 100%)',
            padding: '60px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Header — Trillr Brand */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                color: 'white',
                fontWeight: 'bold',
                marginRight: '14px',
              }}
            >
              T
            </div>
            <span style={{ color: '#a78bfa', fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
              Trillr
            </span>
          </div>

          {/* Content */}
          {type === 'post' ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {username && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
                  {avatar ? (
                    <img
                      src={avatar}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        marginRight: '14px',
                        objectFit: 'cover',
                        border: '2px solid #8B5CF6',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                        marginRight: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      {username[0]?.toUpperCase()}
                    </div>
                  )}
                  <span style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: '600' }}>
                    @{username}
                  </span>
                </div>
              )}
              <p
                style={{
                  color: '#f8fafc',
                  fontSize: '36px',
                  lineHeight: '1.5',
                  margin: 0,
                  flex: 1,
                }}
              >
                {title}
              </p>
            </div>
          ) : type === 'profile' ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {avatar ? (
                <img
                  src={avatar}
                  style={{
                    width: '128px',
                    height: '128px',
                    borderRadius: '50%',
                    marginBottom: '28px',
                    objectFit: 'cover',
                    border: '4px solid #8B5CF6',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '128px',
                    height: '128px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '56px',
                    fontWeight: 'bold',
                  }}
                >
                  {(username || title)[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <p style={{ color: '#f8fafc', fontSize: '44px', fontWeight: 'bold', margin: '0 0 12px', textAlign: 'center' }}>
                {title}
              </p>
              {username && (
                <p style={{ color: '#a78bfa', fontSize: '26px', margin: '0 0 16px' }}>@{username}</p>
              )}
              {description && description !== 'Social media platform' && (
                <p style={{ color: '#94a3b8', fontSize: '20px', marginTop: '8px', textAlign: 'center', maxWidth: '700px' }}>
                  {description}
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <p style={{ color: '#f8fafc', fontSize: '56px', fontWeight: 'bold', lineHeight: '1.3', margin: '0 0 20px' }}>
                {title}
              </p>
              {description && description !== 'Social media platform' && (
                <p style={{ color: '#94a3b8', fontSize: '28px', margin: 0 }}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <span style={{ color: '#64748b', fontSize: '18px' }}>trillr.app</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(139,92,246,0.15)',
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <span style={{ color: '#a78bfa', fontSize: '16px' }}>Social Platform</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (err) {
    console.error('[OG] ImageResponse error:', err)
    return new Response('OG image generation failed', { status: 500 })
  }
}
