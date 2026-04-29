import {useQuery} from "@tanstack/react-query";
import {getTaxInvoiceApi} from "../../apis/SalesService.tsx";
import Modal from "../../components/Modal.tsx";
import "../../assets/styles/sales/taxInvoice.css";

interface TaxInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: number;
}

const TaxInvoiceModal = ({isOpen, onClose, transactionId}: TaxInvoiceModalProps) => {

    const {data: taxInvoice} = useQuery({
        queryKey: ["taxInvoice", transactionId],
        queryFn: () => getTaxInvoiceApi(transactionId),
        enabled: isOpen,
    });

    const date = taxInvoice?.transactionDate ?? "";
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);

    const supplyDigits = String(taxInvoice?.supplyPrice ?? "").padStart(10, ' ').split('');
    const taxDigits = String(taxInvoice?.tax ?? "").padStart(10, ' ').split('');

    return (
        <Modal
            title="전자세금계산서"
            isOpen={isOpen}
            onClose={onClose}
            footer={
                <div className="btn-Wrap">
                    <button className="btn-Primary" onClick={() => window.print()}>인쇄</button>
                    <button className="btn-Secondary" onClick={onClose}>취소</button>
                </div>
            }
        >
            <table className="tax-Table">
                <colgroup>
                    <col style={{width: "16px"}}/>
                    <col style={{width: "60px"}}/>
                    <col style={{width: "174px"}}/>
                    <col style={{width: "16px"}}/>
                    <col style={{width: "94px"}}/>
                    <col style={{width: "174px"}}/>
                </colgroup>
                <tbody>
                <tr>
                    <td colSpan={3} className="tax-Title">
                        전자세금계산서 <span className="tax-Sub">(공급자용)</span>
                    </td>
                    <td colSpan={2} className="tax-Label">승인번호</td>
                    <td className="tax-Value">미발행</td>
                </tr>
                <tr>
                    <td rowSpan={2} className="tax-Side">공<br/>급<br/>자</td>
                    <td className="tax-Label">상호<br/>(법인명)</td>
                    <td className="tax-Value">{taxInvoice?.supplierName}</td>
                    <td rowSpan={2} className="tax-Side">공<br/>급<br/>받<br/>는<br/>자</td>
                    <td className="tax-Label">상호<br/>(법인명)</td>
                    <td className="tax-Value">{taxInvoice?.receiverName}</td>
                </tr>
                <tr>
                    <td className="tax-Label">거래처코드</td>
                    <td className="tax-Value">{taxInvoice?.supplierCode}</td>
                    <td className="tax-Label">거래처코드</td>
                    <td className="tax-Value">{taxInvoice?.receiverCode}</td>
                </tr>
                </tbody>
            </table>

            {/* 작성/공급가액/세액 */}
            <table className="tax-Table">
                <colgroup>
                    <col style={{width: "50px"}}/>
                    <col style={{width: "34px"}}/>
                    <col style={{width: "34px"}}/>
                    {Array(10).fill(null).map((_, i) => <col key={i} style={{width: "17px"}}/>)}
                    {Array(10).fill(null).map((_, i) => <col key={i+10} style={{width: "17px"}}/>)}
                    <col style={{width: "76px"}}/>
                </colgroup>
                <tbody>
                <tr>
                    <td colSpan={3} className="tax-Label">작성</td>
                    <td colSpan={10} className="tax-Label">공급가액</td>
                    <td colSpan={10} className="tax-Label">세액</td>
                    <td className="tax-Label">수정사유</td>
                </tr>
                <tr>
                    <td className="tax-Label">년</td>
                    <td className="tax-Label">월</td>
                    <td className="tax-Label">일</td>
                    {Array(10).fill(null).map((_, i) => <td key={i} className="tax-Label"></td>)}
                    {Array(10).fill(null).map((_, i) => <td key={i+10} className="tax-Label"></td>)}
                    <td className="tax-Label"></td>
                </tr>
                <tr>
                    <td className="tax-Value tax-Center">{year}</td>
                    <td className="tax-Value tax-Center">{month}</td>
                    <td className="tax-Value tax-Center">{day}</td>
                    {supplyDigits.map((n, i) => (
                        <td key={i} className="tax-Value tax-Center">{n.trim()}</td>
                    ))}
                    {taxDigits.map((n, i) => (
                        <td key={i+10} className="tax-Value tax-Center">{n.trim()}</td>
                    ))}
                    <td className="tax-Value"></td>
                </tr>
                <tr>
                    <td colSpan={3} className="tax-Label">비고</td>
                    <td colSpan={24} className="tax-Value" style={{height: "22px"}}></td>
                </tr>
                </tbody>
            </table>

            {/* 품목 */}
            <table className="tax-Table">
                <colgroup>
                    <col style={{width: "25px"}}/>
                    <col style={{width: "25px"}}/>
                    <col style={{width: "200px"}}/>
                    <col style={{width: "40px"}}/>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "50px"}}/>
                </colgroup>
                <tbody>
                <tr>
                    <td className="tax-Label">월</td>
                    <td className="tax-Label">일</td>
                    <td className="tax-Label">품목</td>
                    <td className="tax-Label">수량</td>
                    <td className="tax-Label">단가</td>
                    <td className="tax-Label">공급가액</td>
                    <td className="tax-Label">세액</td>
                </tr>
                {taxInvoice?.items?.map((item: any, idx: number) => (
                    <tr key={idx} style={{height: "28px"}}>
                        <td className="tax-Value tax-Center">{month}</td>
                        <td className="tax-Value tax-Center">{day}</td>
                        <td className="tax-Value">{item.productName}</td>
                        <td className="tax-Value tax-Center">{item.orderSno?.toLocaleString()}</td>
                        <td className="tax-Value tax-Right">{item.unitPrice?.toLocaleString()}</td>
                        <td className="tax-Value tax-Right">{item.totalPrice?.toLocaleString()}</td>
                        <td className="tax-Value tax-Right">{Math.floor(item.totalPrice * 0.1).toLocaleString()}</td>
                    </tr>
                ))}
                {[...Array(Math.max(0, 3 - (taxInvoice?.items?.length ?? 0)))].map((_, i) => (
                    <tr key={`empty-${i}`} style={{height: "28px"}}>
                        <td colSpan={7} className="tax-Value"></td>
                    </tr>
                ))}
                </tbody>
            </table>
            <table className="tax-Table">
                <colgroup>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "80px"}}/>
                    <col style={{width: "100px"}}/>
                </colgroup>
                <tbody>
                <tr>
                    <td className="tax-Label">합계금액</td>
                    <td className="tax-Label">현금</td>
                    <td className="tax-Label">수표</td>
                    <td className="tax-Label">어음</td>
                    <td className="tax-Label">외상</td>
                    <td className="tax-Value tax-Center">이 금액을 청구합</td>
                </tr>
                <tr>
                    <td className="tax-Value tax-Right">{taxInvoice?.totalPrice?.toLocaleString()}</td>
                    <td className="tax-Value"></td>
                    <td className="tax-Value"></td>
                    <td className="tax-Value"></td>
                    <td className="tax-Value tax-Right">{taxInvoice?.totalPrice?.toLocaleString()}</td>
                    <td className="tax-Value"></td>
                </tr>
                </tbody>
            </table>
        </Modal>
    );
};

export default TaxInvoiceModal;