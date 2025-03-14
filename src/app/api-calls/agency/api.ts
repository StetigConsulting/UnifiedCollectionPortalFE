import api from "@/lib/axios";
import { AddAgentBankDeposit, AddCounterCollector, EditCollector, ExtendAgentValidity, RechargeAgent, UpdateBinder } from "@/lib/interface";
import { getSession } from "next-auth/react";

export const createCounterCollector = async (data: AddCounterCollector, user_id: number) => {
    try {
        const response = await api.post('/v1/agents/', data, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error: any) {

        throw error?.response?.data
    }
};

export const getAllAgentByAgencyId = async (id: number) => {
    try {
        const response = await api.get(`/v1/agents/agency/${id}`);
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const activateAgentById = async (id: number, user_id: number) => {
    try {
        const response = await api.put(`/v1/agents/activate`, { agent_id: id }, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const deactivateAgentById = async (id: number, user_id: number) => {
    try {
        const response = await api.put(`/v1/agents/deactivate`, { agent_id: id }, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const rechargeAgentById = async (data: RechargeAgent, user_id: number) => {
    try {
        const response = await api.put(`/v1/agents/recharge-wallet`, data, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const getRechargeableBalance = async (id: number) => {
    try {
        const response = await api.get(`/v1/agents/display-balance/${id}`);
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const extendAgentValidityById = async (data: ExtendAgentValidity, user_id: number) => {
    try {
        const response = await api.put(`/v1/agents/extend-validity`, data, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const getCollectorTypes = async () => {
    try {
        const session = await getSession()
        const response = await api.get(`/v1/collector-types/discom/${session?.user?.discomId}`);
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const getListOfAvailableBindersByAgentId = async (id: number) => {
    try {
        const response = await api.get(`/v1/agent-pseudo-office-structure-mapping/agent/${id}`);
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const updateListOfBinder = async (data: UpdateBinder) => {
    try {
        const response = await api.post(`/v1/agent-pseudo-office-structure-mapping/`, data);
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const editCollectorData = async (data: EditCollector, user_id: number) => {
    try {
        const response = await api.put(`/v1/agents/`, data, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const uploadAgentBankDepositSlip = async (file: FormData) => {
    try {
        const response = await api.post(`/v1/agent-bank-deposits/upload`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}

export const addAgentBankDeposit = async (data: AddAgentBankDeposit) => {
    try {
        const response = await api.post(`/v1/agent-bank-deposits/`, data);
        return response.data;
    } catch (error) {

        throw error?.response?.data
    }
}