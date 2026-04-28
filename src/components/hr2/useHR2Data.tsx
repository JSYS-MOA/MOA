import {useCallback, useState} from "react";
import {getHr2Data} from "../../apis/hr2/Hr2Service.tsx";
import {hr2Configs} from "../../types/hr2Configs.tsx";

const useHR2Data = (apiType: keyof typeof hr2Configs) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<any[]>([]);

    const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const datas = await getHr2Data(apiType, page);

            console.log("서버 응답 확인:", datas);

            if (datas) {
                const total = datas.totalPages ?? datas.totalPage ?? 0;
                setTotalPages(total);
            }
            //Page객체면 content를 넣고 배열이면 그대로 들어감
            const actualList = Array.isArray(datas) ? datas : (datas?.content || []);

            setItems(actualList);
            setSelectedIds([]);

        } finally {
            setLoading(false);
        }
    }, [apiType, page]);

    return {
        items,
        loading,
        setLoading,
        selectedIds,
        setSelectedIds,
        fetchData,
        page,       // 현재 페이지 번호
        setPage,    // 페이지를 바꿀 수 있는 함수
        totalPages  // 총 페이지
    };
};
export default useHR2Data;