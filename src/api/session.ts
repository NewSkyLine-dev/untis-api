import { Exam, Timetable } from "../models/timetable";
import { logger } from "../utils/logger";
import axios, { AxiosRequestConfig } from "axios";

export class UntisSession {
    private baseUrl: string;
    private token: string | null = null;
    private sessionId: string | null = null;
    private studentId: string | null = null;
    private yearStart: Date | null = null;
    private yearEnd: Date | null = null;
    private cookieStore: Map<string, string> = new Map();

    constructor(
        private server: string,
        private school: string,
        private username: string,
        private password: string
    ) {
        this.baseUrl = `https://${server}.webuntis.com/WebUntis/api/`;
    }

    private processSetCookieHeaders(setCookies?: string[]): void {
        if (!setCookies) return;

        setCookies.forEach((cookieStr) => {
            const match = cookieStr.match(/^([^=]+)=([^;]*)/);
            if (match) {
                const [, name, value] = match;
                this.cookieStore.set(name, value);
            }
        });
    }

    private buildCookieHeader(): string {
        const cookies = Array.from(this.cookieStore.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join("; ");
        return cookies;
    }

    private getRequestConfig(): AxiosRequestConfig {
        const config: AxiosRequestConfig = {
            headers: {
                Cookie: this.buildCookieHeader(),
            },
        };
        if (this.sessionId) {
            config.headers = {
                ...config.headers,
                JSESSIONID: this.sessionId,
            };
        }

        if (this.token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${this.token}`,
            };
        }

        return config;
    }

    async login(): Promise<void> {
        try {
            // Get JSESSIONID
            const jSessionIdResponse = await axios.get(
                `https://${this.server}.webuntis.com/WebUntis/?school=${this.school}`,
                {
                    headers: {
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    },
                }
            );

            if (
                jSessionIdResponse.status === 200 &&
                jSessionIdResponse.headers["set-cookie"]
            ) {
                this.processSetCookieHeaders(
                    jSessionIdResponse.headers["set-cookie"]
                );
                const sessionCookie = jSessionIdResponse.headers[
                    "set-cookie"
                ].find((cookie: string) => cookie.startsWith("JSESSIONID"));

                if (sessionCookie) {
                    this.sessionId =
                        sessionCookie.split(";")[0]?.split("=")[1] || null;
                    this.cookieStore.set("JSESSIONID", this.sessionId!);
                }
            }

            // Login with credentials
            const formData = new URLSearchParams();
            formData.append("school", this.school);
            formData.append("j_username", this.username);
            formData.append("j_password", this.password);
            formData.append("token", "");

            const loginResponse = await axios.post(
                `https://${this.server}.webuntis.com/WebUntis/j_spring_security_check`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Cookie: this.buildCookieHeader(),
                        Accept: "application/json",
                    },
                }
            );

            if (loginResponse.status !== 200) throw new Error("Login failed");

            // Process cookies from login response
            this.processSetCookieHeaders(loginResponse.headers["set-cookie"]);

            // Get authentication token
            const tokenResponse = await axios.get(
                `${this.baseUrl}token/new`,
                this.getRequestConfig()
            );

            if (tokenResponse.status !== 200)
                throw new Error("Failed to get token");

            this.token = tokenResponse.data;

            // Get StudentID
            const studentResponse = await axios.get(
                `${this.baseUrl}rest/view/v1/app/data`,
                this.getRequestConfig()
            );

            if (studentResponse.status !== 200)
                throw new Error("Failed to get student ID");

            this.studentId = studentResponse.data.user.person.id;
            this.yearStart = new Date(
                studentResponse.data.currentSchoolYear.dateRange.start
            );
            this.yearEnd = new Date(
                studentResponse.data.currentSchoolYear.dateRange.end
            );
        } catch (error: any) {
            logger.error(`Error logging in: ${error}`);
            throw new Error("Login failed");
        }
    }

    async logout(): Promise<void> {
        try {
            const response = await axios.get(
                `https://${this.server}.webuntis.com/WebUntis/saml/logout`,
                this.getRequestConfig()
            );

            if (response.status !== 200) throw new Error("Logout failed");
            this.cookieStore.clear();
            logger.info("Logged out successfully");
        } catch (error) {
            logger.error("Error logging out");
            throw new Error("Logout failed");
        }
    }

    async getOwnTimetableForRange(
        start: Date,
        end: Date
    ): Promise<{ days: Array<Timetable> }> {
        try {
            // Adjust dates to Monday and Saturday
            const startDate = new Date(start);
            const startDay = startDate.getDay();
            if (startDay !== 1)
                startDate.setDate(startDate.getDate() - (startDay - 1));

            const endDate = new Date(end);
            const endDay = endDate.getDay();
            if (endDay !== 6) endDate.setDate(endDate.getDate() + (6 - endDay));

            // Format dates as YYYY-MM-DD
            const formatDate = (date: Date) => {
                const d = new Date(date);
                return d.toISOString().split("T")[0];
            };

            const url = `${
                this.baseUrl
            }rest/view/v1/timetable/entries?start=${formatDate(
                startDate
            )}&end=${formatDate(
                endDate
            )}&format=2&resourceType=STUDENT&resources=6110&periodTypes=&timetableType=MY_TIMETABLE`;

            const response = await axios.get(url, this.getRequestConfig());

            if (response.status !== 200)
                throw new Error("Failed to get timetable");
            return response.data;
        } catch (error: any) {
            logger.error(`Error getting timetable: ${error}`);
            throw new Error("Failed to get timetable");
        }
    }

    async getExams(): Promise<Array<Exam>> {
        try {
            const dateToNumber = (date: Date) => {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const day = date.getDate().toString().padStart(2, "0");

                return parseInt(`${year}${month}${day}`, 10);
            };

            const url = `${this.baseUrl}exams?startDate=${dateToNumber(
                this.yearStart!
            )}&endDate=${dateToNumber(this.yearEnd!)}&studentId=${
                this.studentId
            }&withGrades=true&klasseId=-1`;

            const examResponse = await axios.get(url, this.getRequestConfig());

            if (examResponse.status !== 200)
                throw new Error("Failed to get exams");

            return examResponse.data.data.exams as Array<Exam>;
        } catch (error: any) {
            logger.error(`Error getting exams: ${error}`);
            throw new Error("Failed to get exams");
        }
    }
}
