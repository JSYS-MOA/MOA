import { useQuery , useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/";

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

/* GET - 인사카드 목록 조회 */
export function getuseHrCardList() {
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

/* GET - 인사카드 상세 조회 */
export function getuseHrCardInfo(userId: number) {
    return useQuery({
        queryKey: ["hrCardInfo", userId],
        queryFn: async () => {
            const res = await axios.get(`${Api_BASE}/${userId}`, {
                withCredentials: true,
            });
            return res.data;
        },
        enabled: !!userId,
    });
}

/* POST - 인사카드 등록 */
export function postuseHrCardAdd() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const res = await axios.post(Api_BASE, data, {
                withCredentials: true,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
        },
    });
}

/* PUT - 인사카드 수정 */
export function putuseHrCardUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               userId,
                               updateData,
                           }: {
            userId: number;
            updateData: any;
        }) => {
            const res = await axios.put(`${Api_BASE}/${userId}`, updateData, {
                withCredentials: true,
            });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
            queryClient.invalidateQueries({
                queryKey: ["hrCardInfo", variables.userId],
            });
        },
    });
}

/*  DELETE - 인사카드 삭제 */
export function deleteuseHrCardDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: number) => {
            const res = await axios.delete(`${Api_BASE}/${userId}`, {
                withCredentials: true,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
        },
    });
}

