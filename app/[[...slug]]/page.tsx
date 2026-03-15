'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Loading from '../loading'

const ClientApp = dynamic(() => import('../../client/src/ClientApp'), {
  ssr: false,
  loading: () => <Loading />,
})

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientApp />
    </Suspense>
  )
}
