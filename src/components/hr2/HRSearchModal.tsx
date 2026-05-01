import { useState } from "react";
import {getAllowanceData, getUserData} from "../../apis/hr2/Hr2Service.tsx";
import {hr2Configs} from "../../types/hr2Configs.tsx";

interface SearchModalProps {
    searchType: "user" | "allowance";
    onSelect: (data: any) => void;
    onClose: () => void;
}

const HRSearchModal = ({ searchType, onSelect, onClose }: SearchModalProps) => {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const autoData = async ()=>{
        let getData:any =null;
        if(searchType as keyof typeof hr2Configs=="user"){
            getData = await getUserData(searchType as keyof typeof hr2Configs, keyword);

            return getData;
        }else if(searchType as keyof typeof hr2Configs=="allowance"){
            getData = await getAllowanceData(searchType as keyof typeof hr2Configs, keyword);
            return getData;
        }
        return getData;
    }

    const handleSearch = async() => {
        const data = await autoData();

        if (data) {
            setResults([data]);
        } else {
            setResults([]);
        }
    };

    return (
        <div>
            <div>
                <h3>{searchType === "user" ? "사원 검색" : "수당 검색"}</h3>

                <div>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="검색어 입력..."
                    />
                    <button onClick={handleSearch}>검색</button>
                </div>

                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>{searchType === "user" ? "성명" : "수당명"}</th>
                            <th>{searchType === "user" ? "사원번호" : "수당코드"}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.length > 0 ? (
                            results.map((item, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onSelect(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{searchType === "user" ? item.userName : item.allowanceName}</td>
                                <td>{searchType === "user" ? item.employeeId : item.allowanceCord}</td>
                            </tr>
                        ))) : (
                            <tr>
                                <td colSpan={2}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div>
                    <button onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

export default HRSearchModal;