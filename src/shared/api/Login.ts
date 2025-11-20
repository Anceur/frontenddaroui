import axios from 'axios'
import { API } from './API'

export default async function login(username: string, password: string) {
    axios.defaults.withCredentials = true
    try {
        const response = await axios.post(`${API}/login/`, { username, password }, { withCredentials: true })
        console.log(response.data)
        return response.data

    } catch (error) {
        console.error(error)
        throw error
    }
    
}

