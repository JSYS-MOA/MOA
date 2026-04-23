import { useState, useEffect } from 'react';
import {baseConfigs} from "../../types/baseConfigs.tsx";
import Table from "../inventory/InventoryTable.tsx";
import BaseModal from "./BaseModal.tsx";
import Button from "../Button.tsx";


interface BaseManagerProps {
    apiType: string;
}

const BaseManager = ({ apiType }: BaseManagerProps) => {

    const config = apiType in baseConfigs
        ? baseConfigs[apiType as keyof typeof baseConfigs]
        : null;

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 선택 아이디
    const [selectedIds, setSelectedIds] = useState<any[]>([]);

    // 모달 제어 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const fetchData = async () => {
        if (!config) return;
        setLoading(true);
        try {
            const data = await getBaseData(apiType);

            console.log("🔥 들어온 데이터:", data);
            const item = Array.isArray(data) ? data : (data.content || []);
            setItems(item);
        } catch (err) {
            console.error(`${config.title} 데이터 로드 실패:`, err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // 4. 메뉴(type)가 바뀔 때마다 실행
    useEffect(() => {
        setItems([]); // 메뉴 이동 시 이전 데이터 잔상 제거
        fetchData();
    }, [apiType]);

    // 잘못된 경로 접근 시 처리
    if (!config) {
        return <div>존재하지 않는 관리 페이지입니다.</div>;
    }

    // 체크박스 핸들러
    const handleCheck = (idOrIds: any, isChecked: boolean, isAll: boolean) => {
        if (isAll) {
            // 전체 선택/해제일 때
            setSelectedIds(isChecked ? idOrIds : []);
        } else {
            // 개별 선택/해제일 때
            if (isChecked) {
                setSelectedIds((prev) => [...prev, idOrIds]);
            } else {
                setSelectedIds((prev) => prev.filter((id) => id !== idOrIds));
            }
        }
    };
    // 등록 버튼 (데이터 없음)
    const handleInsertOpen = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    // 코드 클릭-수정 (데이터 있음)
    const handleEditOpen = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // 삭제
    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        // 삭제 로직 (체크박스 선택된 ID들 처리 필요)
        console.log("삭제 프로세스 시작");
    };



    return (
        <div>
            <div>
                <h1>{config.title} 리스트</h1>

                {/* 테이블 영역 */}
                {loading ? (
                    <span>데이터를 불러오는 중입니다...</span>
                ) : (
                    <Table
                        items={items}
                        columns={config.columns.map(col => ({
                            ...col,
                            render: (val: any, item: any) =>
                                // 특정 컬럼 클릭 시 모달 열리게 렌더링 주입
                                col.key.toLowerCase().includes('code') ? (
                                    <span onClick={() => handleEditOpen(item)} style={{cursor:'pointer', textDecoration:'underline'}}>
                                        {val}
                                    </span>
                                ) : (col.render ? col.render(val, item) : val)
                        }))}
                        showCheckbox={true}
                        selectedIds={selectedIds}
                        onCheck={handleCheck}
                    />
                )}
            </div>
            <div>
                <Button label="등록" onClick={handleInsertOpen} />
                <Button label="삭제" onClick={handleDelete} />
            </div>
            <BaseModal
                title={config.title}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedItem} // 있으면 수정, 없으면 등록
                columns={config.columns}
            />
        </div>
    );
};

export default BaseManager;