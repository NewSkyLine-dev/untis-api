export interface LoginCredentials {
    id: string;
    method: string;
    params: {
        user: string;
        password: string;
        client: string;
    };
    jsonrpc: "2.0";
}
