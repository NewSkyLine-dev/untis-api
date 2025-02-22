import { ApiClient } from "./apiClient";
import { AuthApi } from "./endpoints/auth";
import { LoginCredentials } from "./types/auth";

interface ApiConfig {
    baseUrl: string;
    school: string;
}

export class Api {
    private apiClient: ApiClient;
    public auth: AuthApi;
    private credentials?: LoginCredentials;

    constructor(config: ApiConfig) {
        this.apiClient = new ApiClient(config.baseUrl, config.school);
        this.auth = new AuthApi(this.apiClient);
    }

    async login(credentials: LoginCredentials) {
        this.credentials = credentials;
        return this.auth.login(credentials);
    }

    async logout() {
        if (!this.credentials) {
            throw new Error("No credentials provided");
        }

        return this.auth.logout(this.credentials);
    }
}
