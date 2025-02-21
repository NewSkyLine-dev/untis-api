import test from "node:test";
import { Api } from "../src/api";

test("login", async (_) => {
    const api = new Api({
        baseUrl: "https://nete.webuntis.com",
        school: "htlwrn",
    });

    await api
        .login({
            id: "AwesomeApp",
            jsonrpc: "2.0",
            method: "authenticate",
            params: {
                client: "AwesomeApp",
                password: "Birnenapfel-2006",
                user: "20210235",
            },
        })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
});
