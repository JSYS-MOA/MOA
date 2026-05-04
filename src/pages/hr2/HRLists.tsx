import HRList from "../../components/hr2/HRList.tsx";
import Filter from "../../components/hr2/Filter.tsx";
import {useParams} from "react-router-dom";
import {hr2Configs} from "../../types/hr2Configs.tsx";
import {useState} from "react";

const HRLists = () => {

    const { type } = useParams<{ type: string }>();
    const configKey = type as keyof typeof hr2Configs;
    const config = hr2Configs[configKey];
    const [filterParams, setFilterParams] = useState<any>({});

    // 자식에게서 받은 params를 백엔드 규격(FilterDTO)으로 변환하는 함수
    const handleFilter = (params: any) => {
        console.log("1. 자식이 보낸 원본 params:", params);

        // 백엔드 DTO 구조에 딱 맞춰서 재조립
        const refinedParams = {
            startDate: params.startDate || "",
            finishDate: params.finishDate || "",

            departmentId: params.departmentId
                ? (Array.isArray(params.departmentId)
                    ? parseInt(params.departmentId[0]?.id || params.departmentId[0], 10)
                    : parseInt(params.departmentId, 10))
                : null,

            departmentName: params.departmentName || "",

            category: Array.isArray(params.category)
                ? params.category.map((item: any) => item.name || item.id).join(",")
                : (params.category || ""),

            keyword: Array.isArray(params.keyword)
                ? params.keyword.map((item: any) => item.id || item.name).join(",")
                : (params.keyword || ""),
        };

        console.log("백엔드 FilterDTO 규격으로 보정된 params:", refinedParams);

        // 최종 보정된 값을 상태에 저장하여 HRList로 전달
        setFilterParams(refinedParams);
    };

    if (!config) {
        return <div>존재하지 않는 메뉴입니다. (입력된 타입: {type})</div>;
    }

    return (
        <div key={type}>
            {/* 상단: 검색 조건 입력 구역 */}
            <Filter
                apiType={configKey}
                onFilter={handleFilter}
            />

            {/* 하단: 결과 표 및 등록/수정 로직 구역 */}
            <HRList
                apiType={configKey}
                filterParams={filterParams}
            />
        </div>
    );
};

export default HRLists;