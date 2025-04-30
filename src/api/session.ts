import { Exam, Timetable } from "../models/timetable";
import { createHttpClient } from "../utils/httpClient";
import { logger } from "../utils/logger";
import axios from "axios";

export class UntisSession {
    private baseUrl: string;
    private token: string | null = null;
    private sessionId: string | null = null;
    private studentId: string | null = null;
    private yearStart: Date | null = null;
    private yearEnd: Date | null = null;
    private cookies: string = ""; // Add this line
    private httpClient: ReturnType<typeof createHttpClient>;

    constructor(
        private server: string,
        private school: string,
        private username: string,
        private password: string
    ) {
        this.baseUrl = `https://${server}.webuntis.com/WebUntis/api/`;
        this.httpClient = createHttpClient(this.baseUrl, school);
        this.httpClient.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }

            config.headers.Cookie = [
                this.httpClient.defaults.headers["Cookie"],
                `JSESSIONID=${this.sessionId}`,
                this.cookies,
            ]
                .filter(Boolean)
                .join("; ");
            return config;
        });
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
                const sessionCookie = jSessionIdResponse.headers[
                    "set-cookie"
                ].find((cookie: string) => cookie.startsWith("JSESSIONID"));

                if (sessionCookie) {
                    this.sessionId =
                        sessionCookie.split(";")[0]?.split("=")[1] || null;
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
                        Cookie:
                            this.httpClient.defaults.headers["Cookie"] +
                            `; JSESSIONID=${this.sessionId}`,
                        Accept: "application/json",
                    },
                }
            );

            if (loginResponse.status !== 200) throw new Error("Login failed");

            // Process cookies
            const setCookies = loginResponse.headers["set-cookie"];
            if (setCookies) {
                this.cookies = setCookies.reduce((acc, cookie) => {
                    const match = cookie.match(/^([^=]+=[^;]*)/);
                    return match?.[1]
                        ? acc
                            ? `${acc}; ${match[1]}`
                            : match[1]
                        : acc;
                }, "");
            }

            // Get authentication token
            const tokenResponse = await this.httpClient.get("token/new");
            if (tokenResponse.status !== 200)
                throw new Error("Failed to get token");

            this.token = tokenResponse.data;

            // Get StudentID
            const studentResponse = await this.httpClient.get(
                "rest/view/v1/app/data"
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
                {
                    headers: {
                        Cookie: this.httpClient.defaults.headers["Cookie"],
                        Accept: "application/json",
                    },
                }
            );

            if (response.status !== 200) throw new Error("Logout failed");
            logger.info("Logged out successfully");
        } catch (error) {
            logger.error("Error logging out");
            throw new Error("Logout failed");
        }
    }

    async getOwnTimetableForRange(
        start: Date,
        end: Date
    ): Promise<{ days: Timetable[] }> {
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

            const response = await this.httpClient.get(
                `rest/view/v1/timetable/entries?start=${formatDate(
                    startDate
                )}&end=${formatDate(
                    endDate
                )}&format=2&resourceType=STUDENT&resources=6110&periodTypes=&timetableType=MY_TIMETABLE`
            );

            if (response.status !== 200)
                throw new Error("Failed to get timetable");
            return response.data;
        } catch (error: any) {
            logger.error(`Error getting timetable: ${error}`);
            throw new Error("Failed to get timetable");
        }
    }

    async getExams(): Promise<Exam[]> {
        try {
            const dateToNumber = (date: Date) => {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are 0-indexed
                const day = date.getDate().toString().padStart(2, "0");

                return parseInt(`${year}${month}${day}`, 10);
            };

            const examResponse = await this.httpClient.get<{
                data: Exam[];
            }>(
                `exams?startDate=${dateToNumber(
                    this.yearStart!
                )}&endDate=${dateToNumber(this.yearEnd!)}&studentId=${
                    this.studentId
                }&withGrades=true&klasseId=-1`
            );

            if (examResponse.status !== 200)
                throw new Error("Failed to get exams");

            return examResponse.data.data;
        } catch (error: any) {
            logger.error(`Error getting exams: ${error}`);
            throw new Error("Failed to get exams");
        }
    }
}
