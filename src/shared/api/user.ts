import axios from "axios";
import { API } from "./API";
axios.defaults.withCredentials = true

interface UserResponse {
  username: string;
  [key: string]: any;
}

export default async function fetchuser(): Promise<UserResponse> {
    try {
      const response = await axios.get<UserResponse>(`${API}/user/`, { withCredentials: true })
      return response.data
    } catch (error) {
        throw error
    }
}

