import { create } from "zustand";
import "../types/auth.ts";
import type {User} from "../types/auth.ts";

// zustand 스토어 안에 뭐가 들어있는지 미리 정의해두는 것
type AuthState = {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    login: (userData) => set({ user: userData }),
    logout: () => set({ user: null })
}));
//
// export const useAuthStore = create<any>()(
//   persist(
//     (set) => ({
//       user : null,
//       login  : (userData:any) => set({ user : userData}),
//       logout : () => set( {user : null} )
//     }),
//
//     {
//       name: "auth-storage",
//     }
//   )
// );

