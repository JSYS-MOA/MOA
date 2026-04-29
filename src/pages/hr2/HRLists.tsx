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


    if (!config) {
        return <div>존재하지 않는 메뉴입니다. (입력된 타입: {type})</div>;
    }

    return (
        <div key={type}>
            {/* 상단: 검색 조건 입력 구역 */}
            <Filter
                apiType={configKey}
                onFilter={(params) => setFilterParams(params)}
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