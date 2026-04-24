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

// 결재 상보정보

// 결재 요청

// 미결재 결재 삭제

// 양식 리스트

// 양식 추가

// 양식 삭제

// 양식 수정

// 팀장 결제 내역 조회

// 팀장 결제 내역 상세조회

// 팀장 결제 내역 반려 / 결재 처리

// 팀원 조회

// 인사 평가 추가