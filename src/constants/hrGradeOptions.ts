export type HrGradeOption = {
    gradeId: number;
    gradeName: string;
};

const LEGACY_HR_GRADE_ID_MAP: Record<number, number> = {
    8: 1,
    9: 2,
    10: 3,
    11: 4,
    12: 5,
    13: 6,
    14: 7,
};

const HR_GRADE_OPTIONS: HrGradeOption[] = [
    { gradeId: 1, gradeName: "사장" },
    { gradeId: 2, gradeName: "부사장" },
    { gradeId: 3, gradeName: "상무" },
    { gradeId: 4, gradeName: "부장" },
    { gradeId: 5, gradeName: "과장" },
    { gradeId: 6, gradeName: "대리" },
    { gradeId: 7, gradeName: "사원" },
];

export const createHrGradeOptions = () => HR_GRADE_OPTIONS.map((grade) => ({ ...grade }));

export const HR_GRADE_NAME_BY_ID: Record<number, string> = {
    1: "사장",
    2: "부사장",
    3: "상무",
    4: "부장",
    5: "과장",
    6: "대리",
    7: "사원",
};

export const resolveHrGradeId = (gradeId?: number | null) => {
    if (!gradeId) {
        return undefined;
    }

    return LEGACY_HR_GRADE_ID_MAP[gradeId] ?? gradeId;
};

export const getHrGradeNameById = (gradeId?: number | null) => {
    const resolvedGradeId = resolveHrGradeId(gradeId);

    if (!resolvedGradeId) {
        return "";
    }

    return HR_GRADE_NAME_BY_ID[resolvedGradeId] ?? "";
};
