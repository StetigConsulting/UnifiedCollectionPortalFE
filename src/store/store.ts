import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface UserData {
    id?: string;
    name?: string;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    discomId?: number;
    roleId?: number;
    userRole?: string;
    userScopes?: string[];
}

interface UserStore {
    userData: UserData | null;
    setUserData: (data: UserData) => void;
    clearUserData: () => void;
}

export const useUserStore = create<UserStore>()(
    devtools(
        persist(
            (set) => ({
                userData: null,
                setUserData: (data) => set({ userData: data }, false, "SET_USER_DATA"),
                clearUserData: () => {
                    set({ userData: null }, false, "CLEAR_USER_DATA"),
                        localStorage.removeItem("user-storage")
                }
            }),
            {
                name: "user-storage",
                storage: createJSONStorage(() => localStorage)
            }
        ),
        { name: "UserStore" }
    )
);