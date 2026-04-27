import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    type CertificatesCardRecord,
    useGetCertificatesCardInfo,
    usePostCertificatesCard as usePostCertificatesCardHook,
    usePutCertificatesCard as usePutCertificatesCardHook,
} from "../../apis/hr/CertificatesCardService";
import ConfirmModal from "../../components/ConfirmModal.tsx";
import Modal from "../../components/Modal.tsx";
import "../../assets/styles/hr/certificatesUpdateCardModal.css";
import {
    createHrGradeOptions,
    getHrGradeNameById,
    resolveHrGradeId,
} from "../../constants/hrGradeOptions";

type Props = {
    isOpen: boolean;
    userId?: number | null;
    mode?: "create" | "edit";
    onClose: () => void;
    restrictEditToHrLead?: boolean;
};

type Department = {
    departmentId: number;
    departmentCord?: string | null;
    departmentName: string;
    departmentIsUse?: number | null;
};

type DepartmentResponse = Department[] | { content?: Department[]; value?: Department[] };

type GradeOption = {
    gradeId: number;
    gradeName: string;
};

type CardDetail = CertificatesCardRecord & Record<string, unknown>;

type FormState = {
    employeeId: string;
    userName: string;
    departmentId: string;
    departmentName: string;
    departmentCord: string;
    gradeId: string;
    gradeName: string;
    email: string;
    phone: string;
    address: string;
};

const DEPARTMENT_API_BASE = "/api/base/dept";
const EXCLUDED_DEPARTMENT_KEYWORDS = ["이사회"];
const MIN_VISIBLE_GRADE_ID = 5;

const DEPARTMENT_CODE_BY_ID: Record<number, string> = {
    1: "council",
    2: "HR-1",
    3: "WML-1",
    4: "ACLE-1",
};

const initialForm: FormState = {
    employeeId: "",
    userName: "",
    departmentId: "",
    departmentName: "",
    departmentCord: "",
    gradeId: "",
    gradeName: "",
    email: "",
    phone: "",
    address: "",
};

const normalizeText = (value: string) => value.trim().replace(/\s+/g, "").toLowerCase();

const getStringField = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim() !== "") {
            return value.trim();
        }

        if (typeof value === "number") {
            return String(value);
        }
    }

    return "";
};

const getNumberField = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value);

            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return undefined;
};

const extractDepartments = (response: DepartmentResponse) =>
    Array.isArray(response) ? response : response.content ?? response.value ?? [];

const isVisibleDepartment = (department: Department) => {
    if (department.departmentIsUse === 0) {
        return false;
    }

    const normalizedName = normalizeText(department.departmentName);

    return !EXCLUDED_DEPARTMENT_KEYWORDS.some((keyword) =>
        normalizedName.includes(normalizeText(keyword))
    );
};

const getDepartmentCord = (department?: Department) => {
    if (!department) {
        return "";
    }

    const code = department.departmentCord?.trim();

    if (code) {
        return code;
    }

    return DEPARTMENT_CODE_BY_ID[department.departmentId] ?? "";
};

const findDepartmentById = (departments: Department[], departmentId: string) =>
    departments.find((department) => String(department.departmentId) === departmentId.trim());

const findGradeById = (grades: GradeOption[], gradeId: string) =>
    grades.find((grade) => String(grade.gradeId) === gradeId.trim());

const isVisibleGradeOption = (grade: GradeOption) => grade.gradeId >= MIN_VISIBLE_GRADE_ID;

const ensureDepartmentOption = (
    departments: Department[],
    departmentId: string,
    departmentName: string,
    departmentCord: string
) => {
    const trimmedDepartmentName = departmentName.trim();

    if (!trimmedDepartmentName) {
        return departments;
    }

    const hasCurrentDepartment = departments.some(
        (department) =>
            String(department.departmentId) === departmentId ||
            normalizeText(department.departmentName) === normalizeText(trimmedDepartmentName)
    );

    if (hasCurrentDepartment) {
        return departments;
    }

    const parsedDepartmentId = Number(departmentId);

    return [
        ...departments,
        {
            departmentId: Number.isFinite(parsedDepartmentId) ? parsedDepartmentId : -1,
            departmentCord: departmentCord || undefined,
            departmentName: trimmedDepartmentName,
            departmentIsUse: 1,
        },
    ];
};

const ensureGradeOption = (grades: GradeOption[], gradeId: string, gradeName: string) => {
    const trimmedGradeName = gradeName.trim();
    const parsedGradeId = Number(gradeId);

    if (
        !trimmedGradeName ||
        !Number.isFinite(parsedGradeId) ||
        parsedGradeId < MIN_VISIBLE_GRADE_ID
    ) {
        return grades;
    }

    const hasCurrentGrade = grades.some(
        (grade) =>
            String(grade.gradeId) === gradeId ||
            normalizeText(grade.gradeName) === normalizeText(trimmedGradeName)
    );

    if (hasCurrentGrade) {
        return grades;
    }

    return [
        ...grades,
        {
            gradeId: parsedGradeId,
            gradeName: trimmedGradeName,
        },
    ].sort((left, right) => left.gradeId - right.gradeId);
};

const mapCardToForm = (card: CardDetail): FormState => {
    const resolvedGradeId = resolveHrGradeId(getNumberField(card, "gradeId", "grade_id"));
    const gradeName =
        getStringField(card, "gradeName", "grade_name") || getHrGradeNameById(resolvedGradeId);

    return {
        employeeId: getStringField(card, "employeeId", "employee_id"),
        userName: getStringField(card, "userName", "user_name"),
        departmentId: getStringField(card, "departmentId", "department_id"),
        departmentName: getStringField(card, "departmentName", "department_name"),
        departmentCord: getStringField(card, "departmentCord", "department_cord"),
        gradeId: resolvedGradeId ? String(resolvedGradeId) : "",
        gradeName,
        email: getStringField(card, "email"),
        phone: getStringField(card, "phone"),
        address: getStringField(card, "address"),
    };
};

const formatDepartmentDisplay = (departmentName: string, departmentCord: string) => {
    if (!departmentName) {
        return departmentCord;
    }

    if (!departmentCord) {
        return departmentName;
    }

    return `${departmentName} (${departmentCord})`;
};

const formatGradeDisplay = (gradeName: string, gradeId: string) => {
    if (!gradeName) {
        return gradeId;
    }

    if (!gradeId) {
        return gradeName;
    }

    return `${gradeName} (${gradeId})`;
};

const buildPayload = (form: FormState) => ({
    employeeId: form.employeeId.trim(),
    userName: form.userName.trim(),
    departmentId: Number(form.departmentId),
    departmentName: form.departmentName.trim(),
    gradeId: Number(form.gradeId),
    gradeName: form.gradeName.trim(),
});

const areSameForm = (left: FormState, right: FormState) =>
    JSON.stringify(left) === JSON.stringify(right);

const CertificatesCardUpdateModal = ({
                                         isOpen,
                                         userId,
                                         mode = "edit",
                                         onClose,
                                     }: Props) => {
    const queryClient = useQueryClient();

    /**
     * 중요:
     * userId는 직원 정보를 불러오기 위한 값.
     * mode가 create면 POST 등록.
     * mode가 edit이면 PUT 수정.
     */
    const isCreateMode = mode === "create";
    const formId = "certificates-card-update-form";

    const [departments, setDepartments] = useState<Department[]>([]);
    const [form, setForm] = useState<FormState>(initialForm);
    const [initialSnapshot, setInitialSnapshot] = useState<FormState>(initialForm);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [departmentError, setDepartmentError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

    const { mutateAsync: fetchCertificatesCardInfo } = useGetCertificatesCardInfo();
    const postCertificatesCard = usePostCertificatesCardHook();
    const putCertificatesCard = usePutCertificatesCardHook();

    const isSaving = postCertificatesCard.isPending || putCertificatesCard.isPending;

    /**
     * 저장 버튼은 모두 사용 가능.
     * 기존 roleId 제한 제거.
     */
    const canEdit = true;

    const editableInputClassName = isSaving
        ? "certificatesCardAddModal-input certificatesCardAddModal-input--readonly"
        : "certificatesCardAddModal-input";

    const readOnlyInputClassName =
        "certificatesCardAddModal-input certificatesCardAddModal-input--readonly";

    const selectableDepartments = useMemo(
        () =>
            ensureDepartmentOption(
                departments,
                form.departmentId,
                form.departmentName,
                form.departmentCord
            ),
        [departments, form.departmentId, form.departmentName, form.departmentCord]
    );

    const selectableGrades = useMemo(
        () =>
            ensureGradeOption(
                createHrGradeOptions().filter(isVisibleGradeOption),
                form.gradeId,
                form.gradeName
            ),
        [form.gradeId, form.gradeName]
    );

    const selectedDepartment = useMemo(
        () => findDepartmentById(selectableDepartments, form.departmentId),
        [selectableDepartments, form.departmentId]
    );

    const selectedGrade = useMemo(
        () => findGradeById(selectableGrades, form.gradeId),
        [selectableGrades, form.gradeId]
    );

    const resolvedDepartmentName = selectedDepartment?.departmentName ?? form.departmentName;

    const resolvedDepartmentCord = selectedDepartment
        ? getDepartmentCord(selectedDepartment)
        : form.departmentCord;

    const resolvedGradeName = selectedGrade?.gradeName ?? form.gradeName;
    const resolvedGradeId = selectedGrade ? String(selectedGrade.gradeId) : form.gradeId;

    const originalDepartmentDisplay = useMemo(() => {
        const originalDepartment = findDepartmentById(
            selectableDepartments,
            initialSnapshot.departmentId
        );

        return formatDepartmentDisplay(
            initialSnapshot.departmentName || (originalDepartment?.departmentName ?? ""),
            initialSnapshot.departmentCord || getDepartmentCord(originalDepartment)
        );
    }, [
        initialSnapshot.departmentCord,
        initialSnapshot.departmentId,
        initialSnapshot.departmentName,
        selectableDepartments,
    ]);

    const originalGradeDisplay = useMemo(() => {
        const originalGrade = findGradeById(selectableGrades, initialSnapshot.gradeId);

        return formatGradeDisplay(
            initialSnapshot.gradeName || (originalGrade?.gradeName ?? ""),
            initialSnapshot.gradeId
        );
    }, [initialSnapshot.gradeId, initialSnapshot.gradeName, selectableGrades]);

    const hasReferenceInfo = Boolean(form.email || form.phone || form.address);

    const hasUnsavedChanges = useMemo(
        () => !areSameForm(form, initialSnapshot),
        [form, initialSnapshot]
    );

    const noticeMessage = useMemo(() => {
        const messages: string[] = [];

        if (isLoadingDetail) {
            messages.push("인사 발령 정보를 불러오는 중입니다.");
        }

        if (isLoadingDepartments) {
            messages.push("부서 목록을 불러오는 중입니다.");
        }

        if (departmentError) {
            messages.push(departmentError);
        }

        if (loadError) {
            messages.push(loadError);
        }

        if (saveError) {
            messages.push(saveError);
        }

        return messages.join(" ");
    }, [departmentError, isLoadingDepartments, isLoadingDetail, loadError, saveError]);

    const resetModalState = () => {
        setDepartments([]);
        setForm(initialForm);
        setInitialSnapshot(initialForm);
        setIsLoadingDepartments(false);
        setIsLoadingDetail(false);
        setDepartmentError("");
        setLoadError("");
        setSaveError("");
        setIsExitConfirmOpen(false);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let isCancelled = false;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoadingDepartments(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDepartmentError("");

        axios
            .get<DepartmentResponse>(DEPARTMENT_API_BASE, { withCredentials: true })
            .then(({ data }) => {
                if (isCancelled) {
                    return;
                }

                const nextDepartments = extractDepartments(data)
                    .filter(isVisibleDepartment)
                    .sort((left, right) =>
                        left.departmentName.localeCompare(right.departmentName, "ko")
                    );

                setDepartments(nextDepartments);
            })
            .catch(() => {
                if (isCancelled) {
                    return;
                }

                setDepartments([]);
                setDepartmentError("부서 목록을 불러오지 못했습니다.");
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoadingDepartments(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        /**
         * 등록/수정 둘 다 userId로 직원 정보를 먼저 불러옴.
         * 단, 저장 방식만 mode로 구분함.
         */
        if (userId === null || userId === undefined) {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm(initialForm);
            setInitialSnapshot(initialForm);
            setLoadError("선택된 직원 정보가 없습니다.");
            return;
        }

        let isCancelled = false;

        setIsLoadingDetail(true);
        setLoadError("");

        fetchCertificatesCardInfo(userId)
            .then((card) => {
                if (isCancelled) {
                    return;
                }

                const nextForm = mapCardToForm(card as CardDetail);

                setForm(nextForm);
                setInitialSnapshot(nextForm);
            })
            .catch(() => {
                if (isCancelled) {
                    return;
                }

                setForm(initialForm);
                setInitialSnapshot(initialForm);
                setLoadError("직원 정보를 불러오지 못했습니다.");
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoadingDetail(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [fetchCertificatesCardInfo, isOpen, userId]);

    useEffect(() => {
        if (!selectedDepartment) {
            return;
        }

        const nextDepartmentName = selectedDepartment.departmentName;
        const nextDepartmentCord = getDepartmentCord(selectedDepartment);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((prev) => {
            if (
                prev.departmentName === nextDepartmentName &&
                prev.departmentCord === nextDepartmentCord
            ) {
                return prev;
            }

            return {
                ...prev,
                departmentName: nextDepartmentName,
                departmentCord: nextDepartmentCord,
            };
        });
    }, [selectedDepartment]);

    useEffect(() => {
        if (!selectedGrade) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((prev) => {
            if (prev.gradeName === selectedGrade.gradeName) {
                return prev;
            }

            return {
                ...prev,
                gradeName: selectedGrade.gradeName,
            };
        });
    }, [selectedGrade]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;

        setSaveError("");

        /**
         * 사번/이름은 작성자가 수정하면 안 되므로 무시.
         */
        if (name === "employeeId" || name === "userName") {
            return;
        }

        if (name === "departmentId") {
            const department = findDepartmentById(selectableDepartments, value);

            setForm((prev) => ({
                ...prev,
                departmentId: value,
                departmentName: department?.departmentName ?? "",
                departmentCord: getDepartmentCord(department),
            }));

            return;
        }

        if (name === "gradeId") {
            const grade = findGradeById(selectableGrades, value);

            setForm((prev) => ({
                ...prev,
                gradeId: value,
                gradeName: grade?.gradeName ?? "",
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRequestClose = () => {
        if (hasUnsavedChanges && !isSaving) {
            setIsExitConfirmOpen(true);
            return;
        }

        resetModalState();
        onClose();
    };

    const validateForm = () => {
        if (!form.employeeId.trim() || !form.userName.trim()) {
            return "직원 정보가 불러와지지 않았습니다. 직원을 다시 선택해 주세요.";
        }

        if (!resolvedDepartmentName || !resolvedDepartmentCord || !form.departmentId) {
            return "부서를 선택해 주세요.";
        }

        if (!resolvedGradeName || !resolvedGradeId || !form.gradeId) {
            return "직급을 선택해 주세요.";
        }

        if (!Number.isFinite(Number(form.departmentId)) || !Number.isFinite(Number(form.gradeId))) {
            return "부서와 직급 정보를 다시 확인해 주세요.";
        }

        return "";
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canEdit) {
            return;
        }

        const validationMessage = validateForm();

        if (validationMessage) {
            setSaveError(validationMessage);
            return;
        }

        const payload = buildPayload({
            ...form,
            departmentName: resolvedDepartmentName,
            departmentCord: resolvedDepartmentCord,
            gradeId: resolvedGradeId,
            gradeName: resolvedGradeName,
        });

        try {
            if (isCreateMode) {
                await postCertificatesCard.mutateAsync(payload);
            } else {
                if (userId === null || userId === undefined) {
                    setSaveError("수정할 직원 정보가 없습니다.");
                    return;
                }

                await putCertificatesCard.mutateAsync({
                    userId,
                    payload,
                });
            }

            await queryClient.invalidateQueries({
                queryKey: ["certificatesCardList"],
                exact: false,
            });

            await queryClient.invalidateQueries({
                queryKey: ["hrCards"],
                exact: false,
            });

            await queryClient.invalidateQueries({
                queryKey: ["hrCardList"],
                exact: false,
            });

            resetModalState();
            onClose();
        } catch {
            setSaveError(
                isCreateMode
                    ? "인사 발령을 등록하지 못했습니다."
                    : "인사 발령을 저장하지 못했습니다."
            );
        }
    };

    const submitLabel = isSaving
        ? isCreateMode
            ? "등록 중..."
            : "저장 중..."
        : isCreateMode
            ? "발령 등록"
            : "발령 저장";

    return (
        <>
            <div className="certificatesCardModalScope">
                <Modal
                    title={isCreateMode ? "인사 발령 등록" : "인사 발령 수정"}
                    isOpen={isOpen}
                    onClose={handleRequestClose}
                    footer={
                        <div className="certificatesCardAddModal-buttonRow">
                            <button
                                type="submit"
                                form={formId}
                                className="certificatesCardAddModal-button certificatesCardAddModal-button--primary"
                                disabled={isSaving}
                            >
                                {submitLabel}
                            </button>

                            <button
                                type="button"
                                className="certificatesCardAddModal-button certificatesCardAddModal-button--secondary"
                                onClick={handleRequestClose}
                                disabled={isSaving}
                            >
                                취소
                            </button>
                        </div>
                    }
                >
                    <form
                        id={formId}
                        className="certificatesCardAddModal-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="certificatesCardUpdateModal-topFields">
                            <div className="certificatesCardAddModal-field certificatesCardUpdateModal-field--top">
                                <label
                                    className="certificatesCardAddModal-label"
                                    htmlFor="certificates-employeeId"
                                >
                                    사번
                                </label>

                                <input
                                    id="certificates-employeeId"
                                    name="employeeId"
                                    value={form.employeeId}
                                    onChange={handleChange}
                                    className={readOnlyInputClassName}
                                    readOnly
                                />
                            </div>

                            <div className="certificatesCardAddModal-field certificatesCardUpdateModal-field--top">
                                <label
                                    className="certificatesCardAddModal-label"
                                    htmlFor="certificates-userName"
                                >
                                    이름
                                </label>

                                <input
                                    id="certificates-userName"
                                    name="userName"
                                    value={form.userName}
                                    onChange={handleChange}
                                    className={readOnlyInputClassName}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="certificatesCardUpdateModal-topFields">
                            <div className="certificatesCardAddModal-field certificatesCardUpdateModal-field--top">
                                <label className="certificatesCardAddModal-label">
                                    원래 부서
                                </label>

                                <input
                                    value={originalDepartmentDisplay}
                                    readOnly
                                    className={readOnlyInputClassName}
                                />
                            </div>

                            <div className="certificatesCardAddModal-field certificatesCardUpdateModal-field--top">
                                <label className="certificatesCardAddModal-label">
                                    원래 직급
                                </label>

                                <input
                                    value={originalGradeDisplay}
                                    readOnly
                                    className={readOnlyInputClassName}
                                />
                            </div>
                        </div>

                        <div className="certificatesCardAddModal-row certificatesCardAddModal-row--optionFields">
                            <div className="certificatesCardAddModal-column">
                                <label
                                    className="certificatesCardAddModal-label"
                                    htmlFor="certificates-departmentId"
                                >
                                    발령 부서
                                </label>

                                <select
                                    id="certificates-departmentId"
                                    name="departmentId"
                                    value={form.departmentId}
                                    onChange={handleChange}
                                    className={`${editableInputClassName} certificatesCardAddModal-select`}
                                    disabled={isSaving || isLoadingDepartments}
                                >
                                    <option value="">부서를 선택하세요</option>

                                    {selectableDepartments.map((department) => (
                                        <option
                                            key={department.departmentId}
                                            value={department.departmentId}
                                        >
                                            {department.departmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="certificatesCardAddModal-column">
                                <label className="certificatesCardAddModal-label">
                                    부서코드
                                </label>

                                <input
                                    value={resolvedDepartmentCord}
                                    readOnly
                                    className={readOnlyInputClassName}
                                />
                            </div>

                            <div className="certificatesCardAddModal-column">
                                <label
                                    className="certificatesCardAddModal-label"
                                    htmlFor="certificates-gradeId"
                                >
                                    발령 직급
                                </label>

                                <select
                                    id="certificates-gradeId"
                                    name="gradeId"
                                    value={form.gradeId}
                                    onChange={handleChange}
                                    className={`${editableInputClassName} certificatesCardAddModal-select`}
                                    disabled={isSaving}
                                >
                                    <option value="">직급을 선택하세요</option>

                                    {selectableGrades.map((grade) => (
                                        <option key={grade.gradeId} value={grade.gradeId}>
                                            {grade.gradeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="certificatesCardAddModal-column">
                                <label className="certificatesCardAddModal-label">
                                    직급코드
                                </label>

                                <input
                                    value={resolvedGradeId}
                                    readOnly
                                    className={readOnlyInputClassName}
                                />
                            </div>
                        </div>

                        {hasReferenceInfo && (
                            <>
                                <div className="certificatesCardAddModal-row">
                                    <div className="certificatesCardAddModal-field">
                                        <label className="certificatesCardAddModal-label">
                                            이메일
                                        </label>

                                        <input
                                            value={form.email}
                                            readOnly
                                            className={readOnlyInputClassName}
                                        />
                                    </div>

                                    <div className="certificatesCardAddModal-field">
                                        <label className="certificatesCardAddModal-label">
                                            연락처
                                        </label>

                                        <input
                                            value={form.phone}
                                            readOnly
                                            className={readOnlyInputClassName}
                                        />
                                    </div>
                                </div>

                                <div className="certificatesCardAddModal-row">
                                    <div className="certificatesCardAddModal-column">
                                        <label className="certificatesCardAddModal-label">
                                            주소
                                        </label>

                                        <input
                                            value={form.address}
                                            readOnly
                                            className={readOnlyInputClassName}
                                        />

                                        <span className="certificatesCardAddModal-hint">
                                            사번, 이름, 주소, 연락처, 이메일은 이 화면에서 변경하지 않습니다.
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {noticeMessage && (
                            <div className="certificatesCardAddModal-row">
                                <div className="certificatesCardAddModal-column">
                                    <label className="certificatesCardAddModal-label">
                                        안내
                                    </label>

                                    <div className="certificatesCardAddModal-hint">
                                        {noticeMessage}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </Modal>
            </div>

            <ConfirmModal
                isOpen={isExitConfirmOpen}
                message="작성 중인 내용이 있습니다. 닫으시겠습니까?"
                onConfirm={() => {
                    resetModalState();
                    onClose();
                }}
                onClose={() => setIsExitConfirmOpen(false)}
            />
        </>
    );
};

export default CertificatesCardUpdateModal;