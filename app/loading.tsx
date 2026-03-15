export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1A1D21',
        gap: '32px',
      }}
    >
      {/* Trillr Logo */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white',
          fontWeight: 'bold',
          animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        }}
      >
        T
      </div>

      {/* Skeleton feed cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '480px', padding: '0 16px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#25282D',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: 1 - i * 0.2,
            }}
          >
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#363a40' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: '120px', height: '14px', borderRadius: '8px', background: '#363a40' }} />
                <div style={{ width: '80px', height: '11px', borderRadius: '8px', background: '#2e3238' }} />
              </div>
            </div>
            {/* Content lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '100%', height: '13px', borderRadius: '8px', background: '#363a40' }} />
              <div style={{ width: '85%', height: '13px', borderRadius: '8px', background: '#363a40' }} />
              <div style={{ width: '65%', height: '13px', borderRadius: '8px', background: '#2e3238' }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </div>
  )
}
