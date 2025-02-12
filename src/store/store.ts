import { create } from "zustand";

export interface UserData {
    id: string;
    mobileNumber: string;
    name: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
    discomId: number;
    roleId: number;
    userRole?: string;
    userScopes?: string[];
}

interface UserStore {
    userData: UserData | null;
    setUserData: (data: UserData) => void;
    clearUserData: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    userData: null,
    setUserData: (data) => set({ userData: data }),
    clearUserData: () => set({ userData: null }),
}));
