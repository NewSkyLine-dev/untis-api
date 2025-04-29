import axios, { AxiosInstance } from "axios";

let instance: AxiosInstance | null = null;

export function getHttpClient(): AxiosInstance {
    if (!instance) {
        instance = axios.create({
            baseURL: "",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            withCredentials: true,
        });
    }
    return instance;
}
