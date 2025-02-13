import api from "@/lib/axios";
import { AddCounterCollector, ExtendAgentValidity, RechargeAgent, UpdateBinder } from "@/lib/interface";

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
        const response = await api.get(`/v1/collector-types/`);
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