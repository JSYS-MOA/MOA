import { useQuery , useMutation } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/admin/levels";

 // 조회 및 검색
  export function useGetRole( searchParam?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["search", searchParam || '' , page , size ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}`, {
          // 2. searchParam이 있을 때만 params에 넣어서 보냅니다.      
          params: {
             page : page ,
             size : size ,
            searchParam : searchParam || ''
          }
        });
        return data;
      },
      // 3. (선택사항) 특정 상황에서만 호출하고 싶다면 enabled 옵션을 활용할 수 있습니다.
    });
  }

  export function usePatchRole () {
  return useMutation({
      mutationFn: async ({ id , role }: { id: string , role : string}) => {
        const response = await axios.patch(
          Api_BASE + `/${id}`,
          { roleId: parseInt(role) },
          { withCredentials: true } // credentials: 'include'와 동일한 설정
        );
        return response.data;
      },
      onSuccess: (data) => {
        console.log("수정 성공!" + data );
      },
      onError: (error: any) => {

        console.error("수정 실패:", error.response?.data || error.message);
      }
    });

  }