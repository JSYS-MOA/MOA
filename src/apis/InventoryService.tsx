import { useQuery , useMutation } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/inventory/";

 // 조회 및 검색
  export function useGetInventory( search?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["admin", search || '' , page , size ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}status`, {   
          params: {
             page : page ,
             size : size ,
            search : search || ''
          }
        });
        return data;
      },
    });
  }

    export function useGetInventoryInfo () {
    return useMutation({
      mutationFn: async (info: number) => {
        const { data } = await axios.get(`${Api_BASE}status/${info}`, {   
          params: {
            //  info : info ,
          }
        });
        return data;
      },
    });
  }

  // export function usePatchRole () {
  // return useMutation({
  //     mutationFn: async ({ userId , roleId }: { userId: number , roleId : number}) => {
  //       const response = await axios.patch(
  //         Api_BASE + `/${userId}`, null , {
  //           params : {
  //             roleId: roleId 
  //           } , withCredentials: true
  //         }
  //       );
  //       return response.data;
  //     },
  //     onSuccess: (data) => {
  //       console.log("수정 성공!" + data );
  //     },
  //     onError: (error: any) => {

  //       console.error("수정 실패:", error.response?.data || error.message);
  //     }
  //   });

  // }