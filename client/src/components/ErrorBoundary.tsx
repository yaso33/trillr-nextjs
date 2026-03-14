import React from 'react'
import { ErrorLogger } from '../lib/errorHandler'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: any
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    ErrorLogger.log(error, 'ErrorBoundary')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-8">
          <h2 className="text-2xl font-bold mb-2 text-destructive">حدث خطأ غير متوقع</h2>
          <pre className="bg-muted/40 rounded p-4 text-sm max-w-xl overflow-x-auto text-left rtl:text-right">
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <p className="mt-4 text-muted-foreground">يرجى إعادة تحميل الصفحة أو التواصل مع الدعم.</p>
        </div>
      )
    }
    return this.props.children
  }
}
