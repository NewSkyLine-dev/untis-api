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

    async logout(credentials: LoginCredentials): Promise<any> {
        try {
            const response = await this.apiClient.post(
                "/WebUntis/jsonrpc.do",
                {
                    id: credentials.id,
                    jsonrpc: credentials.jsonrpc,
                    method: "logout",
                    params: {},
                },
                {
                    params: {
                        school: this.apiClient.school,
                    },
                }
            );
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
