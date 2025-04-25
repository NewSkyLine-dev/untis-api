import axios from "axios";

export const httpClient = axios.create({
    baseURL: "",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});
