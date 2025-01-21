export interface AgencyDataInterface {
    user_id: number;
    discom_id: number;
    agency_name: string;
    agency_address: string;
    wo_number: string;
    email_id?: string;
    contact_person: string;
    phone: string;
    maximum_limit: number;
    max_agent: number;
    validity_from_date: string;
    validity_to_date: string;
    payment_date?: string;
    transaction_id?: string;
    security_deposit_payment_mode?: number;
    payment_remarks?: string;
    collection_payment_modes?: number[];
    working_level: number;
    vendor_id?: string;
    collection_type_energy: boolean;
    collection_type_non_energy: boolean;
    is_active: boolean;
    non_energy_types?: number[];
    working_level_offices: number[];
    collector_types?: number[];
}

export interface rechargeAgencyInterface {
    id: number,
    recharge_amount: number,
    remarks: string
}

export interface editAgencyInterface {
    id: number;
    user_id: number;
    agency_name: string;
    agency_address: string;
    wo_number: string;
    phone: string;
    maximum_limit: number;
    max_agent: number;
}
