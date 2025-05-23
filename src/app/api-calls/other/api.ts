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

export const getBillingDataUploadHistory = async (data: any) => {
    try {
        const response = await api.get(`/v1/dashboards/bill-upload-history/${data.discom}/${data.date}`);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getDateComparisionData = async (data: any) => {
    try {
        const response = await api.get(`/v1/dashboards/performance-summary/${data}`);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getTransactionSummary = async (data: any) => {
    try {
        const response = await api.get(`/v1/dashboards/transaction-summary/${data.month}/${data.year}`);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getNewsNoticesForUser = async () => {
    try {
        const response = await api.get(`/v1/newsnotice/agency-fetch`);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const addNewsNotice = async (data: any) => {
    try {
        const response = await api.post(`/v1/newsnotice/add`, data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}