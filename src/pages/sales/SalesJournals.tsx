import {useQuery} from "@tanstack/react-query";
import type {Transaction} from "../../types/transaction.ts";
import {useState} from "react";
import Table, {type TableColumn} from "../../components/Table.tsx";
import {FaStar} from "react-icons/fa";
import {getTransactionsApi} from "../../apis/SalesService.tsx";
import TransactionModal from "./TransactionModal.tsx";

const SalesJournals = () => {

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const {data: transactions =[], refetch} = useQuery<Transaction[], Error, Transaction[]>({
        queryKey:["transactions"],
        queryFn:getTransactionsApi,
    });

    const columns: TableColumn<Transaction>[] = [
        {
            key: "transactionNum",
            label: "거래코드",
            render: (val, item) => (
                <span
                    onClick={() => {
                        setSelectedId(item.transactionId);
                        setIsDetailOpen(true);
                    }}
                    style={{cursor: "pointer", color: "var(--color-primary)"}}
                >
                    {val}
                </span>
            )
        },
        {key: "transactionType", label: "거래코드명"},
        {key: "vendorCode", label: "거래처코드"},
        {key: "vendorName", label: "거래처명"},
        {key: "transactionId", label: "차변", render: () => "0"},
        {key: "transactionPrice", label: "대변", render: (val) => val?.toLocaleString()},
        {key: "transactionMemo", label: "적요"},
    ];

    return(
        <>
            <div className="favorite-Header">
                <FaStar size={18} color="#C4C4C4"/>
                <span>회계거래관리</span>
            </div>
             <div className="sales-Wrapper">
                <Table
                    items={transactions}
                    idKey="transactionId"
                    columns={columns}
                />
             </div>
            {isDetailOpen && selectedId && (
                <TransactionModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    transactionId={selectedId}
                    onSuccess={() => refetch()}
                />
            )}
        </>
    )
}
export default SalesJournals;