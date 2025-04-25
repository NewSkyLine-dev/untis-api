export interface Timetable {
    date: Date;
    resourceType: string;
    resource: Object;
    status: string;
    dayEntries?: null[] | null;
    gridEntries?: GridEntry[] | null;
    backEntries?: null[] | null;
}

export interface Resource {
    id: number;
    shortName: string;
    longName: string;
    displayName: string;
}

export interface GridEntry {
    ids?: number[] | null;
    duration: Duration;
    type: string;
    status: string;
    statusDetail?: null;
    name?: null;
    layoutStartPosition: number;
    layoutWidth: number;
    layoutGroup: number;
    color: string;
    notesAll: string;
    icons?: string[] | null;
    position1?: InfoObject[] | null; // Teacher
    position2?: InfoObject[] | null; // Subject
    position3?: InfoObject[] | null; // Room
    position4?: InfoObject[] | null; // Class
    position5?: InfoObject[] | null;
    texts?: string[] | null;
    lessonText: string;
    lessonInfo?: string;
    substitutionText: string;
    userName?: string;
    moved?: string;
    durationTotal?: number;
    link?: string;
}

export interface Duration {
    start: string;
    end: string;
}

export interface EntityInfo {
    displayName: string;
    longName: string;
    shortName: string;
    status: string;
    type: string;
}

export interface InfoObject {
    current: EntityInfo;
    removed?: EntityInfo | null;
}

export interface Exam {
    id: number;
    examType: string;
    name: string;
    studentClass: string[];
    assignedStudents: AssignedStudent[];
    examDate: number;
    startTime: number;
    endTime: number;
    subject: string;
    teachers: string[];
    rooms: string[];
    text: string;
    grade: string;
}

export interface AssignedStudent {
    klasse: Klasse;
    gradeProtection: boolean;
    disadvantageCompensation: boolean;
    id: number;
    displayName: string;
}

export interface Klasse {
    id: number;
    name: string;
}
