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
        });
        return data;
      },
    });
  }

  // 구매현황
  export function useGetOrder( search?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["order", search || '' , page , size ], 
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
        });
        return data;
      },
    });
  }

  // 발주수정 
    export function usePutOrderSno () {
    return useMutation({
      mutationFn: async ({ orderFormId, items }: { orderFormId: number, items: any[] }) => {
        const { data } = await axios.put(`${Api_BASE}orders/${orderFormId}`,  
          items 
        );
        return data;
      },
    });
  }

  // 선택용 물품 리스트
    export function useGetProductSelect( ProductCord?: string ) {
    return useQuery({
      queryKey: ["productCord", ProductCord ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}orders/select/product`, {   
          params: {
            ProductCord : ProductCord 
          }
        });
        return data;
      },
    });
  }

