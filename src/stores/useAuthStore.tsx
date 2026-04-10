import { create } from "zustand";
import { persist } from "zustand/middleware"; // 로컬 스토리지랑 같은거


export const useAuthStore = create<any>()(
  persist(
    (set) => ({
      user : null,
      login  : (userData:any) => set({ user : userData}),
      logout : () => set( {user : null} )
    }),

    {
      name: "auth-storage", 
    }
  )
);

