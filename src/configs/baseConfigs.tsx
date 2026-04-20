
const renderUse = (val: number) => (val === 1 ? "사용" : "미사용");

export const baseConfigs = {
    adminRole: {
        title: "권한등록",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "권한코드" },
            { key: "name", label: "권한명" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "권한코드", type: "text" },
            { key: "name", label: "권한명", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    allowance: {
        title: "수당항목등록",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "allowanceCord", label: "수당코드" },
            { key: "allowanceName", label: "수당명" },
            { key: "allowanceIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "allowanceCord", label: "수당코드", type: "text" },
            { key: "allowanceName", label: "수당명", type: "text" },
            {
                key: "allowanceIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    approvalLine: {
        title: "결재라인",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "결재라인코드" },
            { key: "name", label: "결재라인명" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "결재라인코드", type: "text" },
            { key: "name", label: "결재라인명", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    companyAccount: {
        title: "계좌등록",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "계좌코드" },
            { key: "name", label: "계좌명" },
            { key: "name", label: "은행명" },
            { key: "name", label: "계좌번호" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "계좌코드", type: "text" },
            { key: "name", label: "계좌명", type: "text" },
            { key: "name", label: "은행명", type: "text" },
            { key: "name", label: "계좌번호", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    department: {
        title: "부서등록 ",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "부서코드" },
            { key: "name", label: "부서명" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "부서코드", type: "text" },
            { key: "name", label: "부서명", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    document: {
        title: "공통양식리스트",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "양식코드" },
            { key: "name", label: "양식명" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "양식코드", type: "text" },
            { key: "name", label: "양식명", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    product: {
        title: "품목등록",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "품목코드" },
            { key: "name", label: "품목명" },
            { key: "name", label: "카테고리" },
            { key: "name", label: "단가" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "품목코드", type: "text" },
            { key: "name", label: "품목명", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    storage: {
        title: "창고등록",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "창고코드" },
            { key: "name", label: "창고명" },
            { key: "name", label: "창고주소" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "창고코드", type: "text" },
            { key: "name", label: "창고명", type: "text" },
            { key: "name", label: "창고주소 ", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    vendor: {
        title: "거래처등록",
        apiUrl: "/api/base/role",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "code", label: "거래처코드" },
            { key: "name", label: "거래처명" },
            { key: "isUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "code", label: "거래처코드", type: "text" },
            { key: "name", label: "거래처명", type: "text" },
            {
                key: "isUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    }


}