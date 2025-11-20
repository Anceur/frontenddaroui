import axios from 'axios'
import { API } from './API'

export default async function logout() {
  axios.defaults.withCredentials = true
  try {
    const response = await axios.post(`${API}/logout/`, {}, { withCredentials: true })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Logout failed:', error)
    throw error
  }
}

