import api from "@/lib/axios";
import { AddCounterCollector, ExtendAgentValidity, RechargeAgent } from "@/lib/interface";

export const createCounterCollector = async (data: AddCounterCollector, user_id: number) => {
    try {
        const response = await api.post('/v1/agents/', data, {
            headers: {
                "user-id": user_id,
            },
        });
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error?.response?.data
    }
};

export const getAllAgentByAgencyId = async (id: number) => {
    try {
        const response = await api.get(`/v1/agents/agency/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        throw error?.response?.data
    }
}

export const getRechargeableBalance = async (id: number) => {
    try {
        const response = await api.get(`/v1/agents/display-price/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
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
        console.log(error);
        throw error?.response?.data
    }
}