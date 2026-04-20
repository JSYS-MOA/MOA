import { useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import type { HrCard } from "../../apis/HrCardService";
import { useHrCardAdd } from "../../apis/HrCardService";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type HrCardFormState = {
    employeeId: string;
    userName: string;
    password: string;
    birth: string;
    roleId: string;
    departmentId: string;
    departmentName: string;
    gradeId: string;
    gradeName: string;
    managerId: string;
    email: string;
    startDate: string;
    quitDate: string;
    phone: string;
    bank: string;
    accountNum: string;
    accountOwner: string;
    address: string;
    performance: string;
};

const initialForm: HrCardFormState = {
    employeeId: "",
    userName: "",
    password: "",
    birth: "",
    roleId: "",
    departmentId: "",
    departmentName: "",
    gradeId: "",
    gradeName: "",
    managerId: "",
    email: "",
    startDate: "",
    quitDate: "",
    phone: "",
    bank: "",
    accountNum: "",
    accountOwner: "",
    address: "",
    performance: "",
};

const toNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
};

const toRequiredNumber = (value: string, label: string) => {
    const trimmed = value.trim();
    const parsed = Number(trimmed);

    if (trimmed === "" || !Number.isFinite(parsed)) {
        throw new Error(`${label}를 숫자로 입력해 주세요.`);
    }

    return parsed;
};

const HrCardAddModal = ({ isOpen, onClose }: Props) => {
    const [form, setForm] = useState<HrCardFormState>(initialForm);
    const addHrCard = useHrCardAdd();

    useEffect(() => {
        if (!isOpen) {
            setForm(initialForm);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const payload: Partial<HrCard> = {
                employeeId: form.employeeId.trim(),
                userName: form.userName.trim(),
                password: form.password.trim(),
                birth: toNullable(form.birth),
                roleId: toRequiredNumber(form.roleId, "권한 코드"),
                departmentId: toRequiredNumber(form.departmentId, "부서 코드"),
                departmentName: toNullable(form.departmentName),
                gradeId: toRequiredNumber(form.gradeId, "직급 코드"),
                gradeName: toNullable(form.gradeName),
                email: toNullable(form.email),
                startDate: toNullable(form.startDate) ?? undefined,
                quitDate: toNullable(form.quitDate),
                phone: toNullable(form.phone),
                bank: toNullable(form.bank),
                accountNum: toNullable(form.accountNum),
                address: toNullable(form.address),
                performance: toNullable(form.performance),
            };

            await addHrCard.mutateAsync(payload);
            onClose();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "인사카드 등록에 실패했습니다.";

            console.error(error);
            alert(message);
        }
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>인사카드 등록</h2>
                    <button type="button" onClick={onClose} style={closeButtonStyle}>
                        닫기
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={formContainerStyle}>
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label>사번번호</label>
                            <input
                                name="employeeId"
                                type="text"
                                value={form.employeeId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>권한 코드</label>
                            <input
                                name="roleId"
                                type="text"
                                placeholder="1"
                                value={form.roleId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>성명</label>
                            <input
                                name="userName"
                                type="text"
                                value={form.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>비밀번호</label>
                            <input
                                name="password"
                                type="text"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label>부서</label>
                            <input
                                name="departmentName"
                                type="text"
                                placeholder="영업팀"
                                value={form.departmentName}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={smallFieldStyle}>
                            <label>코드</label>
                            <input
                                name="departmentId"
                                type="text"
                                placeholder="101"
                                value={form.departmentId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>직급/직책</label>
                            <input
                                name="gradeName"
                                type="text"
                                placeholder="대리"
                                value={form.gradeName}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={smallFieldStyle}>
                            <label>코드</label>
                            <input
                                name="gradeId"
                                type="text"
                                placeholder="1"
                                value={form.gradeId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label>관리자번호</label>
                            <input
                                name="managerId"
                                type="text"
                                value={form.managerId}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label>입사일</label>
                            <input
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>퇴사일</label>
                            <input
                                name="quitDate"
                                type="date"
                                value={form.quitDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label>전화번호</label>
                            <input
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>계좌번호</label>
                            <input
                                name="accountNum"
                                type="text"
                                value={form.accountNum}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label>은행</label>
                            <input
                                name="bank"
                                type="text"
                                value={form.bank}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label>예금주</label>
                            <input
                                name="accountOwner"
                                type="text"
                                value={form.accountOwner}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={columnStyle}>
                        <label>생년월일</label>
                        <input
                            name="birth"
                            type="text"
                            placeholder="1990-01-01"
                            value={form.birth}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={columnStyle}>
                        <label>주소</label>
                        <input
                            name="address"
                            type="text"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={columnStyle}>
                        <label>인사평가</label>
                        <textarea
                            name="performance"
                            value={form.performance}
                            onChange={handleChange}
                            style={textareaStyle}
                        />
                    </div>

                    <div style={buttonRowStyle}>
                        <button type="button" onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" disabled={addHrCard.isPending}>
                            {addHrCard.isPending ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const backdropStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
};

const modalStyle: CSSProperties = {
    width: "min(920px, 92vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
};

const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
};

const titleStyle: CSSProperties = {
    margin: 0,
};

const closeButtonStyle: CSSProperties = {
    padding: "8px 12px",
    border: "1px solid #d0d7de",
    borderRadius: "8px",
    backgroundColor: "#fff",
};

const formContainerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

const rowStyle: CSSProperties = {
    display: "flex",
    gap: "10px",
};

const fieldStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "6px",
};

const smallFieldStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "120px",
    gap: "6px",
};

const columnStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
};

const textareaStyle: CSSProperties = {
    minHeight: "96px",
    resize: "vertical",
};

const buttonRowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "8px",
};

export default HrCardAddModal;
