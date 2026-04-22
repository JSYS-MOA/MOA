import Modal from "../../../components/Modal.tsx";
import {useEffect, useState} from "react";
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { useRef } from "react";
import {getNoticeInfoApi, createNoticeApi, updateNoticeApi} from "../../../apis/NoticeService.tsx";

interface NoticeWriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    noticeId?: number | null;
}

const NoticeWriteModal = ({isOpen, onClose, noticeId}:NoticeWriteModalProps) => {

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [noticeType, setNoticeType] = useState("전체");
    const [isNotice, setIsNotice] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [existingFile, setExistingFile] = useState<string | null>(null);
    const editorRef = useRef<Editor>(null);
    const isEditMode = noticeId != null;

    //공지사항 수정
    useEffect(() => {
        if (!isOpen || noticeId == null) return;

        const fetchData = async () => {
            try {
                const data = await getNoticeInfoApi(noticeId);

                setTitle(data.noticeTitle);
                setNoticeType(data.noticeType ?? "전체");
                setIsNotice(data.isNotice ?? false);
                setContent(data.noticeContent ?? "");
                setExistingFile(data.file ?? null);

            } catch {
                console.error("공지 불러오기 실패");
            }
        };

        void fetchData();
    }, [noticeId, isOpen]);

    //공지사항 등록
    useEffect(() => {
        if (editorRef.current && content) {
            editorRef.current.getInstance().setMarkdown(content);
        }
    }, [content]);

    const handleSave = async () => {

        const formData = new FormData();
        formData.append("noticeTitle", title);
        formData.append("noticeContent", content);
        formData.append("noticeType", noticeType);
        formData.append("isNotice", String(isNotice));

        if (file) {
            formData.append("file", file);
        }

        try {
            if (isEditMode) {
                await updateNoticeApi(noticeId!, formData);
            } else {
                await createNoticeApi(formData);
            }

            handleClose();

        } catch {
            console.error("저장 실패");
        }
    };

    const handleClose = () => {
        setTitle("");
        setNoticeType("전체");
        setIsNotice(false);
        setFile(null);
        setContent("");
        setExistingFile(null);
        editorRef.current?.getInstance().setMarkdown("");
        onClose();
    };

    return(
        <Modal
            title={isEditMode ? "공지사항 수정" : "공지사항 등록"}
            isOpen={isOpen}
            onClose={handleClose}
            footer={
                <div className="btn-Wrap">
                    <button className="btn-Primary" onClick={handleSave}>저장</button>
                    <button className="btn-Secondary" onClick={handleClose}>취소</button>
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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                </div>
                <div className="modal-Row">
                    <label>공지대상</label>
                        <select
                            value={noticeType}
                            onChange={(e) => setNoticeType(e.target.value)}
                        >
                            <option value="전체">전체</option>
                            <option value="팀별">팀별</option>
                        </select>
                </div>
                <div className="modal-Row">
                    <label>공지사항여부</label>
                    <input
                        type="checkbox"
                        checked={isNotice}
                        onChange={(e)=>setIsNotice(e.target.checked)}
                    />
                    <p style={{fontSize:"12px", color:"#151515", marginLeft:"3px"}}>사용</p>
                </div>
                <div className="modal-Row">
                    <label>첨부</label>
                    <div className="file-Input-Container">
                        {(existingFile || file) && (
                            <div className="file-Name">
                                <span className="file-name-accent">
                                    파일
                                </span>
                                <span className="file-Path">
                                    {file
                                        ? `${file.name} (${(file.size / 1024).toFixed(1)}KB)`
                                        : existingFile!.substring(existingFile!.indexOf("_") + 1)
                                    }
                                </span>
                            </div>
                        )}
                        <div className="file-Input-wrapper"
                             onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <span>+</span>
                            <input
                                id="fileInput"
                                type="file"
                                onChange={(e) => {
                                    setFile(e.target.files?.[0] || null);
                                    setExistingFile(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="Write-Editor" style={{marginTop:"13px"}}>
                    <Editor
                        ref={editorRef}
                        initialValue={content || " "}
                        previewStyle="vertical"
                        height="369px"
                        initialEditType="wysiwyg"
                        useCommandShortcut={true}
                        onChange={() => {
                            const value = editorRef.current?.getInstance().getMarkdown();
                            setContent(value || "");
                        }}
                    />
                </div>
            </div>
        </Modal>
    )
}
export default NoticeWriteModal;