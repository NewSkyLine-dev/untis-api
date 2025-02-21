import { z } from "zod";

const emptyObject = z.object({});

const positionObject = z
    .array(
        z.object({
            current: z.object({
                type: z.string().min(1),
                status: z.enum(["active", "cancelled", "modified"]),
                shortName: z.string().min(1),
                longName: z.string().min(1),
            }),
            removed: emptyObject,
        })
    )
    .min(1);

const timetableSchema = z.object({
    days: z
        .array(
            z.object({
                date: z.string().datetime(),
                resourceType: z.enum(["class", "teacher", "room"]),
                resource: z
                    .object({
                        id: z.number(),
                        shortName: z.string().min(1),
                        longName: z.string().min(1),
                        displayName: z.string(),
                    })
                    .optional(),
                status: z.enum(["active", "cancelled", "holiday"]),
                gridEntries: z
                    .array(
                        z.object({
                            duration: z.object({
                                start: z.string(),
                                end: z.string(),
                            }),
                            position1: positionObject,
                            position2: positionObject,
                            position3: positionObject,
                            position4: positionObject,
                            position5: emptyObject,
                        })
                    )
                    .min(1),
            })
        )
        .min(1),
    errors: z.array(
        z.object({
            code: z.string(),
            message: z.string(),
        })
    ),
});

type Timetable = z.infer<typeof timetableSchema>;
