import {useCallback, useState} from "react";
import {getHr2Data} from "../../apis/hr2/Hr2Service.tsx";
import {hr2Configs} from "../../types/hr2Configs.tsx";

const useHR2Data = (apiType: keyof typeof hr2Configs) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const datas = await getHr2Data(apiType);
            setItems(datas);
            setSelectedIds([]);
        } finally {
            setLoading(false);
        }
    }, [apiType]);

    return {
        items,
        loading,
        setLoading,
        selectedIds,
        setSelectedIds,
        fetchData
    };
};
export default useHR2Data;