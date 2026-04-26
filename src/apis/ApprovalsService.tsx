import { useQuery , useMutation } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/gw/";

// 내 결재내역 조회
  export function useGetApprovaUserList(  writer : number , search?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["ApprovaUser",  writer ,search || '' , page , size ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}approvals`, {   
          params: {
            writer : writer,
            page : page ,
            size : size ,
            search : search || ''
          }
        });
        return data;
      },
    });
  }

// 결재 상제정보 및 팀장 결제 내역 상세조회 
 export function useGetApprovaInfo () {
    return useMutation({
      mutationFn: async (  approvaId: number ) => {
        const { data } = await axios.get(`${Api_BASE}approvals/${approvaId}`, {   
        });
        return data;
      },
    });
  }


// 결재 요청 post /api/gw/approvals

// 미결재 결재 삭제 DELETE /api/gw/approvals/{approva_id}

// 팀장 결제 내역 조회 GET /api/gw/approvalWait
// 팀장 결제 내역 반려 / 결재 처리 PATCH /api/gw/approvalAct/{approva_id}

// 팀원 조회  GET /api/gw/teamMembers
// 팀원 상세 조회  GET /api/gw/teamMembers/{department_id} <= {user_id} 유저로 변경
// 인사 평가 추가 PUT /api/gw/teamMembers/{user_id}

// 결재 문서 양식 리스트 양식 추가 ,양식 삭제, 양식 수정 <= 윤아님이 만든 기본사항 > 그룹웨어 >  공통양식 리스트로 이동시키기