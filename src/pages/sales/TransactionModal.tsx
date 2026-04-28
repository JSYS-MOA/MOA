import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {Transaction} from "../../types/transaction.ts";
import {deleteTransactionApi, getTransactionApi, updateTransactionApi} from "../../apis/SalesService.tsx";
import Modal from "../../components/Modal.tsx";
import ConfirmModal from "../../components/ConfirmModal.tsx";

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
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const {data: transaction} = useQuery<Transaction>({
        queryKey: ["transaction", transactionId],
        queryFn: () => getTransactionApi(transactionId!),
        enabled: isOpen && isEditMode,
    });

    const [form, setForm] = useState<TransactionForm>({
        transactionNum: transaction?.transactionNum ?? 0,
        transactionType: transaction?.transactionType ?? "",
        vendorCode: transaction?.vendorCode ?? "",
        vendorName: transaction?.vendorName ?? "",
        transactionPrice: transaction?.transactionPrice ?? 0,
        transactionMemo: transaction?.transactionMemo ?? "",
    });

    const handleChange = <K extends keyof TransactionForm>(key: K, value: TransactionForm[K]) => {
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

    const handleDelete = async () => {
        try {
            await deleteTransactionApi(transactionId!);
            onSuccess?.();
            setIsDeleteOpen(false);
            onClose();
        } catch {
            console.error("삭제 실패");
        }
    };

    return (
        <>
            <Modal
                title="일반전표"
                isOpen={isOpen}
                onClose={onClose}
                bodyStyle={{flex: "none", padding:"10px 15px"}}
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
                                    value={isEditMode ? (transaction?.transactionPrice ?? 0) : form.transactionPrice}
                                    onChange={(e) => handleChange("transactionPrice", Number(e.target.value))}
                                    style={{width: "100px"}}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={isEditMode ? (transaction?.transactionMemo ?? "") : form.transactionMemo}
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
                            {isEditMode && transaction?.transactionType !== "일반전표(급여)" && (
                                <button className="btn-Secondary" onClick={() => window.print()}>인쇄</button>
                            )}
                            <button className="btn-Secondary" onClick={onClose}>취소</button>
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
                isOpen={isDeleteOpen}
                message="삭제하시겠습니까?"
                onConfirm={handleDelete}
                onClose={() => setIsDeleteOpen(false)}
            />
        </>
    );
};

export default TransactionModal;