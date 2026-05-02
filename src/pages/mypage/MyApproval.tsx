import type {Column} from "../../types/TableProps.tsx";
import type {MColumn} from "../../types/ModalProps.tsx";
import {useState} from "react";
import type {ModalProps} from "../../types/ModalProps.tsx";
import {useGetApprovaInfo, useGetApprovaUserList} from "../../apis/ApprovalsService.tsx";
import {useAuthStore} from "../../stores/useAuthStore.tsx";
import Table from "../../components/approvals/ApprovalsTable.tsx";
import Modal from "../../components/approvals/ApprovalsModal.tsx";
import Alert from "../../components/inventory/Alert.tsx";
import {FaStar} from "react-icons/fa";

const MyApproval = () => {

    const {user} = useAuthStore();
    const [modalMode, setModalMode] = useState('');
    const [info, setInfo] = useState<{content: ModalProps[], totalPages: number} | null>(null);
    const [onAlert, setOnAlert] = useState('');

    const {mutate} = useGetApprovaInfo();
    const {data, refetch: refetchList} = useGetApprovaUserList(user?.userId ?? 0, "", 0, 10);
    console.log("user:", user);
    console.log("data:", data);
    const onApprovaUserClick = (item: any) => {
        if ('approvaId' in item) {
            mutate(item.approvaId, {
                onSuccess: (data) => {
                    setInfo(data);
                    setModalMode('LIST');
                    console.log("ApprovaUser 성공 데이터:", data.content);
                },
                onError: (error: any) => {
                    setOnAlert(error + "정보를 가져오는데 실패했습니다.");
                }
            });
        }
    };

    const columns: Column[] = [
        {key: 'approvaDate',           label: '일자'},
        {key: 'approvaKind',           label: '문서번호'},
        {key: 'approvaTitle',          label: '결재명'},
        {key: 'approverInfo.userName', label: '결재자'},
        {key: 'approvaStatus',         label: '결재상태'},
        {key: 'approvaMemu',           label: '비고'},
        {key: 'approvaInfo',           label: '결재'},
    ];

    const ModalColumns: MColumn[] = [
        {key: 'approvaDate',           label: '일자'},
        {key: 'approvaTitle',          label: '제목'},
        {key: 'writerInfo.userName',   label: '기안자'},
        {key: 'approverInfo.userName', label: '결재자'},
        {key: 'approvaStatus',         label: '결재상태'},
        {key: 'approvaContent',        label: '내용'},
        {key: 'approvaMemu',           label: '비고'},
    ];

    return (
        <div>
            {data != null ? (<>
                    <div className="favorite-Header">
                        <FaStar size={18} color="#C4C4C4"/>
                        <span>결재신청</span>
                    </div>
                    <Table
                        items={data.content}
                        columns={columns}
                        page={0}
                        onItemClick={onApprovaUserClick}
                    />
                    {modalMode !== '' && (
                        <div className="modal-Overlay">
                            {modalMode === 'LIST' && info != null && (
                                <Modal
                                    items={info.content}
                                    maxPage={info.totalPages}
                                    columns={ModalColumns}
                                    keytype="approvaStatus"
                                    onClose={() => setModalMode('')}
                                    onRefresh={refetchList}
                                    setOnAlert={setOnAlert}
                                />
                            )}
                        </div>
                    )}
                </>
            ) : "로딩중입니다."}
            {onAlert !== '' && (
                <Alert onClose={() => setOnAlert('')}>{onAlert}</Alert>
            )}
        </div>
    );
};

export default MyApproval;