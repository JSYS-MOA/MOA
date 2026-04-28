import HRList from "../../components/hr2/HRList.tsx";
import Filter from "../../components/hr2/Filter.tsx";
import {useParams} from "react-router-dom";
import {hr2Configs} from "../../types/hr2Configs.tsx";

const HRLists = () => {

    const { type } = useParams<{ type: string }>();

// 대소문자 구분 없이 처리하고 싶다면 .toLowerCase() 등을 활용
    const configKey = type as keyof typeof hr2Configs;
    const config = hr2Configs[configKey];

    if (!config) {
        return <div>존재하지 않는 메뉴입니다. (입력된 타입: {type})</div>;
    }

    // 1. Filter가 변경한 값을 HRList가 알 수 있게 해주는 연결 고리
    //const [searchParams, setSearchParams] = useState({});

    return (
        <>
            {/* 상단: 검색 조건 입력 구역 */}
            <Filter
                //apiType="work"
                //onSearch={(params) => setSearchParams(params)}
            />

            {/* 하단: 결과 표 및 등록/수정 로직 구역 */}
            <HRList
                apiType={configKey}
                //searchParams={searchParams}
            />
        </>
    );
};

export default HRLists;