'use client'

import dynamic from 'next/dynamic'

const ClientApp = dynamic(() => import('../../client/src/ClientApp'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#1A1D21]">
      <div className="text-2xl text-white">Loading...</div>
    </div>
  ),
})

export default function Page() {
  return <ClientApp />
}
