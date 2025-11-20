import axios from 'axios'
import { API } from './API'

export interface Notification {
  id: number
  notification_type: 'order' | 'alert' | 'info' | 'ingredient' | 'table'
  priority: 'critical' | 'medium' | 'low'
  title: string
  message: string
  is_read: boolean
  related_order?: number | null
  related_offline_order?: number | null
  related_ingredient?: number | null
  created_at: string
  time_ago: string
}

export const getNotifications = async (unreadOnly: boolean = false, limit?: number, all: boolean = false): Promise<Notification[]> => {
  const params = new URLSearchParams()
  if (unreadOnly) params.append('unread_only', 'true')
  if (limit) params.append('limit', limit.toString())
  if (all) params.append('all', 'true')
  
  const response = await axios.get(`${API}/notifications/?${params.toString()}`, {
    withCredentials: true
  })
  return response.data
}

export const getUnreadCount = async (): Promise<number> => {
  const response = await axios.get(`${API}/notifications/unread-count/`, {
    withCredentials: true
  })
  return response.data.count
}

export const markNotificationRead = async (notificationId: number): Promise<Notification> => {
  const response = await axios.post(
    `${API}/notifications/mark-read/`,
    { notification_id: notificationId },
    { withCredentials: true }
  )
  return response.data
}

export const markAllNotificationsRead = async (): Promise<void> => {
  await axios.post(`${API}/notifications/mark-all-read/`, {}, { withCredentials: true })
}

export const deleteNotification = async (notificationId: number): Promise<void> => {
  await axios.delete(`${API}/notifications/${notificationId}/`, { withCredentials: true })
}

