import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // URL에서 type을 가져오기 위함
import axios from 'axios';
import { baseConfigs } from '../configs/baseConfigs';
import Table from './Table';

const BaseManager = () => {
    // 1. 주소창의 /:type 부분을 읽어옵니다 (예: /department -> type은 "department")
    const { type } = useParams<{ type: string }>();

    // 2. 만약 잘못된 경로로 들어오면 에러 방지
    const config = type ? baseConfigs[type] : null;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 3. 데이터 가져오기 로직
    const fetchData = async () => {
        if (!config) return;
        setLoading(true);
        try {
            const res = await axios.get(config.apiUrl);
            setItems(res.data);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 4. 페이지(type)가 바뀔 때마다 데이터를 새로 부름
    useEffect(() => {
        fetchData();
    }, [type]);

    if (!config) return <div>존재하지 않는 페이지입니다.</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{config.title} 관리</h1>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => alert(`${config.title} 등록 모달 로직 필요`)}
                >
                    {config.title} 등록
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">로딩 중...</div>
            ) : (
                /* 5. 뫄뫄님이 고생한 그 'columns' 설정을 그대로 전달! */
                <Table
                    items={items}
                    columns={config.columns}
                />
            )}
        </div>
    );
};

export default BaseManager;