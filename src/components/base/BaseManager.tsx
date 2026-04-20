import { useState, useEffect } from 'react';
import {useParams} from "react-router";
import axios from 'axios';
import {baseConfigs} from "../../types/baseConfigs.tsx";
import Table from "../Table.tsx";
import type {TableProps} from "../../types/TableProps.tsx";

const BaseManager = () => {
    // 1. 주소창의 /:type 처리
    const { type } = useParams<{ type: string }>();

    // 2. 타입 가드: config가 실제로 존재하는지 안전하게 체크
    const config = type && type in baseConfigs
        ? baseConfigs[type as keyof typeof baseConfigs]
        : null;

    const [items, setItems] = useState<TableProps[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!config) return;
        setLoading(true);
        try {
            // config.apiUrl을 사용하여 동적으로 호출
            const res = await axios.get(config.apiUrl);
            const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
            setItems(data);
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
    }, [type]);

    // 잘못된 경로 접근 시 처리
    if (!config) {
        return <div>존재하지 않는 관리 페이지입니다.</div>;
    }

    return (
        <div>
            <div>
                <h1>{config.title}</h1>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
                    onClick={() => alert(`${config.title} 등록 모달 로직 필요`)}
                >
                    {config.title} 등록
                </button>
            </div>

            {loading ? (
                <div>
                    <span>데이터를 불러오는 중입니다...</span>
                </div>
            ) : (
                <Table
                    items={items}
                    columns={config.columns}
                />
            )}
        </div>
    );
};

export default BaseManager;