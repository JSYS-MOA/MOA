import "../../../assets/styles/main/team.css";
import TeamLayout from "./TeamLayout.tsx";
import Table, {type TableColumn} from "../../../components/Table.tsx";
import {useGetInbounds, useGetInboundsInfo} from "../../../apis/InventoryService.tsx";
import {useState} from "react";
import type {MColumn, ModalProps} from "../../../types/ModalProps.tsx";
import InventoryModal from "../../../components/inventory/InventoryModal.tsx";


const columns: TableColumn<any>[] = [
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'storageName', label: '창고명' },
    { key: 'logisticSno', label: '수량' },
];

const ModalColumns: MColumn[] = [
    {key: 'logisticDate',        label: '일자'},
    {key: 'productName',         label: '품목명'},
    {key: 'incoming',            label: '입고수량'},
    {key: 'productPrice',        label: '개별가격'},
    {key: 'totallogisticsPrice', label: '합계'},
];

const LogisticsTeam = () => {

    const [modalMode, setModalMode] = useState('');
    const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);
    const {data, refetch} = useGetInbounds("", 0, 20);
    const {  mutate } = useGetInboundsInfo()

    return (
        <div className="logisticsTeam-Wrapper">
            <TeamLayout
                title="입고현황"
                linkTo="/inventory/inbounds"
                onRefresh={() => void refetch()}
            >
            <Table
                items={data?.content ?? []}
                idKey="logisticsId"
                columns={columns}
                className="mainPage-Table logisticsTeam"
                wrapperStyle={{overflowX: "auto"}}
                onRowClick={(item: any) => {
                    mutate(item.logisticsOrderNum, {
                        onSuccess: (data) => {
                            setInfo(data);
                            setModalMode('INFO');
                        }
                    });
                }}
            />
                {modalMode !== '' && (
                    <div className="modal-Overlay">
                        {modalMode === 'INFO' && info != null && (
                            <InventoryModal
                                items={info.content}
                                onClose={() => setModalMode('')}
                                title="입고현황"
                                maxPage={info.totalPages}
                                columns={ModalColumns}
                                keySno="logisticSno"
                                keyPrice="productPrice"
                                keytype="logisticsType"
                            />
                        )}
                    </div>
                )}
            </TeamLayout>
        </div>
    );
};
export default LogisticsTeam;