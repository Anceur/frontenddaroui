import axios from "axios";
import { API } from "./API";
axios.defaults.withCredentials = true

export default async function Getrole(): Promise<string> {
    try { 
        const response = await axios.get(`${API}/role/`, { withCredentials: true })
        return response.data.role

    } catch (error) {
        throw error
    }
}

