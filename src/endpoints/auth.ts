import { ApiClient } from "../apiClient";
import { LoginCredentials } from "../types/auth";

export class AuthApi {
    private apiClient: ApiClient;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    async login(credentials: LoginCredentials): Promise<any> {
        try {
            const response = await this.apiClient.post(
                "/WebUntis/jsonrpc.do",
                credentials,
                {
                    params: {
                        school: this.apiClient.school,
                    },
                }
            );
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async logout(): Promise<void> {
        await this.apiClient.post("/auth/logout", {});
        // this.apiClient.setToken(""); // Clear token
    }
}
