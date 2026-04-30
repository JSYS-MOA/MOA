import {useEffect, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {Transaction} from "../../types/transaction.ts";
import {getTransactionApi, updateTransactionApi} from "../../apis/SalesService.tsx";
import Modal from "../../components/Modal.tsx";
import ConfirmModal from "../../components/ConfirmModal.tsx";
import TaxInvoiceModal from "./TaxInvoiceModal.tsx";
import "../../assets/styles/sales/taxInvoice.css";
import {IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId?: number | null;
    onSuccess?: () => void;
}

interface TransactionForm {
    transactionNum: number;
    transactionType: string;
    vendorCode: string;
    vendorName: string;
    transactionPrice: number;
    transactionMemo: string;
}

const TransactionModal = ({isOpen, onClose, transactionId, onSuccess}: TransactionModalProps) => {

    const isEditMode = transactionId != null;
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
    const isDirtyRef = useRef(false);
    const [isTaxOpen, setIsTaxOpen] = useState(false);
    const [showTaxBtn, setShowTaxBtn] = useState(false);

    const {data: transaction} = useQuery<Transaction>({
        queryKey: ["transaction", transactionId],
        queryFn: () => getTransactionApi(transactionId!),
        enabled: isOpen && isEditMode,
    });

    const [form, setForm] = useState<TransactionForm>({
        transactionNum: 0,
        transactionType: "",
        vendorCode: "",
        vendorName: "",
        transactionPrice: 0,
        transactionMemo: "",
    });

    useEffect(() => {
        if (!transaction || !isOpen) return;
        const timer = setTimeout(() => {
            setForm({
                transactionNum: transaction.transactionNum ?? 0,
                transactionType: transaction.transactionType ?? "",
                vendorCode: transaction.vendorCode ?? "",
                vendorName: transaction.vendorName ?? "",
                transactionPrice: transaction.transactionPrice ?? 0,
                transactionMemo: transaction.transactionMemo ?? "",
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [transaction, isOpen]);

    const handleChange = <K extends keyof TransactionForm>(key: K, value: TransactionForm[K]) => {
        isDirtyRef.current = true;
        setForm(prev => ({...prev, [key]: value}));
    };

    const handleUpdate = async () => {
        try {
            await updateTransactionApi(transactionId!, {
                transactionPrice: form.transactionPrice,
                transactionMemo: form.transactionMemo,
            });
            onSuccess?.();
            onClose();
        } catch {
            console.error("수정 실패");
        }
    };

    const handleClose = () => {
        isDirtyRef.current = false;
        onClose();
    };

    const handleCloseAttempt = () => {
        if (isDirtyRef.current) {
            setIsExitConfirmOpen(true);
        } else {
            handleClose();
        }
    };
    return (
        <>
            <Modal
                title="일반전표"
                isOpen={isOpen}
                onClose={handleCloseAttempt}
                bodyStyle={{flex: "none"}}
                tableContent={
                    <table className="modal-Table">
                        <thead>
                        <tr>
                            <th>거래코드</th>
                            <th>거래코드명</th>
                            <th>거래처코드</th>
                            <th>거래처명</th>
                            <th>차변</th>
                            <th>대변</th>
                            <th>적요</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                {isEditMode
                                    ? transaction?.transactionNum
                                    : <input type="number" value={form.transactionNum}
                                             onChange={(e) => handleChange("transactionNum", Number(e.target.value))}/>
                                }
                            </td>
                            <td>
                                {isEditMode
                                    ? transaction?.transactionType
                                    : <input type="text" value={form.transactionType}
                                             onChange={(e) => handleChange("transactionType", e.target.value)}/>
                                }
                            </td>
                            <td>
                                {isEditMode
                                    ? transaction?.vendorCode
                                    : <input type="text" value={form.vendorCode}
                                             onChange={(e) => handleChange("vendorCode", e.target.value)}/>
                                }
                            </td>
                            <td>
                                {isEditMode
                                    ? transaction?.vendorName
                                    : <input type="text" value={form.vendorName}
                                             onChange={(e) => handleChange("vendorName", e.target.value)}/>
                                }
                            </td>
                            <td>0</td>
                            <td>
                                <input
                                    type="number"
                                    value={form.transactionPrice}
                                    onChange={(e) => handleChange("transactionPrice", Number(e.target.value))}
                                    style={{width: "100px"}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={form.transactionMemo}
                                    onChange={(e) => handleChange("transactionMemo", e.target.value)}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                }
                footer={
                    <div>
                        <div className="btn-Wrap">
                            <button className="btn-Primary" onClick={handleUpdate}>저장</button>
                            <div style={{position: "relative"}}>
                                <button
                                    className="btn-Secondary"
                                    onClick={() => setShowTaxBtn(prev => !prev)}
                                    style={{display:"flex",alignItems:"center", gap:"25px"}}
                                >
                                    인쇄 {showTaxBtn ?  <IoMdArrowDropdown size={17} /> : <IoMdArrowDropup size={17}/> }
                                </button>
                                {showTaxBtn && (
                                    <div className="toggle-Btn-Ab">
                                        <div onClick={() => { setIsTaxOpen(true); setShowTaxBtn(false); }}>
                                            전자세금계산서
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="btn-Secondary" onClick={handleCloseAttempt}>취소</button>
                        </div>
                    </div>
                }
            >
                <div className="modal-Row">
                    <label>전표일자</label>
                    <span className="row-Span">{transaction?.createdAt?.slice(0, 10)}</span>
                </div>
            </Modal>
            <ConfirmModal
                isOpen={isExitConfirmOpen}
                message="작성 중인 내용이 있습니다. 나가시겠습니까?"
                onConfirm={() => {
                    setIsExitConfirmOpen(false);
                    handleClose();
                }}
                onClose={() => setIsExitConfirmOpen(false)}
            />
            <TaxInvoiceModal
                isOpen={isTaxOpen}
                onClose={() => setIsTaxOpen(false)}
                transactionId={transactionId!}
            />
        </>
    );
};

export default TransactionModal;