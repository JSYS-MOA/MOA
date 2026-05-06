import {useEffect, useState} from "react";

import {hr2Configs} from "../../types/hr2Configs.tsx";

import Table from "../Table.tsx";

import HRModal from "./HRModal.tsx";

import {deleteHr2Data} from "../../apis/hr2/Hr2Service.tsx";
import useHR2Data from "./useHR2Data.tsx";
import {FaStar} from "react-icons/fa";



interface Hr2Props {

    apiType: keyof typeof hr2Configs;
    filterParams: any; // 부모로부터 전달받는 검색 조건
}



const HRList = ({ apiType,filterParams }: Hr2Props) => {

    const config = hr2Configs[apiType];

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // 데이터 조회
    const {fetchData, items, loading, setLoading, selectedIds, setSelectedIds, page, setPage, totalPages} = useHR2Data(apiType, filterParams);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


// 체크박스 핸들러

    const handleCheck = (idOrIds: any, checked: boolean, isAll?: boolean) => {

        if (isAll) {

            setSelectedIds(checked ? idOrIds : []);

        } else {

            setSelectedIds(prev =>

                checked ? [...prev, idOrIds] : prev.filter(id => id !== idOrIds)

            );

        }

    };



    const handleEditOpen = (item: any) => {
        setSelectedItem(item);
        setModalOpen(true);
    };


    const handleInsert = () => {
        setSelectedItem(null); // 수정이 아니므로 기존 데이터를 비움
        setModalOpen(true);    // 모달 오픈
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm("삭제하시겠습니까?")) return;

        setLoading(true);
        try {
            for (const id of selectedIds) {
                await deleteHr2Data(apiType, id);
            }

            setSelectedIds([]);
            await fetchData(); // 재조회
        } finally {
            setLoading(false);
        }
    };




    if (!config) return <div>페이지 정보를 찾을 수 없습니다.</div>;

    return (
    <>
        <div className="favorite-Header">
            <FaStar size={18} color="#C4C4C4"/>
            <span>{(config as any).title}리스트</span>
        </div>
        <Table
            idKey={(config as any).idKey}
            items={items}
            columns={config.columns.map(col => ({
                ...col,
                render: (val: any, item: any) => {
                    // 1. 기존 config에 설정된 render(예: renderVacationDays)가 있다면 먼저 실행
                    const renderedValue = (col as any).render ? (col as any).render(val, item) : val;

                    // 2. clickable 설정이 되어 있다면 span으로 감싸고, 아니면 그냥 값 반환
                    if ((col as { clickable?: boolean }).clickable) {
                        return (
                            <span
                                onClick={() => handleEditOpen(item)}
                                style={{ cursor: 'pointer', color: 'var(--text-accent)', textDecoration: 'underline' }}
                            >
                        {renderedValue}
                    </span>
                        );
                    }

                    return renderedValue;
                }
            }))}
            showCheckbox={true}
            selectedIds={selectedIds}
            onCheck={handleCheck}
        />
        {((config as any).fields?.length && (config as any).hasCrud) ?(
            <div className="btn-Wrap" style={{marginTop:"12px"}}>
                <button onClick={handleInsert} disabled={loading}  className="btn-Primary">신규</button>
                <button onClick={handleDelete} disabled={loading}  className="btn-Secondary">삭제</button>
            </div>
        ) : (
            <></>
        )}

        <div className="Page-Btn-container" >
            <button
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
            >
                이전
            </button>

            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={`${apiType}-${i}`}
                    onClick={() => setPage(i)}
                    style={{ fontWeight: page === i ? 'bold' : 'normal', color: page === i ? 'var(--text-accent)' : 'black' }}
                >
                    {i + 1}
                </button>
            ))}

            <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
            >
                다음
            </button>
        </div>


        {isModalOpen && (
            <HRModal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedItem(null); // 닫을 때 선택 아이템 초기화
                }}
                apiType={apiType}
                baseData={selectedItem}
                fetchData={fetchData}    // 새로고침 함수 전달
            />
        )}
    </>
);
}

export default HRList;