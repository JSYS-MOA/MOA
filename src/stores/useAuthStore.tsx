import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import "../types/auth.ts";
import type {User} from "../types/auth.ts";

// zustand 스토어 안에 뭐가 들어있는지 미리 정의해두는 것
interface AuthState {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            login: (userData) => set({ user: userData }),
            logout: () => set({ user: null }),
        }),
        {
            name: "moa-auth",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ user: state.user }),
        }
    )
);
