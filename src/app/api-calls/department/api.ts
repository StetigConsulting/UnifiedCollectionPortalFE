import api from "@/lib/axios";
import { AddAgencyBankDeposit, AgencyBankHistoryPagination, AgencyDataInterface, ChangeCounterCollector, EditAgencyArea, editAgencyInterface, EditAgentRoleArea, extendValidityInterface, rechargeAgencyInterface, ViewHistoryPayload } from "@/lib/interface";
import { getSession } from "next-auth/react";


const getAllPaymentModes = async () => {
  try {
    const session = await getSession();
    const response = await api.get(`/v1/payment-modes/discom/${session?.user?.discomId}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
};

export const getAllCollectionPaymentMode = async () => {
  try {
    const response = await api.get(`/v1/payment-modes/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
};

const getAllNonEnergyTypes = async () => {
  try {
    const session = await getSession();
    const response = await api.get(`/v1/non-energy-types/discom/${session?.user?.discomId}`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const getLevelsDiscomId = async (id: number) => {
  try {
    const response = await api.get(`/office-structures/${id}/next-level`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const getLevels = async (id: number) => {
  try {
    const response = await api.get(`/office-structure-levels/${id}`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const createAgency = async (agencyData: AgencyDataInterface) => {
  try {
    const response = await api.post('/agencies/', agencyData);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const getAgenciesWithDiscom = async (Id: number) => {
  try {
    const response = await api.get(`/agencies/discom/${Id}`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const getAgencyById = async (Id: number | string) => {
  try {
    const response = await api.get(`/agencies/${Id}`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

export const getAgencyRechargeableBalance = async (Id: number) => {
  try {
    const response = await api.get(`/agencies/display-balance/${Id}`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const rechargeAgency = async (agencyData: rechargeAgencyInterface) => {
  try {
    const response = await api.put('/agencies/recharge-wallet', agencyData);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

export const reverseRechargeAgency = async (agencyData: rechargeAgencyInterface) => {
  try {
    const response = await api.put('/agencies/reverse-wallet-balance', agencyData);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const editAgency = async (agencyData: editAgencyInterface) => {
  try {
    const response = await api.put('/agencies/', agencyData);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const activateAgencyAccount = async (agencyData: number) => {
  try {
    const response = await api.put('/agencies/activate', { id: agencyData });
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const deactivateAgencyAccountAPI = async (agencyData: number) => {
  try {
    const response = await api.put('/agencies/deactivate', { id: agencyData });
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const extendValidity = async (agencyData: extendValidityInterface) => {
  try {
    const response = await api.put('/agencies/extend-validity', agencyData);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const getAgentDetailsById = async (data: number) => {
  try {
    const response = await api.get(`/v1/agents/${data}`);
    return response.data;
  } catch (error: any) {

    throw error?.response?.data
  }
};

const changeAgentRole = async (data: ChangeCounterCollector) => {
  try {
    const response = await api.put(`/v1/agents/`, data)
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
}

export const getBalanceHistoryAgencyById = async (data: ViewHistoryPayload) => {
  try {
    const response = await api.post(`/v1/wallet-change-log`, data)
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
}

export const editAgencyAreaById = async (data: EditAgencyArea) => {
  try {
    const response = await api.put(`/agencies/change-area`, data)
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
}

export const getAgentByPhoneNumber = async (phone: number) => {
  try {
    const response = await api.get(`/v1/agents/primary-phone/${phone}`)
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
}

export const updateAgentAreaRole = async (data: EditAgentRoleArea) => {
  try {
    const response = await api.put(`/v1/agents/change-role`, data)
    return response.data;
  } catch (error: any) {
    throw error?.response?.data
  }
}

export const addAgencyBankDeposit = async (data: AddAgencyBankDeposit) => {
  try {
    const response = await api.post(`/v1/agency-bank-deposits/`, data);
    return response.data;
  } catch (error) {

    throw error?.response?.data
  }
}

export const getAgencyBankDepositHistory = async (data: AgencyBankHistoryPagination) => {
  try {
    const response = await api.post(`/v1/agency-bank-deposits/fetch`, data);
    return response.data;
  } catch (error) {
    throw error?.response?.data
  }
}

export {
  getAllPaymentModes,
  getAllNonEnergyTypes,
  getLevelsDiscomId,
  createAgency,
  getLevels,
  getAgenciesWithDiscom,
  rechargeAgency,
  editAgency, activateAgencyAccount, deactivateAgencyAccountAPI, getAgencyById, extendValidity, getAgentDetailsById, changeAgentRole
};
