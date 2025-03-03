import api from "@/lib/axios";

export const getRosourceByDiscomId = async (id: number) => {
    try {
        const response = await api.get(`/v1/resources/${id}`)
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const getAllBankList = async () => {
    try {
        const response = await api.get(`/v1/banks/`);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getUserDetails = async () => {
    try {
        const response = await api.get(`/v1/tp-users/user-info`);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}