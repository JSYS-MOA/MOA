import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {} from "./LoginService.tsx"

const Api_BASE = "http://localhost/api/hr/cards";

// 겟 예시
// export function useGetUsers(searchParam: string) {
//   return useQuery({
//     // 1. queryKey에 검색어를 넣어야 검색어가 바뀔 때마다 다시 실행됩니다.
//     queryKey: ["users", searchParam], 
//     queryFn: async () => {
//       // 2. API 호출 시 쿼리 스트링으로 검색어 전달
//       const { data } = await axios.get(`${Api_BASE}users`, {
//         params: { search: searchParam } 
//       });
//       return data;
//     },

//useQuery 자동 실행
//queryKey:[] 캐시 이름 붙이기
//axios.get(Api_BASE) 서버에 get요청
//withCredentials: true 쿠키나 세션 같이 보내기
//res.data 결과값
//queryFn 실제 작동할 코드
//async~await 모든 일이 끝난 후 결과 값 도출
//enabled: !!userId  useQuery와 짝궁 !!을 통해  Boolean으로 변환 ,예시ex)userId가 있을 때만 작동
//useMutation  버튼을 클릭해야만 작동
//useQueryClient 캐시 관리 or 수정
//invalidateQueries 캐시를 취소하고 다시 불러옴
//variables 새로 들어온 값


type HrCardData = {
    user_name: string;
    employee: string;
    employee_id: number;
    phone: string;
    email: string;
    address: string;
    department_id: number;
    grade_id: number;
    performance: string;
    bank: string;
    account_num: string;
};


//1. 인사카드 목록조회

export function useHrcardList() {
    return useQuery({
        queryKey: ["hrCardList"],
        queryFn: async () => {
            const res = await axios.get(Api_BASE, {
                withCredentials: true,
            });
            return res.data;
        },
    });
}

//2. 인사카드 상세 조회

export function useHrCardInfo(userId: number) {
    return useQuery({
        queryKey:["hrCardInfo",userId],
        queryFn: async () => {
            const res = await axios.get(`${Api_BASE}/${userId}`, {
                withCredentials: true,
                });
            return res.data;
        },
        enabled: !!userId,
    })
}

//인사 카드 등록
export  function useHrcardAdd() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async(data: HrCardData) =>{
            const  res = await axios.post(Api_BASE,data, {
               withCredentials: true,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
        },
    });
}

//인사카드 수정
export function useHrcardUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            updateData,
          }: {
            userId: number;
            updateData: Partial<HrCardData>;
        }) => {
            const res = await axios.put(`${Api_BASE}/${userId}`, updateData, {
                withCredentials: true,
            });
            return res.data;
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
            queryClient.invalidateQueries({
                queryKey: ["hrCardInfo", variables.userId]
            });
        },
    });
}

//인사 카드 삭제
export  function useHrcarddelete() {
    const  queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: number) => {
            const res = await axios.delete(`${Api_BASE}/${userId}`, {});
            return res.data;
        },
        onSuccess: async () => {
             await queryClient.invalidateQueries({queryKey: ["hrCardList"] });
        }
    })
}