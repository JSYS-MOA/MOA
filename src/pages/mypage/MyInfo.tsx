import {useQuery} from "@tanstack/react-query";
import type {MyPageInfo} from "../../types/myPageInfo.ts";
import {getMyInfoApi} from "../../apis/MyPageService.tsx";
import {FaStar} from "react-icons/fa";
import "../../assets/styles/mypage/myInfo.css";

const MyInfo = () => {

    const {data:myInfo} = useQuery<MyPageInfo>({
        queryKey:["myInfo"],
        queryFn:getMyInfoApi,
    })
    return(
        <>
            <div className="favorite-Header">
                <FaStar size={18} color="#C4C4C4"/>
                <span>내 정보 관리</span>
            </div>
            <div className="myInfo-Section">
                <div className="myInfo-Section-Header">
                    <p>기본정보</p>
                </div>
                <table className="myInfo-Table">
                    <tbody>
                    <tr>
                        <th>이름</th>
                        <td>{myInfo?.userName}</td>
                        <th>사원번호</th>
                        <td>{myInfo?.employeeId}</td>
                        <th>부서</th>
                        <td>{myInfo?.departmentName}</td>
                    </tr>
                    <tr>
                        <th>직급</th>
                        <td>{myInfo?.gradeName}</td>
                        <th>전화번호</th>
                        <td>{myInfo?.phone}</td>
                        <th>나이</th>
                        <td>{myInfo?.age}세</td>
                    </tr>
                    <tr>
                        <th>입사일</th>
                        <td>{myInfo?.startDate}</td>
                        <th>주민등록번호</th>
                        <td>{myInfo?.residentNumber}</td>
                        <th>이메일</th>
                        <td>{myInfo?.email}</td>
                    </tr>
                    <tr>
                        <th>주소</th>
                        <td colSpan={5}>{myInfo?.address}</td>
                    </tr>
                    </tbody>
                </table>
                <div className="myInfo-Section-Header" style={{marginTop:"21px"}}>
                    <p>계좌정보</p>
                </div>
                <table className="myInfo-Table">
                    <tbody>
                    <tr>
                        <th>예금주</th>
                        <td>{myInfo?.userName}</td>
                        <th>계좌번호</th>
                        <td>{myInfo?.accountNum}</td>
                        <th>은행</th>
                        <td>{myInfo?.bank}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default MyInfo;