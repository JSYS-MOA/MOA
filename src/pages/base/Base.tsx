import {useParams} from "react-router-dom";
import BaseManager from "./BaseManager.tsx";
import {baseConfigs} from "../../types/baseConfigs.tsx";

const Base = ({ apiType }: { apiType?: string }) => {
    const { type } = useParams<{ type: string }>();

    // 1. 우선순위 결정
    const currentType = apiType || type;

    // 2. 직접적인 키(currentType)가 baseConfigs에 존재하는지 확인
    if (currentType && currentType in baseConfigs) {
        return <BaseManager apiType={currentType as keyof typeof baseConfigs} />;
    }

    // 3. 키로 찾지 못했을 경우, apiUrl의 끝부분과 type이 일치하는 설정 검색
    const configKeyFromUrl = type
        ? (Object.keys(baseConfigs).find(key =>
            baseConfigs[key as keyof typeof baseConfigs].apiUrl.endsWith(`/${type}`)
        ) as keyof typeof baseConfigs)
        : undefined;

    if (configKeyFromUrl) {
        return <BaseManager apiType={configKeyFromUrl} />;
    }

    // 4. 어떤 경로도 매칭되지 않으면 아무것도 렌더링하지 않음 (오류 메시지 대신 null)
    return null;
};

export default Base;