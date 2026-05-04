import {FaStar} from "react-icons/fa";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {Transaction} from "../../types/transaction.ts";
import {getTaxInvoiceListApi} from "../../apis/SalesService.tsx";
import Table, {type TableColumn} from "../../components/Table.tsx";
import TaxInvoiceModal from "./TaxInvoiceModal.tsx";

const TaxInvoicePage = () => {

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {data: transactions = []} = useQuery<Transaction[]>({
        queryKey: ["taxInvoiceList"],
        queryFn: getTaxInvoiceListApi,
    });

    const columns: TableColumn<Transaction>[] = [
        {
            key: "transactionNum",
            label: "거래코드",
            render: (val, item) => (
                <span
                    onClick={() => {
                        setSelectedId(item.transactionId);
                        setIsModalOpen(true);
                    }}
                    style={{cursor: "pointer", color: "var(--text-accent)"}}
                >
                    {val}
                </span>
            )
        },
        {key: "transactionType", label: "거래코드명"},
        {key: "vendorCode", label: "거래처코드"},
        {key: "vendorName", label: "거래처명"},
        {key: "transactionPrice", label: "공급가액", render: (val) => val?.toLocaleString(),align: "right"},
        {key: "transactionMemo", label: "적요"},
        {key: "createdAt", label: "등록일", render: (val) => val?.slice(0, 10),
            align: "center",},
    ];


    return (
        <>
            <div className="favorite-Header">
                <FaStar size={18} color="#C4C4C4"/>
                <span>전자세금계산서</span>
            </div>
                <Table
                    items={transactions}
                    idKey="transactionId"
                    columns={columns}
                />
            {isModalOpen && selectedId && (
                <TaxInvoiceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    transactionId={selectedId}
                />
            )}
        </>
    );
};

export default TaxInvoicePage;