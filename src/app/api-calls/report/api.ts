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

export const getAgentWalletHistory = async (data: any, user_id: number) => {
    try {
        const response = await api.post('/v1/common-reports/agent-wallet-history-report/fetch', data, {
            headers: {
                "user-id": user_id,
            }
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
};

export const downloadAgentWalletReport = async (payload: any, type: any, user_id: number) => {
    try {
        const response = await api.post(`/v1/common-reports/agent-wallet-history-report/download/${type}`, payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    'user-id': user_id
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data
    }
};

export const getDepositAcknowledgementReport = async (data: any) => {
    try {
        const response = await api.post('/v1/agent-deposit-acknowledgements/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getAgentBankDepositReport = async (data: any) => {
    try {
        const response = await api.post('/v1/agent-bank-deposits/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}