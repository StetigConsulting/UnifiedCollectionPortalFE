import api from "@/lib/axios";

export const getBillingReport = async (data: any, user_id: number) => {
    try {
        const response = await api.post('/v1/energy-reports/billing-report/fetch', data, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
};

export const downloadPdfForBillingReport = async (data: any, user_id: number) => {
    try {
        const response = await api.post('/v1/energy-reports/billing-report/download/pdf', {}, {
            headers: {
                "user-id": user_id,
                responseType: 'arraybuffer'
            },
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
};