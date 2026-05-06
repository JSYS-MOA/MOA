import Modal from "../Modal";
import "../../assets/styles/hr/certificateDocumentModal.css";

export type CertificateData = {
    userName: string;
    employeeId: string;
    departmentName: string;
    departmentCord: string;
    gradeName: string;
    phone: string;
    email: string;
    address: string;
    birth: string;
    startDate: string;
    quitDate: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    data: CertificateData | null;
    certificateTitle?: string;
    useLabel?: string;
    forceCurrentEmployment?: boolean;
};

const formatDisplayDate = (value: string) => {
    if (!value.trim()) {
        return "-";
    }

    const normalizedValue = value.includes("T") ? value.split("T")[0] : value;
    const [year = "", month = "", day = ""] = normalizedValue.split("-");

    if (!year || !month || !day) {
        return normalizedValue;
    }

    return `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;
};

const formatIssueDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
};

const formatPeriod = (startDate: string, quitDate: string) => {
    if (!startDate.trim()) {
        return "-";
    }

    return `${formatDisplayDate(startDate)} ~ ${
        quitDate.trim() ? formatDisplayDate(quitDate) : "현재"
    }`;
};

const getDepartmentDisplay = (departmentName: string, departmentCord: string) => {
    if (departmentName.trim() && departmentCord.trim()) {
        return `${departmentName} (${departmentCord})`;
    }

    return departmentName.trim() || departmentCord.trim() || "-";
};

const CertificateDocumentModal = ({
    isOpen,
    onClose,
    data,
    certificateTitle = "경력증명서",
    useLabel,
    forceCurrentEmployment = false,
}: Props) => {
    if (!isOpen || !data) {
        return null;
    }

    const hasQuitDate = data.quitDate.trim() !== "";
    const isEmploymentCertificate =
        (forceCurrentEmployment || certificateTitle.includes("재직")) && !hasQuitDate;
    const issueDate = formatIssueDate();
    const period = isEmploymentCertificate
        ? `${formatDisplayDate(data.startDate)} ~ 현재`
        : formatPeriod(data.startDate, data.quitDate);
    const employmentStatement = isEmploymentCertificate
        ? "위 사람은 상기와 같이 재직하고 있음을 증명합니다."
        : data.quitDate.trim()
            ? "위 사람은 상기와 같이 근무하였음을 증명합니다."
            : "위 사람은 상기와 같이 재직하고 있음을 증명합니다.";
    const englishSubtitle = isEmploymentCertificate
        ? "EMPLOYMENT CERTIFICATE"
        : "CAREER CERTIFICATE";
    const resolvedUseLabel = useLabel ?? (isEmploymentCertificate ? "재직 확인용" : "경력 확인용");

    const handlePrint = () => {
        window.print();
    };

    return (
            <Modal
                title={certificateTitle}
                isOpen={isOpen}
                onClose={onClose}
                footer={
                    <div className="CertificateDocumentModal-footer">
                        <button
                            type="button"
                            className="btn-Primary"
                            onClick={handlePrint}
                        >
                            인쇄
                        </button>
                        <button
                            type="button"
                            className="btn-Secondary"
                            onClick={onClose}
                        >
                            닫기
                        </button>
                    </div>
                }
            >
                <div className="CertificateDocument-paper">
                    <div className="CertificateDocument-paper__header">
                        <h2 className="CertificateDocument-title">{certificateTitle}</h2>
                        <div className="CertificateDocument-subtitle">{englishSubtitle}</div>
                    </div>

                    <table className="CertificateDocument-table">
                        <tbody>
                            <tr>
                                <th>성명</th>
                                <td>{data.userName || "-"}</td>
                                <th>사번</th>
                                <td>{data.employeeId || "-"}</td>
                            </tr>
                            <tr>
                                <th>부서</th>
                                <td>{getDepartmentDisplay(data.departmentName, data.departmentCord)}</td>
                                <th>직급</th>
                                <td>{data.gradeName || "-"}</td>
                            </tr>
                            <tr>
                                <th>생년월일</th>
                                <td>{formatDisplayDate(data.birth)}</td>
                                <th>연락처</th>
                                <td>{data.phone || "-"}</td>
                            </tr>
                            <tr>
                                <th>이메일</th>
                                <td>{data.email || "-"}</td>
                                <th>재직기간</th>
                                <td>{period}</td>
                            </tr>
                            <tr>
                                <th>주소</th>
                                <td colSpan={3}>{data.address || "-"}</td>
                            </tr>
                            <tr>
                                <th>용도</th>
                                <td colSpan={3}>{resolvedUseLabel}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="CertificateDocument-content">{employmentStatement}</div>

                    <div className="CertificateDocument-footer">
                        <div className="CertificateDocument-footer__date">{issueDate}</div>
                        <div className="CertificateDocument-footer__issuer">MOA</div>
                    </div>
                </div>
            </Modal>
    );
};

export default CertificateDocumentModal;
