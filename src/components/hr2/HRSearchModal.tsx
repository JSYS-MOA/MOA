import { useState } from "react";

interface SearchModalProps {
    searchType: "user" | "allowance";
    onSelect: (data: any) => void;
    onClose: () => void;
}

const HRSearchModal = ({ searchType, onSelect, onClose }: SearchModalProps) => {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<any[]>([]);

    // 샘플 데이터 (나중에 API 연결)
    const dummyData = {
        user: [
            { userName: "김철수", employeeId: "2024001", deptName: "인사과" },
            { userName: "이영희", employeeId: "2024002", deptName: "개발팀" },
        ],
        allowance: [
            { allowanceName: "식대", allowanceCode: "A01" },
            { allowanceName: "자가운전보조금", allowanceCode: "A02" },
        ]
    };

    const handleSearch = () => {
        // 실제로는 여기서 axios로 데이터를 가져옵니다.
        // const res = await getSearchData(searchType, keyword);
        const filtered = dummyData[searchType].filter(item =>
            Object.values(item).some(val => String(val).includes(keyword))
        );
        setResults(filtered);
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
                        {results.map((item, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onSelect(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{searchType === "user" ? item.userName : item.allowanceName}</td>
                                <td>{searchType === "user" ? item.employeeId : item.allowanceCode}</td>
                            </tr>
                        ))}
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