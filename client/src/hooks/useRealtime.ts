import { logger } from '@/lib/logger'
import { useCallback, useEffect, useState } from 'react'

interface RealtimeMessage {
  type: string
  data: any
  timestamp: string
}

export function useRealtime(onMessage?: (message: RealtimeMessage) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/realtime`
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        logger.info('Connected to real-time server')
        setIsConnected(true)
        setError(null)
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as RealtimeMessage
          logger.debug('Received real-time message:', message)
          if (onMessage) {
            onMessage(message)
          }
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error)
        }
      }

      socket.onerror = (error) => {
        logger.error('WebSocket error:', error)
        setError(new Error('WebSocket connection error'))
        setIsConnected(false)
      }

      socket.onclose = () => {
        logger.info('Disconnected from real-time server')
        setIsConnected(false)
      }

      setWs(socket)
    } catch (error) {
      logger.error('Error connecting to WebSocket:', error)
      setError(error instanceof Error ? error : new Error('Connection failed'))
    }
  }, [onMessage])

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close()
      setWs(null)
      setIsConnected(false)
    }
  }, [ws])

  const send = useCallback(
    (message: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        logger.warn('WebSocket not connected')
      }
    },
    [ws]
  )

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    error,
    send,
    disconnect,
  }
}
