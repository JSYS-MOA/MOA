export type HrGradeOption = {
    gradeId: number;
    gradeName: string;
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
