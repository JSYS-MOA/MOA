
export const hr2Configs = {
    attendances: {
        title: "근무기록",
        apiUrl: "/api/hr/attendances",
        idKey: "workId",
        // 필터 조건 필드
        filterFields: [
            { id: "keyword", label: "성명", type: "text", placeholder: "성명 입력" },
            { id: "category", label: "수당항목", type: "select", options: ["야간수당", "휴일수당", "연장수당"] }
        ],
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호", clickable: true },
            { key: "userName", label: "성명" },
            { key: "allowanceName", label: "수당항목" },
            { key: "workMemo", label: "비고" }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "workDate", label: "근무일자" },
            { key: "employeeId", label: "사원번호", type:"text" },
            { key: "userName", label: "성명", type:"text",
                //검색모달용
                hasSearch: true,
                searchType: "user",
                mapTo: { userName: "userName", employeeId: "employeeId" },
                readOnly: true
            },
            {
                key: "allowanceCode",
                label: "수당코드",
                type: "text",
                readOnly: true
            },
            { key: "allowanceName", label: "수당항목", type:"text",
                //검색모달용
                hasSearch: true,
                searchType: "allowance",
                mapTo: { allowanceName:"allowanceName", allowanceCode:"allowanceCode" },
                readOnly: true
            },
            { key: "workMemo", label: "비고", type:"text" }
        ]
    }
   /*vacation: {
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
    }*/
}