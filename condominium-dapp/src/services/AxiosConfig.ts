import axios from "axios";

const instance = axios.create({
    headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token") || ""
    }
});

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && [401, 403].includes(error.response.status)) {
            console.error(`Redirecting to login by 4xx status response`);
            localStorage.removeItem("metamask_account");
            localStorage.removeItem("dao_profile");
            localStorage.removeItem("token");

            if (window.location.pathname !== "/") {
                return window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default instance;