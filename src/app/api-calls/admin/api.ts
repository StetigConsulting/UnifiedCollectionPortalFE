import api from "@/lib/axios";
import { CreateColorCodingBillBasis, CreateColorCodingLogic, ECLFlaggedCustomerRule, ReceiptForPostpaid } from "@/lib/interface";

const createReceiptForPostpaid = async (data: ReceiptForPostpaid) => {
    try {
        const response = await api.post('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const editReceiptForPostpaid = async (data: ReceiptForPostpaid) => {
    try {
        const response = await api.put('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const getListOfReceiptForPostpaid = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/RECEIPT_FOR_POSTPAID`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const getReceiptForPostpaidById = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const deleteBusinessRule = async (id: number) => {
    try {
        const response = await api.delete(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const createColorCodingLogic = async (data: CreateColorCodingLogic) => {
    try {
        const response = await api.post('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const updateColorCodingLogic = async (data: CreateColorCodingLogic) => {
    try {
        const response = await api.put('/v1/business-rules/', data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const getColorCodingLogic = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/PAYMENT_STATUS_COLOR_CODING`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const getColorCodingBillBasis = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/BILL_BASIS_COLOR_CODING`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const getColorCodingEclFlag = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/discom/${id}/rule-name/ECL_FLAGGED_CUSTOMER_COLOR_CODING`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};


const createColorCodingBillBasis = async (data: CreateColorCodingBillBasis) => {
    try {
        const response = await api.post(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const updateColorCodingBillBasis = async (data: CreateColorCodingBillBasis) => {
    try {
        const response = await api.put(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const createColorCodingEcl = async (data: ECLFlaggedCustomerRule) => {
    try {
        const response = await api.post(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const updateColorCodingEcl = async (data: ECLFlaggedCustomerRule) => {
    try {
        const response = await api.put(`/v1/business-rules/`, data);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

const getBusinessRuleDateById = async (id: string) => {
    try {
        const response = await api.get(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
}

export {
    createReceiptForPostpaid, getListOfReceiptForPostpaid, deleteBusinessRule, getReceiptForPostpaidById,
    editReceiptForPostpaid, createColorCodingLogic, getColorCodingBillBasis, createColorCodingBillBasis, getColorCodingLogic,
    createColorCodingEcl, getColorCodingEclFlag, getBusinessRuleDateById, updateColorCodingEcl, updateColorCodingBillBasis, updateColorCodingLogic
}