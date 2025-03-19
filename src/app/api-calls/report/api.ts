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

export const downloadBillingReport = async (type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/billing-report/download/${type}`, {},
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob", // Ensures binary response
            }
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data
    }
};