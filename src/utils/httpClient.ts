import axios, { AxiosInstance } from "axios";

let instance: AxiosInstance | null = null;

// In httpClient.ts
export function createHttpClient(
    baseUrl: string,
    school: string
): AxiosInstance {
    return axios.create({
        baseURL: baseUrl,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Cookie: `schoolname=_${Buffer.from(school).toString("base64")}`,
        },
        withCredentials: true,
    });
}
