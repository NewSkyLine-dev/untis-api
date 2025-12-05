import { describe, expect, it } from "vitest";
import { UntisSession } from "../src";

describe("login", () => {
    it("should login and logout successfully", async () => {
        const session = new UntisSession(
            "htlwrn",
            "htlwrn",
            "20210235",
            "Birnenapfel-2006$!"
        );

        await expect(session.login()).resolves.toBeUndefined();
        await expect(session.logout()).resolves.toBeUndefined();
    });
});

describe("getTimetableForRange", () => {
    it("should get timetable for range successfully", async () => {
        const session = new UntisSession(
            "htlwrn",
            "htlwrn",
            "20210235",
            "Birnenapfel-2006$!"
        );

        await expect(session.login()).resolves.toBeUndefined();

        const timetable = await session.getOwnTimetableForRange(
            new Date(2025, 3, 21),
            new Date(2025, 3, 26)
        );

        expect(timetable.days).toBeDefined();

        await expect(session.logout()).resolves.toBeUndefined();
    });
});

describe("getExams", () => {
    it("should get timetable for range successfully", async () => {
        const session = new UntisSession(
            "htlwrn",
            "htlwrn",
            "20210235",
            "Birnenapfel-2006$!"
        );

        await expect(session.login()).resolves.toBeUndefined();

        const exams = await session.getExams();

        expect(exams).toBeDefined();

        await expect(session.logout()).resolves.toBeUndefined();
    });
});
