import {Navigate, Route, Routes} from "react-router";
import BaseManager from "../components/base/BaseManager.tsx";

const Base = () => {
    return (
        <div>
            <Routes>
                {/* 1. /base/allowance, /base/department 등을 다 BaseManager가 처리함 */}
                <Route path="/:type" element={<BaseManager />} />

                {/* 2. 아무 값 없이 /base 로만 들어왔을 때 기본으로 보여줄 페이지 (선택) */}
                <Route path="/" element={<Navigate to="department" replace />} />
            </Routes>
        </div>
    );
};

export default Base;