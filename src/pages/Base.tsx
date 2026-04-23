import {useParams} from "react-router-dom";
import BaseManager from "../components/base/BaseManager.tsx";
import {baseConfigs} from "../types/baseConfigs.tsx";

const Base = () => {

    const { type } = useParams<{ type: string }>();

    // baseConfig.jsx파일의 apiUrl이 현재 주소창의 type을 포함하고 있는 설정을 찾습니다.
    const configKey = Object.keys(baseConfigs).find(key => {
        const config = baseConfigs[key as keyof typeof baseConfigs];
        // apiUrl이 "/api/base/whse" 라면, "whse"로 끝나는지 확인
        return config.apiUrl.endsWith(`/${type}`);
    });
    //경로오류
    if (!type || !configKey) {
        return (
            <div>
                <h3>존재하지 않는 관리 페이지입니다.</h3>
                <p>입력된 주소: {type || "없음"}</p>
            </div>
        );
    }
    //정상경로
    return <BaseManager apiType={configKey} />;
};

export default Base;