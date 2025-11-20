import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AuthContext } from './Authservice'
import { useWebSocket } from '../hooks/useWebSocket'
import { 
  getNotifications, 
  getUnreadCount, 
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
  deleteNotification,
  type Notification 
} from '../api/notifications'
import { useToast } from '../components/Toast'
import { playNotificationSound, initNotificationSound } from '../utils/notificationSound'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: number) => Promise<void>
  refreshNotifications: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<number>>(new Set())
  const toast = useToast()
  const auth = useContext(AuthContext)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(false, 50) // Get last 50 notifications
      setNotifications(data)
      // Mark all fetched notifications as "already shown" to prevent toasts on initial load
      setShownNotificationIds(prev => {
        const newSet = new Set(prev)
        data.forEach((n: Notification) => newSet.add(n.id))
        return newSet
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [])

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Check if this notification ID already exists to prevent duplicates
      const exists = prev.some(n => n.id === notification.id)
      if (exists) {
        console.warn('Duplicate notification received, ignoring:', notification.id)
        return prev
      }
      
      // Check if we've already shown a toast for this notification
      const alreadyShown = shownNotificationIds.has(notification.id)
      if (alreadyShown) {
        console.warn('Notification already shown as toast, skipping toast:', notification.id)
        // Still add it to the list, just don't show toast again
        return [notification, ...prev]
      }
      
      // Mark this notification as shown
      setShownNotificationIds(prevIds => new Set(prevIds).add(notification.id))
      
      // Only increment unread count and show toast for new notifications
      setUnreadCount(count => count + 1)
      
      // Only play sound for critical notifications
      // Critical: real-time + sound
      // Medium: real-time only (no sound)
      // Low: daily digest (no real-time, no sound)
      console.log('Notification received:', {
        id: notification.id,
        title: notification.title,
        priority: notification.priority,
        priorityType: typeof notification.priority
      })
      if (notification.priority === 'critical') {
        console.log('Playing sound for critical notification:', notification.id)
        playNotificationSound(true)
      } else {
        console.log('NOT playing sound - priority is:', notification.priority)
      }
      
      // Show toast notification with title and message
      // Only show toast for critical and medium priority (not low - those go to daily digest)
      if (notification.priority !== 'low') {
        toast.success(`${notification.title}: ${notification.message}`, 5000)
      }
      
      // Add new notification at the beginning
      return [notification, ...prev]
    })
  }, [toast, shownNotificationIds])

  // WebSocket connection
  const { isConnected } = useWebSocket({
    enabled: auth?.isAuthenticated || false,
    onNotification: handleNewNotification,
    onConnect: () => {
      console.log('Notification WebSocket connected')
    },
    onDisconnect: () => {
      console.log('Notification WebSocket disconnected')
    }
  })

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await apiMarkRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  // Remove notification
  const removeNotification = useCallback(async (id: number) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      // Remove from shown notifications set
      setShownNotificationIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      // Update unread count if it was unread
      const notification = notifications.find(n => n.id === id)
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [notifications])

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setLoading(true)
    await fetchNotifications()
    await fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // Initialize notification sound on mount
  useEffect(() => {
    initNotificationSound()
  }, [])

  // Initial load
  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [auth?.isAuthenticated, fetchNotifications, fetchUnreadCount])

  // Refresh unread count periodically
  useEffect(() => {
    if (!auth?.isAuthenticated) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [auth?.isAuthenticated, fetchUnreadCount])

  const ToastContainerComponent = toast.ToastContainer

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refreshNotifications,
        refreshUnreadCount: fetchUnreadCount
      }}
    >
      {children}
      {/* Render ToastContainer for toast notifications - works for all roles (admin, cashier, chef) */}
      <ToastContainerComponent />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

