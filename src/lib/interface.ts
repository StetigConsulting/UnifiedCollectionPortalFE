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
    recharge_amount?: number,
    reverse_amount?: number,
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

export interface extendValidityInterface {
    agency_id: number;
    validity_from_date: string;
    validity_to_date: string;
}

export interface ReceiptForPostpaid {
    id?: number;
    discom_id: number;
    office_structure_id?: number;
    rule_level: string;
    rule_name: string;
    json_rule: {
        receipt_per_month_per_bill: number;
        second_receipt_different_payment_mode: boolean;
        receipt_per_day_per_bill: number;
    };
}

export interface Range {
    R1: {
        type: 'DAYS' | 'DATE';
        value: string | number;
    };
    R2: {
        type: 'DAYS' | 'DATE';
        value: string | number;
    };
    order: number;
    color_code: string;
}

export interface CreateColorCodingLogic {
    id?: number;
    discom_id: number;
    office_structure_id: number;
    rule_level: string;
    rule_name: string;
    json_rule: {
        ranges: Range[];
    };
}

export interface BillBasis {
    bill_type: string;
    color_code: string;
}
export interface CreateColorCodingBillBasis {
    id?: number;
    discom_id: number;
    office_structure_id: number;
    rule_level: string;
    rule_name: string;
    json_rule: {
        bill_basis: BillBasis[];
    };
}

export interface ECLFlaggedCustomerRule {
    id?: number;
    discom_id: number;
    office_structure_id: number;
    rule_level: string;
    rule_name: string;
    json_rule: {
        bg_color_code: string;
    };
}

export interface AddCounterCollector {
    agency_id: number;
    agent_name: string;
    primary_phone: string;
    secondary_phone: string;
    maximum_limit: number,
    validity_from_date: string;
    validity_to_date: string;
    collection_payment_modes: number[];
    working_level: number;
    collection_type_energy: boolean;
    collection_type_non_energy: boolean;
    is_active: boolean;
    non_energy_types: number[];
    working_level_office: number;
    collector_type: number;
    work_type: string;
    collector_role: string;
}

export interface ChangeCounterCollector {
    agent_id: number;
    collection_type_energy: boolean;
    collection_type_non_energy: boolean;
    non_energy_types?: number[];
}

export interface RechargeAgent {
    agent_id: number;
    recharge_amount: number;
    remarks: string;
}

export interface ExtendAgentValidity {
    agent_id: number;
    validity_from_date: string;
    validity_to_date: string;
}

interface ViewHistoryFilter {
    entity_type: string;
    from_date: string;
    to_date: string;
    entity_id: string | number;
}

export interface ViewHistoryPayload {
    page: number;
    page_size: number;
    filter: ViewHistoryFilter;
}

export interface EditAgencyArea {
    agency_id: number;
    working_level: number;
    working_office_structures: number[];
}

export interface EditAgentRoleArea {
    agent_id: number;
    collector_role: string;
    working_office_structure: number;
    working_level: number;
}

export interface UpdateBinder {
    agent_id: number;
    pseudo_office_structure: number[];
}

export interface EditCollector {
    agent_id: number;
    collection_payment_modes: number[];
    collection_type_energy: boolean;
    collection_type_non_energy: boolean;
    non_energy_types: number[];
    collector_type: number;
    work_type: string;
}