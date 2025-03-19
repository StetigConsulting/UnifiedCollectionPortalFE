import api from "@/lib/axios";
import { CollectorIncentiveInterface, CreateColorCodingBillBasis, CreateColorCodingLogic, CreateUserInterface, DeniedToPayInterface, ECLFlaggedCustomerRule, EditCollectorIncentiveInterface, officeStructureLevelInterface, PaymentModeUpdateInterface, ReceiptForPostpaid } from "@/lib/interface";

export const getOfficeStrutureData = async (id: number) => {
    try {
        const response = await api.get(`/office-structure-levels/${id}`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

export const createOfficeStructureLevel = async (data: officeStructureLevelInterface) => {
    try {
        const response = await api.post(`/office-structure-levels/`, data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

export const uploadOfficeStructureLevel = async (file: FormData) => {
    try {
        const response = await api.post(`/office-structures/import`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

const createReceiptForPostpaid = async (data: ReceiptForPostpaid) => {
    try {
        const response = await api.post('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const editReceiptForPostpaid = async (data: ReceiptForPostpaid) => {
    try {
        const response = await api.put('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const getListOfReceiptForPostpaid = async (id: number) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/RECEIPT_FOR_POSTPAID`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const getReceiptForPostpaidById = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const deleteBusinessRule = async (id: number) => {
    try {
        const response = await api.delete(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const createColorCodingLogic = async (data: CreateColorCodingLogic) => {
    try {
        const response = await api.post('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const updateColorCodingLogic = async (data: CreateColorCodingLogic) => {
    try {
        const response = await api.put('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const getColorCodingLogic = async (id: number) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/PAYMENT_STATUS_COLOR_CODING`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const getColorCodingBillBasis = async (id: number) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/BILL_BASIS_COLOR_CODING`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const getColorCodingEclFlag = async (id: number) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/ECL_FLAGGED_CUSTOMER_COLOR_CODING`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};


const createColorCodingBillBasis = async (data: CreateColorCodingBillBasis) => {
    try {
        const response = await api.post(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const updateColorCodingBillBasis = async (data: CreateColorCodingBillBasis) => {
    try {
        const response = await api.put(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const createColorCodingEcl = async (data: ECLFlaggedCustomerRule) => {
    try {
        const response = await api.post(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const updateColorCodingEcl = async (data: ECLFlaggedCustomerRule) => {
    try {
        const response = await api.put(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

const getBusinessRuleDateById = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
}

export const getListOfAllUsers = async () => {
    try {
        const response = await api.get(`/v1/tp-users/`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
}

export const getAllUserRoles = async () => {
    try {
        const response = await api.get(`/v1/user-roles/`);
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
}

export const createUser = async (data: CreateUserInterface) => {
    try {
        const response = await api.post(`/v1/tp-users/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const getDeniedToPayData = async () => {
    try {
        const response = await api.get(`/v1/denied-to-pay-reasons`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const getPaidReason = async () => {
    try {
        const response = await api.get(`/v1/paid-reasons`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const createDeniedToPay = async (data: DeniedToPayInterface) => {
    try {
        const response = await api.post(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const updateDeniedToPay = async (data: DeniedToPayInterface) => {
    try {
        const response = await api.put(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const getListOfAllIncentive = async () => {
    try {
        const response = await api.get(`/v1/paid-reasons`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const fetchDeniedToPayData = async (id: number) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/DENIED_TO_PAY`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
};

export const updatePaymentMode = async (data: any) => {
    try {
        const response = await api.post(`/v1/payment-modes/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const updateNonEnergyType = async (data: any) => {
    try {
        const response = await api.post(`/v1/non-energy-types/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const updateCollectorType = async (data: any) => {
    try {
        const response = await api.post(`/v1/collector-types/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const getAllCollectorIncentive = async () => {
    try {
        const response = await api.get(`/v1/collector-incentive-applicability/`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const getInceniveDetailsById = async (id: string) => {
    try {
        const response = await api.get(`/v1/collector-incentive-applicability/${id}`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const addCollectorIncentive = async (data: CollectorIncentiveInterface) => {
    try {
        const response = await api.post(`/v1/collector-incentive-applicability/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const editCollectorIncentive = async (data: EditCollectorIncentiveInterface) => {
    try {
        const response = await api.put(`/v1/collector-incentive-applicability/`, data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const deleteCollectorIncentive = async (id: number) => {
    try {
        const response = await api.delete(`/v1/collector-incentive-applicability/${id}`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const downloadMinimumPayableAmount = async () => {
    try {
        const response = await api.post(`/v1/consumer-minimum-payable-amounts/export`);
        return response;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const deleteMinimumPayableAmount = async () => {
    try {
        const response = await api.delete(`/v1/consumer-minimum-payable-amounts/`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const uploadMinimumPayableAmount = async (file: FormData) => {
    try {
        const response = await api.post(`/v1/consumer-minimum-payable-amounts/import`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const downloadConsumerToCollector = async () => {
    try {
        const response = await api.post(`/v1/consumer-agent-mappings/export`);
        return response;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const deleteConsumerToCollector = async () => {
    try {
        const response = await api.delete(`/v1/consumer-agent-mappings/`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const uploadConsumerToCollector = async (file: FormData) => {
    try {
        const response = await api.post(`/v1/consumer-agent-mappings/import`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const downloadEclConsumer = async () => {
    try {
        const response = await api.post(`/v1/ecl-consumers/export`);
        return response;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const deleteEclConsumer = async () => {
    try {
        const response = await api.delete(`/v1/ecl-consumers/`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export const uploadEclConsumer = async (file: FormData) => {
    try {
        const response = await api.post(`/v1/ecl-consumers/import`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data
    }
}

export {
    createReceiptForPostpaid, getListOfReceiptForPostpaid, deleteBusinessRule, getReceiptForPostpaidById,
    editReceiptForPostpaid, createColorCodingLogic, getColorCodingBillBasis, createColorCodingBillBasis, getColorCodingLogic,
    createColorCodingEcl, getColorCodingEclFlag, getBusinessRuleDateById, updateColorCodingEcl, updateColorCodingBillBasis, updateColorCodingLogic
}