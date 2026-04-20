
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
        apiUrl: "/api/base/allow",
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
        apiUrl: "/api/base/approval",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "approvalLineCord", label: "결재라인코드" },
            { key: "approvalLineName", label: "결재라인명" },
            { key: "approvalLineIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "approvalLineCord", label: "결재라인코드", type: "text" },
            { key: "approvalLineName", label: "결재라인명", type: "text" },
            {
                key: "approvalLineIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    companyAccount: {
        title: "계좌등록",
        apiUrl: "/api/base/account",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "companyAccountCord", label: "계좌코드" },
            { key: "companyAccountName", label: "계좌명" },
            { key: "companyAccountBank", label: "은행명" },
            { key: "companyAccountNum", label: "계좌번호" },
            { key: "companyAccountIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "companyAccountCord", label: "계좌코드", type: "text" },
            { key: "companyAccountName", label: "계좌명", type: "text" },
            { key: "companyAccountBank", label: "은행명", type: "text" },
            { key: "companyAccountNum", label: "계좌번호", type: "text" },
            {
                key: "companyAccountIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    department: {
        title: "부서등록 ",
        apiUrl: "/api/base/dept",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "departmentCord", label: "부서코드" },
            { key: "departmentName", label: "부서명" },
            { key: "departmentIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "departmentCord", label: "부서코드", type: "text" },
            { key: "departmentName", label: "부서명", type: "text" },
            {
                key: "departmentIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    document: {
        title: "공통양식리스트",
        apiUrl: "/api/base/form",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "documentCord", label: "양식코드" },
            { key: "documentName", label: "양식명" },
            { key: "documentIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "documentCord", label: "양식코드", type: "text" },
            { key: "documentName", label: "양식명", type: "text" },
            {
                key: "documentIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    product: {
        title: "품목등록",
        apiUrl: "/api/base/item",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "productCord", label: "품목코드" },
            { key: "productName", label: "품목명" },
            { key: "productCategory", label: "카테고리" },
            { key: "productPrice", label: "단가" },
            { key: "productIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "productCord", label: "품목코드", type: "text" },
            { key: "productName", label: "품목명", type: "text" },
            { key: "productCategory", label: "카테고리", type:"text" },
            { key: "productPrice", label: "단가", type:"number" },
            {
                key: "productIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    storage: {
        title: "창고등록",
        apiUrl: "/api/base/whse",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "vendorCord", label: "창고코드" },
            { key: "storageName", label: "창고명" },
            { key: "storageAddress", label: "창고주소" },
            { key: "storageIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "vendorCord", label: "창고코드", type: "text" },
            { key: "storageName", label: "창고명", type: "text" },
            { key: "storageAddress", label: "창고주소 ", type: "text" },
            {
                key: "storageIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    },
    vendor: {
        title: "거래처등록",
        apiUrl: "/api/base/partner",
        // 표(Table)에 보여줄 컬럼들
        columns: [
            { key: "vendorCord", label: "거래처코드" },
            { key: "vendorName", label: "거래처명" },
            { key: "vendorIsUse", label: "사용여부", render: renderUse }
        ],
        // 등록/수정 모달(Modal)에 나타날 입력창들
        fields: [
            { key: "vendorCord", label: "거래처코드", type: "text" },
            { key: "vendorName", label: "거래처명", type: "text" },
            {
                key: "vendorIsUse",
                label: "사용여부",
                type: "select",
                options: [{ label: "사용", value: 1 }, { label: "미사용", value: 0 }]
            }
        ]
    }


}