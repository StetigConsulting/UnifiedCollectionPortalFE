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

export const downloadBillingReport = async (payload, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/billing-report/download/${type}`, payload,
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

export const getAgencyWalletHistory = async (data: any, user_id: number) => {
    try {
        const response = await api.post('/v1/common-reports/agency-wallet-history-report/fetch', data, {
            headers: {
                "user-id": user_id,
            }
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
};

export const downloadAgencyWalletReport = async (payload: any, type: any, user_id: number) => {
    try {
        const response = await api.post(`/v1/common-reports/agency-wallet-history-report/download/${type}`, payload,
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

export const downloadSlipAgentBankDeposit = async (data: any) => {
    try {
        const response = await api.get(`/v1/agent-bank-deposits/download/deposit-slip/${data}`, {
            headers: {
                "Content-Type": "application/json",
            },
            responseType: "blob",
        });
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getDailyNonEnergyCollectionReport = async (data: any) => {
    try {
        const response = await api.post('/v1/non-energy-reports/daily-collection-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadDailyNonEnergyCollectionReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/non-energy-reports/daily-collection-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getDailyEnergyCollectionReport = async (data: any) => {
    try {
        const response = await api.post('/v1/energy-reports/daily-collection-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadDailyEnergyCollectionReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/daily-collection-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getDeniedEnergyConsumerReport = async (data: any) => {
    try {
        const response = await api.post('/v1/energy-reports/denied-consumers-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadDeniedEnergyConsumerReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/denied-consumers-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getDeniedNonEnergyConsumerReport = async (data: any) => {
    try {
        const response = await api.post('/v1/non-energy-reports/denied-consumers-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadDeniedNonEnergyConsumerReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/non-energy-reports/denied-consumers-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const energyCollectionSummaryReport = async (data: any) => {
    try {
        const response = await api.post('/v1/energy-reports/collection-summary-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadEnergyCollectionSummaryReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/collection-summary-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const nonEnergyCollectionSummaryReport = async (data: any) => {
    try {
        const response = await api.post('/v1/non-energy-reports/collection-summary-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadNonEnergyCollectionSummaryReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/non-energy-reports/collection-summary-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getAgentSummaryReport = async (report: any, data: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/${report}/fetch`, data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadAgentSummaryReport = async (report: any, data: any, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/${report}/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getAgentAttendance = async (data: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/agent-attendance-report/fetch`, data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadAgentAttendance = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/agent-attendance-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getCancelledTransactions = async (data: any) => {
    try {
        const response = await api.post('/v1/energy-reports/cancel-receipt-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadCancelledTransactions = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/energy-reports/cancel-receipt-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getAgentDetailsReport = async (data: any) => {
    try {
        const response = await api.post('/v1/common-reports/agent-details-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadAgentDetailsReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/common-reports/agent-details-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getAgentLoginReport = async (data: any) => {
    try {
        const response = await api.post('/v1/common-reports/agent-login-history/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadAgentLoginReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/common-reports/agent-login-history/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getTotalCollectionReport = async (data: any) => {
    try {
        const response = await api.post('/v1/common-reports/total-collection-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadTotalCollectionReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/common-reports/total-collection-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getCollectionPostingReport = async (data: any) => {
    try {
        const response = await api.post('/v1/common-reports/collection-posting-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadCollectionPostingReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/common-reports/collection-posting-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}

export const getReconciliationReport = async (data: any) => {
    try {
        const response = await api.post('/v1/common-reports/reconciliation-report/fetch', data);
        return response.data;
    } catch (error) {
        throw error?.response?.data
    }
}

export const downloadReconciliationReport = async (data: any, type: any) => {
    try {
        const response = await api.post(`/v1/common-reports/reconciliation-report/download/${type}`, data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob",
            }
        );
        return response;
    } catch (error) {
        throw error?.response?.data
    }
}