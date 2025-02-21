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

    constructor(config: ApiConfig) {
        this.apiClient = new ApiClient(config.baseUrl, config.school);
        this.auth = new AuthApi(this.apiClient);
    }

    async login(credentials: LoginCredentials) {
        return this.auth.login(credentials);
    }
}
