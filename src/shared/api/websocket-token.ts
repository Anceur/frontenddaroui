import axios from 'axios'
import { API } from './API'

export const getWebSocketToken = async (): Promise<string | null> => {
  try {
    // Try the endpoint - if it doesn't exist, return null (WebSocket will try without token)
    const response = await axios.get(`${API}/websocket-token/`, {
      withCredentials: true
    })
    return response.data.token || null
  } catch (error: any) {
    // If 404, the endpoint might not be available yet - that's okay, we'll try without token
    if (error.response?.status === 404) {
      console.warn('WebSocket token endpoint not found - will try connecting without explicit token')
    } else {
      console.error('Error getting WebSocket token:', error)
    }
    return null
  }
}

