import api from "@/lib/axios";

export const getRosourceByDiscomId = async (id: number) => {
    try {
        const response = await api.get(`/v1/resources/${id}`)
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}