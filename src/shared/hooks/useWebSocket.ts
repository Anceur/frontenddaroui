import { useEffect, useRef, useState, useCallback } from 'react'
import { API } from '../api/API'
import { getWebSocketToken } from '../api/websocket-token'
import type { Notification } from '../api/notifications'

interface UseWebSocketOptions {
  onNotification?: (notification: Notification) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  enabled?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onNotification,
    onConnect,
    onDisconnect,
    onError,
    enabled = true
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const reconnectAttemptsRef = useRef(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)

  const connect = useCallback(async () => {
    if (!enabled) return
    
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }
    
    isConnectingRef.current = true

    try {
      // Get WebSocket token from API (since cookies might not work with WebSocket)
      const token = await getWebSocketToken()
      
      // For WebSocket, we'll use the API base URL and convert to WS
      const wsUrl = API.replace('http://', 'ws://').replace('https://', 'wss://')
      
      // Add token to query string if available
      const wsEndpoint = token 
        ? `${wsUrl}/ws/notifications/?token=${encodeURIComponent(token)}`
        : `${wsUrl}/ws/notifications/`
      
      const ws = new WebSocket(wsEndpoint)

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.warn('WebSocket connection timeout - server may not support WebSockets. Use daphne or uvicorn.')
          ws.close()
        }
      }, 5000) // 5 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        console.log('WebSocket connected')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        onConnect?.()

        // Send ping every 30 seconds to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'notification' && data.data) {
            onNotification?.(data.data as Notification)
          } else if (data.type === 'pong') {
            // Heartbeat response
          } else if (data.type === 'notification_read') {
            // Notification marked as read
          } else if (data.type === 'all_notifications_read') {
            // All notifications marked as read
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        console.warn('WebSocket error - Make sure Django server is running with daphne or uvicorn (not runserver)')
        console.error('WebSocket error:', error)
        onError?.(error)
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        console.log('WebSocket disconnected', event.code, event.reason)
        setIsConnected(false)
        onDisconnect?.()

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }

        // Only attempt to reconnect if it wasn't a normal closure and we haven't exceeded max attempts
        if (enabled && reconnectAttemptsRef.current < 3 && event.code !== 1000) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1
            connect()
          }, delay)
        } else if (reconnectAttemptsRef.current >= 3) {
          console.warn('WebSocket: Max reconnection attempts reached. Notifications will work via polling.')
        }
      }

      wsRef.current = ws
    } catch (error) {
      isConnectingRef.current = false
      console.error('Error creating WebSocket connection:', error)
      console.warn('WebSocket not available - notifications will work via API polling')
    }
  }, [enabled, onNotification, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    isConnectingRef.current = false
    reconnectAttemptsRef.current = 0
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    setIsConnected(false)
  }, [])

  const markRead = useCallback((notificationId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        notification_id: notificationId
      }))
    }
  }, [])

  const markAllRead = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_all_read'
      }))
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
    // Only depend on enabled - connect and disconnect are stable callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return {
    isConnected,
    connect,
    disconnect,
    markRead,
    markAllRead
  }
}

