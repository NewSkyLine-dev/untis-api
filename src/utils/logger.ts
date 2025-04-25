import { error, info } from "console";

export const logger = {
    info: (message: string) => {
        const date = new Date().toISOString();
        console.log(`[INFO] [${date}] ${message}`);
    },
    error: (message: string) => {
        const date = new Date().toISOString();
        console.error(`[ERROR] [${date}] ${message}`);
    },
};
