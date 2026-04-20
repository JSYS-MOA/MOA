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

// 상세 조회
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

// 불량페기조회
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

// 불량폐기 상세조회
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

  // 구매현황
  export function useGetOrder( search?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["defect", search || '' , page , size ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}orders`, {   
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

// 구매현황 상세조회
    export function useGetOrderInfo () {
    return useMutation({
      mutationFn: async (info: number) => {
        const { data } = await axios.get(`${Api_BASE}orders/${info}`, {   
          params: {
            //  info : info ,
          }
        });
        return data;
      },
    });
  }

