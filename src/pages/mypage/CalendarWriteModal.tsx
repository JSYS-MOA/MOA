// import Modal from "../../components/Modal.tsx";
// import {Editor} from "@toast-ui/react-editor";
// import ConfirmModal from "../../components/ConfirmModal.tsx";
//
// const CalendarWriteModal = () => {
//
//     return(
//         <>
//             <Modal
//                 title={isEditMode ? "공지사항 수정" : "공지사항 등록"}
//                 isOpen={isOpen}
//                 onClose={handleCloseAttempt}
//                 footer={
//                     <div className="btn-Wrap">
//                         <button className="btn-Primary" onClick={handleSave}>저장</button>
//                         <button className="btn-Secondary" onClick={handleCloseAttempt}>취소</button>
//                     </div>
//                 }
//             >
//                 <div className="Write-Wrapper">
//                     <div className="modal-Row">
//                         <label>작성일자</label>
//                         <span className="row-Span">{new Date().toLocaleDateString("ko-KR")}</span>
//                     </div>
//                     <div className="modal-Row">
//                         <label>제목</label>
//                         <input
//                             type="text"
//                             placeholder="제목을 입력하세요"
//                             value={form.title}
//                             onChange={(e) => handleChange("title", e.target.value)}
//                         />
//                     </div>
//                     <div className="modal-Row">
//                         <label>공지대상</label>
//                         <select
//                             value={form.noticeType}
//                             onChange={(e) => handleChange("noticeType", e.target.value)}
//                         >
//                             <option value="전체">전체</option>
//                             <option value="팀별">팀별</option>
//                         </select>
//                     </div>
//                     <div className="modal-Row">
//                         <label>공지사항여부</label>
//                         <input
//                             type="checkbox"
//                             checked={form.isNotice}
//                             onChange={(e) => handleChange("isNotice", e.target.checked)}
//                         />
//                         <p style={{fontSize: "12px", color: "#151515", marginLeft: "3px"}}>사용</p>
//                     </div>
//                     <div className="modal-Row">
//                         <label>첨부</label>
//                         <div className="file-Input-Container">
//                             {(form.existingFile || form.file) && (
//                                 <div className="file-Name">
//                                     <span className="file-name-accent">파일</span>
//                                     <span className="file-Path">
//                                     {form.file
//                                         ? `${form.file.name} (${(form.file.size / 1024).toFixed(1)}KB)`
//                                         : form.existingFile!.substring(form.existingFile!.indexOf("_") + 1)
//                                     }
//                                 </span>
//                                 </div>
//                             )}
//                             <div
//                                 className="file-Input-wrapper"
//                                 onClick={() => document.getElementById("fileInput")?.click()}
//                             >
//                                 <span>+</span>
//                                 <input
//                                     id="fileInput"
//                                     type="file"
//                                     style={{display: "none"}}
//                                     onChange={(e) => {
//                                         handleChange("file", e.target.files?.[0] ?? null);
//                                         handleChange("existingFile", null);
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                     <div className="Write-Editor" style={{marginTop: "13px"}}>
//                         <Editor
//                             ref={editorRef}
//                             initialValue=" "
//                             previewStyle="vertical"
//                             height="369px"
//                             initialEditType="wysiwyg"
//                             onChange={() => {
//                                 if (isInitializing.current) return;
//
//                                 const value = editorRef.current?.getInstance().getMarkdown() ?? "";
//
//                                 setForm((prev) => ({...prev, content: value}));
//
//                                 isDirtyRef.current = true;
//                             }}
//                         />
//                     </div>
//                 </div>
//             </Modal>
//             <ConfirmModal
//                 isOpen={isExitConfirmOpen}
//                 message="수정 중인 내용이 있습니다. 나가시겠습니까?"
//                 onConfirm={() => {
//                     setIsExitConfirmOpen(false);
//                     handleClose();
//                 }}
//                 onClose={() => setIsExitConfirmOpen(false)}
//             />
//         </>
//     )}
// export default CalendarWriteModal;