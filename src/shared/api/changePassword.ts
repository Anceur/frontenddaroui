import axios from 'axios'
import { API } from './API'

export default async function changePassword(oldPassword: string, newPassword: string) {
  try {
    const response = await axios.post(
      `${API}/change-password/`,
      {
        old_password: oldPassword,
        new_password: newPassword
      },
      { withCredentials: true }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

