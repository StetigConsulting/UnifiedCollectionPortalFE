import api from "@/lib/axios";
import { AddAgencyBankDeposit, AgencyDataInterface, ChangeCounterCollector, EditAgencyArea, editAgencyInterface, EditAgentRoleArea, extendValidityInterface, rechargeAgencyInterface, ViewHistoryPayload } from "@/lib/interface";


const getAllPaymentModes = async () => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/payment-modes`
    );

    return response.json();
  } catch (e) {
    throw e;
  }
};

const getAllNonEnergyTypes = async () => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/non-energy-types`
    );

    return response.json();
  } catch (e) {
    throw e;
  }
};

const getLevelsDiscomId = async (id: number) => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structures/${id}/next-level`
    );
    return response.json();
  } catch (e) {
    throw e;
  }
};

const getLevels = async (id: number) => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structure-levels/${id}`
    );
    return response.json();
  } catch (e) {
    throw e;
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

const getAgencyById = async (Id: string) => {
  try {
    const response = await api.get(`/agencies/${Id}`);
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
