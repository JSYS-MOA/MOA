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

    export function useGetDefect( search?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["defect", search || '' , page , size ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}disposals`, {   
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

    export function useGetDefectInfo () {
    return useMutation({
      mutationFn: async (info: number) => {
        const { data } = await axios.get(`${Api_BASE}disposals/${info}`, {   
          params: {
            //  info : info ,
          }
        });
        return data;
      },
    });
  }

