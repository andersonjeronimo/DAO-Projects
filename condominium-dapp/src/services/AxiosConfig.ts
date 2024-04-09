import axios from "axios";
import { StorageKeys } from "../utils/Utils";

const instance = axios.create({
    headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem(StorageKeys.TOKEN) || ""
    }
});

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && [401, 403].includes(error.response.status)) {
            console.error(`Redirecting to login by 4xx status response`);
            localStorage.removeItem(StorageKeys.ACCOUNT);
            localStorage.removeItem(StorageKeys.PROFILE);
            localStorage.removeItem(StorageKeys.TOKEN);

            if (window.location.pathname !== "/") {
                return window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default instance;