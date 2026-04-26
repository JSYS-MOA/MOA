import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    type EvaluationsCardMutationPayload,
    type EvaluationsCardRecord,
    useGetEvaluationsCardInfo,
    usePostEvaluationsCard as usePostEvaluationsCardHook,
    usePutEvaluationsCard as usePutEvaluationsCardHook,
} from "../../apis/hr/EvaluationsCardService";
import ConfirmModal from "../ConfirmModal";
import Modal from "../Modal";
import "../../assets/styles/hr/evaluationsUpdateCardModal.css";
import {
    createHrGradeOptions,
    getHrGradeNameById,
    resolveHrGradeId,
} from "../../constants/hrGradeOptions";
import { useAuthStore } from "../../stores/useAuthStore";

type Props = {
    isOpen: boolean;
    userId?: number | null;
    onClose: () => void;
    restrictEditToEvaluationsLead?: boolean;
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

type CardDetail = EvaluationsCardRecord & Record<string, unknown>;

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
    performance: string;
};

type ComparableFormState = Pick<
    FormState,
    "employeeId" | "userName" | "departmentName" | "gradeName"
>;

const DEPARTMENT_API_BASE = "/api/base/dept";
const EXCLUDED_DEPARTMENT_KEYWORDS = ["이사회"];

const DEPARTMENT_CODE_BY_ID: Record<number, string> = {
    1: "council",
    2: "HR-1",
    3: "WML-1",
    4: "ACLE-1",
};

const GRADE_NAME_ALIASES: Record<string, string> = {
    President: "사장",
    President7: "사장",
    "Vice President": "부사장",
    "Executive Director": "상무",
    "General Manager": "부장",
    "Deputy General Manager": "과장",
    "Assistant Manager": "대리",
    Employee: "사원",
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
    performance: "",
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

const getCanonicalGradeName = (value?: string | null) => {
    const trimmed = value?.trim() ?? "";
    return trimmed ? GRADE_NAME_ALIASES[trimmed] ?? trimmed : "";
};

const normalizeGradeText = (value: string) => normalizeText(getCanonicalGradeName(value));

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

const findDepartmentByName = (departments: Department[], departmentName: string) => {
    const normalizedDepartmentName = normalizeText(departmentName);

    if (!normalizedDepartmentName) {
        return undefined;
    }

    return departments.find(
        (department) => normalizeText(department.departmentName) === normalizedDepartmentName
    );
};

const findGradeById = (grades: GradeOption[], gradeId: string) =>
    grades.find((grade) => String(grade.gradeId) === gradeId.trim());

const findGradeByName = (grades: GradeOption[], gradeName: string) => {
    const normalizedGradeName = normalizeGradeText(gradeName);

    if (!normalizedGradeName) {
        return undefined;
    }

    return grades.find((grade) => normalizeGradeText(grade.gradeName) === normalizedGradeName);
};

const mapCardToForm = (card: CardDetail): FormState => {
    const resolvedGradeId = resolveHrGradeId(getNumberField(card, "gradeId", "grade_id"));
    const gradeName =
        getCanonicalGradeName(getStringField(card, "gradeName", "grade_name")) ||
        getHrGradeNameById(resolvedGradeId);

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
        performance: getStringField(card, "performance"),
    };
};

const buildComparableFormState = (form: FormState): ComparableFormState => ({
    employeeId: form.employeeId,
    userName: form.userName,
    departmentName: form.departmentName,
    gradeName: form.gradeName,
});

const areSameForm = (left: ComparableFormState, right: ComparableFormState) =>
    JSON.stringify(left) === JSON.stringify(right);

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

const buildPayload = ({
    employeeId,
    userName,
    departmentId,
    departmentName,
    gradeId,
    gradeName,
}: {
    employeeId: string;
    userName: string;
    departmentId: string;
    departmentName: string;
    gradeId: string;
    gradeName: string;
}): EvaluationsCardMutationPayload => ({
    employeeId: employeeId.trim(),
    userName: userName.trim(),
    departmentId: Number(departmentId),
    departmentName: departmentName.trim(),
    gradeId: Number(gradeId),
    gradeName: gradeName.trim(),
});

const EvaluationsCardUpdateModal = ({
    isOpen,
    userId,
    onClose,
    restrictEditToEvaluationsLead = false,
}: Props) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const isCreateMode = userId === null || userId === undefined;
    const formId = "evaluations-card-update-form";

    const [departments, setDepartments] = useState<Department[]>([]);
    const [form, setForm] = useState<FormState>(initialForm);
    const [initialSnapshot, setInitialSnapshot] = useState<FormState>(initialForm);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [departmentError, setDepartmentError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

    const gradeOptions = useMemo(
        () =>
            createHrGradeOptions()
                .map((grade) => ({
                    ...grade,
                    gradeName: getCanonicalGradeName(grade.gradeName),
                }))
                .sort((left, right) => left.gradeId - right.gradeId),
        []
    );

    const { mutateAsync: fetchEvaluationsCardInfo } = useGetEvaluationsCardInfo();
    const postEvaluationsCard = usePostEvaluationsCardHook();
    const putEvaluationsCard = usePutEvaluationsCardHook();

    const isSaving = postEvaluationsCard.isPending || putEvaluationsCard.isPending;
    const canEdit = !restrictEditToEvaluationsLead || user?.roleId === 2;
    const isFormReadOnly = isSaving || isLoadingDetail || !canEdit;
    const isSubmitDisabled =
        isSaving ||
        isLoadingDetail ||
        isLoadingDepartments ||
        !canEdit ||
        Boolean(loadError) ||
        Boolean(departmentError);
    const inputClassName = isFormReadOnly
        ? "evaluationsCardAddModal-input evaluationsCardAddModal-input--readonly"
        : "evaluationsCardAddModal-input";
    const readOnlyInputClassName =
        "evaluationsCardAddModal-input evaluationsCardAddModal-input--readonly";
    const textareaClassName =
        "evaluationsCardAddModal-textarea evaluationsCardAddModal-input--readonly";

    const matchedDepartment = useMemo(
        () =>
            findDepartmentByName(departments, form.departmentName) ??
            findDepartmentById(departments, form.departmentId),
        [departments, form.departmentId, form.departmentName]
    );

    const matchedGrade = useMemo(
        () =>
            findGradeByName(gradeOptions, form.gradeName) ??
            findGradeById(gradeOptions, form.gradeId),
        [form.gradeId, form.gradeName, gradeOptions]
    );

    const resolvedDepartmentName = matchedDepartment?.departmentName ?? form.departmentName.trim();
    const resolvedDepartmentId = matchedDepartment
        ? String(matchedDepartment.departmentId)
        : form.departmentId.trim();
    const resolvedDepartmentCord = matchedDepartment
        ? getDepartmentCord(matchedDepartment)
        : form.departmentCord.trim();
    const resolvedGradeName = matchedGrade?.gradeName ?? getCanonicalGradeName(form.gradeName);
    const resolvedGradeId = matchedGrade ? String(matchedGrade.gradeId) : form.gradeId.trim();

    const originalDepartmentDisplay = useMemo(() => {
        if (isCreateMode) {
            return "";
        }

        const originalDepartment =
            findDepartmentByName(departments, initialSnapshot.departmentName) ??
            findDepartmentById(departments, initialSnapshot.departmentId);

        return formatDepartmentDisplay(
            originalDepartment?.departmentName ?? initialSnapshot.departmentName,
            originalDepartment?.departmentCord?.trim() ||
                getDepartmentCord(originalDepartment) ||
                initialSnapshot.departmentCord
        );
    }, [
        departments,
        initialSnapshot.departmentCord,
        initialSnapshot.departmentId,
        initialSnapshot.departmentName,
        isCreateMode,
    ]);

    const originalGradeDisplay = useMemo(() => {
        if (isCreateMode) {
            return "";
        }

        const originalGrade =
            findGradeByName(gradeOptions, initialSnapshot.gradeName) ??
            findGradeById(gradeOptions, initialSnapshot.gradeId);

        return formatGradeDisplay(
            originalGrade?.gradeName ?? getCanonicalGradeName(initialSnapshot.gradeName),
            originalGrade ? String(originalGrade.gradeId) : initialSnapshot.gradeId
        );
    }, [gradeOptions, initialSnapshot.gradeId, initialSnapshot.gradeName, isCreateMode]);

    const hasReferenceInfo = Boolean(
        form.email || form.phone || form.address || form.performance
    );
    const hasUnsavedChanges = useMemo(
        () =>
            !areSameForm(
                buildComparableFormState(form),
                buildComparableFormState(initialSnapshot)
            ),
        [form, initialSnapshot]
    );

    const noticeMessage = useMemo(() => {
        const messages: string[] = [];

        if (isLoadingDetail) {
            messages.push("인사 평가 정보를 불러오는 중입니다.");
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

        if (!canEdit) {
            messages.push("현재 계정은 이 평가를 저장할 수 없습니다.");
        }

        return messages.join(" ");
    }, [canEdit, departmentError, isLoadingDepartments, isLoadingDetail, loadError, saveError]);

    useEffect(() => {
        if (!isOpen) {
            setDepartments([]);
            setForm(initialForm);
            setInitialSnapshot(initialForm);
            setIsLoadingDepartments(false);
            setIsLoadingDetail(false);
            setDepartmentError("");
            setLoadError("");
            setSaveError("");
            setIsExitConfirmOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let isCancelled = false;

        setIsLoadingDepartments(true);
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

        if (isCreateMode) {
            setForm(initialForm);
            setInitialSnapshot(initialForm);
            setLoadError("");
            return;
        }

        let isCancelled = false;

        setIsLoadingDetail(true);
        setLoadError("");

        fetchEvaluationsCardInfo(userId)
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
                setLoadError("인사 평가 정보를 불러오지 못했습니다.");
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoadingDetail(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [fetchEvaluationsCardInfo, isCreateMode, isOpen, userId]);

    useEffect(() => {
        if (!matchedDepartment) {
            return;
        }

        const nextDepartmentId = String(matchedDepartment.departmentId);
        const nextDepartmentCord = getDepartmentCord(matchedDepartment);

        setForm((prev) => {
            if (
                prev.departmentId === nextDepartmentId &&
                prev.departmentCord === nextDepartmentCord
            ) {
                return prev;
            }

            return {
                ...prev,
                departmentId: nextDepartmentId,
                departmentCord: nextDepartmentCord,
            };
        });
    }, [matchedDepartment]);

    useEffect(() => {
        if (!matchedGrade) {
            return;
        }

        const nextGradeId = String(matchedGrade.gradeId);

        setForm((prev) => {
            if (prev.gradeId === nextGradeId) {
                return prev;
            }

            return {
                ...prev,
                gradeId: nextGradeId,
            };
        });
    }, [matchedGrade]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setSaveError("");

        if (name === "departmentName") {
            const department = findDepartmentByName(departments, value);

            setForm((prev) => ({
                ...prev,
                departmentName: value,
                departmentId: department ? String(department.departmentId) : "",
                departmentCord: getDepartmentCord(department),
            }));
            return;
        }

        if (name === "gradeName") {
            const grade = findGradeByName(gradeOptions, value);

            setForm((prev) => ({
                ...prev,
                gradeName: value,
                gradeId: grade ? String(grade.gradeId) : "",
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

        onClose();
    };

    const handleDiscardChanges = () => {
        setIsExitConfirmOpen(false);
        onClose();
    };

    const validateForm = () => {
        if (!form.employeeId.trim() || !form.userName.trim()) {
            return "사번과 이름은 필수입니다.";
        }

        if (!resolvedDepartmentName || !resolvedDepartmentId || !resolvedDepartmentCord) {
            return "등록된 부서명을 정확히 입력해 주세요.";
        }

        if (!resolvedGradeName || !resolvedGradeId) {
            return "등록된 직급명을 정확히 입력해 주세요.";
        }

        if (
            !Number.isFinite(Number(resolvedDepartmentId)) ||
            !Number.isFinite(Number(resolvedGradeId))
        ) {
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
            employeeId: form.employeeId,
            userName: form.userName,
            departmentId: resolvedDepartmentId,
            departmentName: resolvedDepartmentName,
            gradeId: resolvedGradeId,
            gradeName: resolvedGradeName,
        });

        try {
            if (isCreateMode) {
                await postEvaluationsCard.mutateAsync(payload);
            } else if (userId !== null && userId !== undefined) {
                await putEvaluationsCard.mutateAsync({
                    userId,
                    payload,
                });
            }

            await queryClient.invalidateQueries({ queryKey: ["paCardList"] });
            onClose();
        } catch {
            setSaveError(
                isCreateMode
                    ? "인사 평가를 등록하지 못했습니다."
                    : "인사 평가를 저장하지 못했습니다."
            );
        }
    };

    const submitLabel = isSaving
        ? isCreateMode
            ? "등록 중..."
            : "저장 중..."
        : isCreateMode
          ? "평가 등록"
          : "평가 저장";

    return (
        <>
            <div className="evaluationsCardModalScope">
                <Modal
                    title={isCreateMode ? "인사 평가 등록" : "인사 평가 수정"}
                    isOpen={isOpen}
                    onClose={handleRequestClose}
                    footer={
                        <div className="evaluationsCardAddModal-buttonRow">
                            <button
                                type="submit"
                                form={formId}
                                className="evaluationsCardAddModal-button evaluationsCardAddModal-button--primary"
                                disabled={isSubmitDisabled}
                            >
                                {submitLabel}
                            </button>
                            <button
                                type="button"
                                className="evaluationsCardAddModal-button evaluationsCardAddModal-button--secondary"
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
                        className="evaluationsCardAddModal-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="evaluationsCardUpdateModal-topFields">
                            <div className="evaluationsCardAddModal-field evaluationsCardUpdateModal-field--top">
                                <label
                                    className="evaluationsCardAddModal-label"
                                    htmlFor="evaluations-employeeId"
                                >
                                    사번
                                </label>
                                <input
                                    id="evaluations-employeeId"
                                    name="employeeId"
                                    value={form.employeeId}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    readOnly
                                />
                            </div>
                            <div className="evaluationsCardAddModal-field evaluationsCardUpdateModal-field--top">
                                <label
                                    className="evaluationsCardAddModal-label"
                                    htmlFor="evaluations-userName"
                                >
                                    이름
                                </label>
                                <input
                                    id="evaluations-userName"
                                    name="userName"
                                    value={form.userName}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="evaluationsCardAddModal-row evaluationsCardAddModal-row--optionFields">
                            <div className="evaluationsCardAddModal-column">
                                <label
                                    className="evaluationsCardAddModal-label"
                                    htmlFor="evaluations-departmentName"
                                >
                                    부서
                                </label>
                                <input
                                    id="evaluations-departmentName"
                                    name="departmentName"
                                    value={form.departmentName}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    readOnly
                                />
                            </div>

                            <div className="evaluationsCardAddModal-column">
                                <label
                                    className="evaluationsCardAddModal-label"
                                    htmlFor="evaluations-gradeName"
                                >
                                    직급
                                </label>
                                <input
                                    id="evaluations-gradeName"
                                    name="gradeName"
                                    value={form.gradeName}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    readOnly
                                />
                            </div>
                        </div>

                        {hasReferenceInfo && (
                            <>
                                {(form.email || form.phone) && (
                                    <div className="evaluationsCardAddModal-row">
                                        <div className="evaluationsCardAddModal-field">
                                            <label className="evaluationsCardAddModal-label">이메일</label>
                                            <input
                                                value={form.email}
                                                readOnly
                                                className={readOnlyInputClassName}
                                            />
                                        </div>

                                        <div className="evaluationsCardAddModal-field">
                                            <label className="evaluationsCardAddModal-label">연락처</label>
                                            <input
                                                value={form.phone}
                                                readOnly
                                                className={readOnlyInputClassName}
                                            />
                                        </div>
                                    </div>
                                )}

                                {form.address && (
                                    <div className="evaluationsCardAddModal-row">
                                        <div className="evaluationsCardAddModal-column">
                                            <label className="evaluationsCardAddModal-label">주소</label>
                                            <input
                                                value={form.address}
                                                readOnly
                                                className={readOnlyInputClassName}
                                            />
                                        </div>
                                    </div>
                                )}

                                {form.performance && (
                                    <div className="evaluationsCardAddModal-row">
                                        <div className="evaluationsCardAddModal-column">
                                            <label className="evaluationsCardAddModal-label">평가</label>
                                            <textarea
                                                value={form.performance}
                                                readOnly={isFormReadOnly}
                                                className={textareaClassName}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {noticeMessage && (
                            <div className="evaluationsCardAddModal-row">
                                <div className="evaluationsCardAddModal-column">
                                    <label className="evaluationsCardAddModal-label">안내</label>
                                    <div className="evaluationsCardAddModal-hint">{noticeMessage}</div>
                                </div>
                            </div>
                        )}
                    </form>
                </Modal>
            </div>

            <ConfirmModal
                isOpen={isExitConfirmOpen}
                message="작성 중인 내용이 있습니다. 닫으시겠습니까?"
                onConfirm={handleDiscardChanges}
                onClose={() => setIsExitConfirmOpen(false)}
            />
        </>
    );
};

export default EvaluationsCardUpdateModal;
