import { AgencyDataInterface, editAgencyInterface, rechargeAgencyInterface } from "@/lib/interface";
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_V2,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const getLevelsDiscomId = async (id: string) => {
  try {
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/office-structures/${id}/next-level`
    );
    return response.json();
  } catch (e) {
    throw e;
  }
};

const getLevels = async (id: string) => {
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
    console.log(error);
    throw error?.response?.data
  }
};

const getAgenciesWithDiscom = async (Id: string) => {
  try {
    const response = await api.get(`/agencies/discom/${Id}`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error?.response?.data
  }
};

const rechargeAgency = async (agencyData: rechargeAgencyInterface) => {
  try {
    const response = await api.put('/agencies/recharge-wallet', agencyData);
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error?.response?.data
  }
};

const editAgency = async (agencyData: editAgencyInterface) => {
  try {
    const response = await api.put('/agencies/', agencyData);
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error?.response?.data
  }
};

const activateAgencyAccount = async (agencyData: number) => {
  try {
    const response = await api.put('/agencies/activate', { id: agencyData });
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error?.response?.data
  }
};

const deactivateAgencyAccountAPI = async (agencyData: number) => {
  try {
    const response = await api.put('/agencies/deactivate', { id: agencyData });
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error?.response?.data
  }
};

export {
  getAllPaymentModes,
  getAllNonEnergyTypes,
  getLevelsDiscomId,
  createAgency,
  getLevels,
  getAgenciesWithDiscom,
  rechargeAgency,
  editAgency, activateAgencyAccount, deactivateAgencyAccountAPI
};
