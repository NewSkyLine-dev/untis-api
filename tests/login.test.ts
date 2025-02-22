import test from "node:test";
import { Api } from "../src/api";
import { LoginCredentials } from "../src/types/auth";

test("login", async (_) => {
    const api = new Api({
        baseUrl: "https://nete.webuntis.com",
        school: "htlwrn",
    });

    const credentials: LoginCredentials = {
        id: "AwesomeApp",
        jsonrpc: "2.0",
        method: "authenticate",
        params: {
            client: "AwesomeApp",
            password: "Birnenapfel-2006",
            user: "20210235",
        },
    };

    await api
        .login(credentials)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });

    await api
        .logout()
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
});
