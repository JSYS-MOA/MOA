import Modal from "../../../components/Modal.tsx";
import {useEffect, useState, useRef} from "react";
import '@toast-ui/editor/dist/toastui-editor.css';
import {Editor} from '@toast-ui/react-editor';
import {createNoticeApi, getNoticeInfoApi, updateNoticeApi} from "../../../apis/NoticeService.tsx";
import {useQuery} from "@tanstack/react-query";

interface Notice {
    noticeId: number;
    noticeTitle: string;
    noticeContent: string | null;
    noticeType: string | null;
    isNotice: boolean | null;
    file: string | null;
}

interface NoticeForm {
    title: string;
    content: string;
    noticeType: string;
    isNotice: boolean;
    file: File | null;
    existingFile: string | null;
}

interface NoticeWriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    noticeId?: number | null;
    onSuccess?: () => void;
}

const NoticeWriteModal = ({isOpen, onClose, noticeId, onSuccess}: NoticeWriteModalProps) => {

    const [form, setForm] = useState<NoticeForm>({
        title: "",
        content: "",
        noticeType: "전체",
        isNotice: false,
        file: null,
        existingFile: null,
    });

    //수정 중 취소하기 누르면 알림창 나오게하기
    const [isDirty, setIsDirty] = useState(false);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

    const editorRef = useRef<Editor>(null);
    const isEditMode = noticeId != null;

    const {data: noticeData} = useQuery<Notice>({
        queryKey: ["notice", noticeId],
        queryFn: () => getNoticeInfoApi(noticeId!),
        enabled: noticeId != null && isOpen,
        staleTime: 0
    });

    const handleChange = <K extends keyof NoticeForm>(key: K, value: NoticeForm[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    useEffect(() => {
        if (!noticeData) return;

        const load = async () => {
            setForm({
                title: noticeData.noticeTitle,
                content: noticeData.noticeContent ?? "",
                noticeType: noticeData.noticeType ?? "전체",
                isNotice: noticeData.isNotice ?? false,
                file: null,
                existingFile: noticeData.file ?? null,
            });
            editorRef.current?.getInstance().setMarkdown(noticeData.noticeContent ?? "");
        };
        void load();
    }, [noticeData]);

    const handleSave = async () => {
        const formData = new FormData();
        formData.append("noticeTitle", form.title);
        formData.append("noticeContent", form.content);
        formData.append("noticeType", form.noticeType);
        formData.append("isNotice", String(form.isNotice));

        if (form.file) {
            formData.append("file", form.file);
        }

        try {
            if (isEditMode) {
                await updateNoticeApi(noticeId!, formData);
            } else {
                await createNoticeApi(formData);
            }
            onSuccess?.();
            handleClose();
        } catch {
            console.error("저장 실패");
        }
    };

    const handleClose = () => {
        setForm({
            title: "",
            content: "",
            noticeType: "전체",
            isNotice: false,
            file: null,
            existingFile: null,
        });
        editorRef.current?.getInstance().setMarkdown("");
        onClose();
    };

    const handleCloseAttempt = () => {
        if (isDirty) {
            setIsExitConfirmOpen(true);
        } else {
            handleClose();
        }
    };

    return (
        <>
        <Modal
            title={isEditMode ? "공지사항 수정" : "공지사항 등록"}
            isOpen={isOpen}
            onClose={handleCloseAttempt}
            footer={
                <div className="btn-Wrap">
                    <button className="btn-Primary" onClick={handleSave}>저장</button>
                    <button className="btn-Secondary" onClick={handleCloseAttempt}>취소</button>
                </div>
            }
        >
            <div className="Write-Wrapper">
                <div className="modal-Row">
                    <label>작성일자</label>
                    <span className="row-Span">{new Date().toLocaleDateString("ko-KR")}</span>
                </div>
                <div className="modal-Row">
                    <label>제목</label>
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />
                </div>
                <div className="modal-Row">
                    <label>공지대상</label>
                    <select
                        value={form.noticeType}
                        onChange={(e) => handleChange("noticeType", e.target.value)}
                    >
                        <option value="전체">전체</option>
                        <option value="팀별">팀별</option>
                    </select>
                </div>
                <div className="modal-Row">
                    <label>공지사항여부</label>
                    <input
                        type="checkbox"
                        checked={form.isNotice}
                        onChange={(e) => handleChange("isNotice", e.target.checked)}
                    />
                    <p style={{fontSize: "12px", color: "#151515", marginLeft: "3px"}}>사용</p>
                </div>
                <div className="modal-Row">
                    <label>첨부</label>
                    <div className="file-Input-Container">
                        {(form.existingFile || form.file) && (
                            <div className="file-Name">
                                <span className="file-name-accent">파일</span>
                                <span className="file-Path">
                                    {form.file
                                        ? `${form.file.name} (${(form.file.size / 1024).toFixed(1)}KB)`
                                        : form.existingFile!.substring(form.existingFile!.indexOf("_") + 1)
                                    }
                                </span>
                            </div>
                        )}
                        <div
                            className="file-Input-wrapper"
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <span>+</span>
                            <input
                                id="fileInput"
                                type="file"
                                style={{display: "none"}}
                                onChange={(e) => {
                                    handleChange("file", e.target.files?.[0] ?? null);
                                    handleChange("existingFile", null);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="Write-Editor" style={{marginTop: "13px"}}>
                    <Editor
                        ref={editorRef}
                        initialValue=" "
                        previewStyle="vertical"
                        height="369px"
                        initialEditType="wysiwyg"
                        onChange={() => {
                            const value = editorRef.current?.getInstance().getMarkdown() ?? "";
                            handleChange("content", value);
                        }}
                    />
                </div>
            </div>
        </Modal>
            <ConfirmModal
                isOpen={isExitConfirmOpen}
                title="작성 취소"
                message="수정 중인 내용이 있습니다. 나가시겠습니까?"
                onConfirm={() => {
                    setIsExitConfirmOpen(false);
                    handleClose();
                }}
                onClose={() => setIsExitConfirmOpen(false)}
            />
    </>
    );
};

export default NoticeWriteModal;