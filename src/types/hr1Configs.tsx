export const hr1Configs = {
    work: {
        title: "근무기록",
        apiUrl: "/api/hr/attendances",
        idKey: "workId",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호" },
            { key: "userName", label: "성명" },
            { key: "allowanceName", label: "수당항목" },
            { key: "workMemo", label: "비고" }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호", type:"text" },
            { key: "userName", label: "성명", type:"text" },
            { key: "allowanceName", label: "수당항목", type:"text" },
            { key: "workMemo", label: "비고", type:"text" }
        ]
    },
    vacation: {
        title: "출력물",
        apiUrl: "/api/hr/leavesBalance",
        idKey: "workId",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호" },
            { key: "userName", label: "성명" },
            { key: "allowanceName", label: "수당항목" },
            { key: "workMemo", label: "비고" }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호", type:"text" },
            { key: "userName", label: "성명", type:"text" },
            { key: "allowanceName", label: "수당항목", type:"text" },
            { key: "workMemo", label: "비고", type:"text" }
        ]
    },
    lateness: {
        title: "지각현황",
        apiUrl: "/api/hr/latenesses",
        idKey: "workId",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "workDate", label: "일자" },
            { key: "employeeId", label: "사원번호" },
            { key: "userName", label: "성명" },
            { key: "allowanceName", label: "수당항목" },
            { key: "workMemo", label: "비고" }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호", type:"text" },
            { key: "userName", label: "성명", type:"text" },
            { key: "allowanceName", label: "수당항목", type:"text" },
            { key: "workMemo", label: "비고", type:"text" }
        ]
    },
    approval: {
        title: "근태관리",
        apiUrl: "/api/hr/approvalWait",
        idKey: "workId",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호" },
            { key: "userName", label: "성명" },
            { key: "allowanceName", label: "수당항목" },
            { key: "workMemo", label: "비고" }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호", type:"text" },
            { key: "userName", label: "성명", type:"text" },
            { key: "allowanceName", label: "수당항목", type:"text" },
            { key: "workMemo", label: "비고", type:"text" }
        ]
    }
}