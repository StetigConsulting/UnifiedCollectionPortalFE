import api from "@/lib/axios";
import { ReceiptForPostpaid } from "@/lib/interface";

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

const deleteReceiptForPostpaidById = async (id: number) => {
    try {
        const response = await api.delete(`/v1/business-rules/${id}`);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

export {
    createReceiptForPostpaid, getListOfReceiptForPostpaid, deleteReceiptForPostpaidById, getReceiptForPostpaidById,
    editReceiptForPostpaid
}