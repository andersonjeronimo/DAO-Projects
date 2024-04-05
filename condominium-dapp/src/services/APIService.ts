//import axios from "axios";
import axios from "./AxiosConfig";
import { ApiResident } from "../utils/Utils";

const API_URL = `${process.env.REACT_APP_API_URL}`;

export async function doApiLogin(wallet: string, secret: string, timestamp: number) {
    const response = await axios.post(`${API_URL}/login`, { wallet, secret, timestamp });
    return response.data.token;
}

export async function getApiResident(wallet: string): Promise<ApiResident> {
    const response = await axios.get(`${API_URL}/residents/${wallet}`);
    return response.data as ApiResident;
}

export async function addApiResident(resident: ApiResident): Promise<ApiResident> {
    const response = await axios.post(`${API_URL}/residents`, resident);
    return response.data as ApiResident;
}

export async function updateApiResident(wallet: string, resident: ApiResident): Promise<ApiResident> {
    const response = await axios.patch(`${API_URL}/residents/${wallet}`, resident);
    return response.data as ApiResident;
}

export async function deleteApiResident(wallet: string): Promise<void> {
    await axios.delete(`${API_URL}/residents/${wallet}`);
}