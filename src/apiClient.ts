import axios from "axios";

export class ApiClient {
    private client: axios.AxiosInstance;
    // private token: string | null = null;
    public readonly school: string | null = null;

    constructor(baseUrl: string, school: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
                "Cache-Control": "no-cache",
                "X-Requested-With": "XMLHttpRequest",
                Pragma: "no-cache",
            },
        });

        // this.client.interceptors.request.use((config) => {
        //     if (this.token) {
        //         config.headers = config.headers || {};
        //         config.headers.Authorization = `Bearer ${this.token}`;
        //     }
        //     return config;
        // });

        this.school = school;
    }

    // setToken(token: string) {
    //     //this.token = token;
    // }

    async get<T>(url: string, config?: axios.AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(
        url: string,
        data: any,
        config?: axios.AxiosRequestConfig
    ): Promise<T | undefined> {
        try {
            const response = await this.client.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
            }
            throw error;
        }
    }

    async put<T>(
        url: string,
        data: any,
        config?: axios.AxiosRequestConfig
    ): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(
        url: string,
        config?: axios.AxiosRequestConfig
    ): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}
