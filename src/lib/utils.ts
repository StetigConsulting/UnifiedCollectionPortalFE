import { clsx, type ClassValue } from "clsx"
import { BookOpenCheck } from "lucide-react";
import { twMerge } from "tailwind-merge"

export const reportIcon = BookOpenCheck


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateCaptcha = () => {
  const chars = "0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }
  return captcha;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export function numberToWords(num: number): string {
  if (num === 0 || Number.isNaN(num)) return "zero";

  const belowTwenty = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = [
    "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
  ];
  const thousands = ["", "thousand", "lakh", "crore"];

  const convertToWords = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return belowTwenty[n - 1];
    if (n < 100) {
      return tens[Math.floor(n / 10) - 2] + (n % 10 === 0 ? "" : " " + belowTwenty[n % 10 - 1]);
    }
    if (n < 1000) {
      return (
        belowTwenty[Math.floor(n / 100) - 1] +
        " hundred" +
        (n % 100 === 0 ? "" : " and " + convertToWords(n % 100))
      );
    }
    return "";
  };

  let integerPart = Math.floor(num);
  let decimalPart = Math.round((num % 1) * 100);
  let result = "";

  const parts = [];
  parts.push(integerPart % 1000);
  integerPart = Math.floor(integerPart / 1000);

  parts.push(integerPart % 100);
  integerPart = Math.floor(integerPart / 100);

  parts.push(integerPart % 100);
  integerPart = Math.floor(integerPart / 100);

  parts.push(integerPart);

  let i = parts.length - 1;
  for (let j = i; j >= 0; j--) {
    const chunk = parts[j];
    if (chunk > 0) {
      result += convertToWords(chunk) + (thousands[j] ? " " + thousands[j] : "") + " ";
    }
  }

  result = result.trim() + " rupees";

  if (decimalPart > 0) {
    const paisaWords = convertToWords(decimalPart);
    result += " and " + paisaWords + " paise";
  }

  return result;
}

export const SIGNIN = '/auth/signin';
export const ROOT = '/dashboard';

export const PUBLIC_ROUTES = [
  '/auth/signin'
]

export const urlsListWithTitle = {
  addCollectorForm: {
    url: '/agency/add-collector',
    title: 'Add Agent'
  },
  viewCollectorList: {
    url: '/agency/view-collector',
    title: 'View Agent'
  },
  agencyRecharge: {
    url: '/department/recharge',
    title: 'Recharge'
  },
  agencyBalanceHistory: {
    url: '/department/view-agency/history',
    title: 'History'
  },
  dashboard: {
    url: '/dashboard',
    title: 'Dashboard'
  },
  billBasis: {
    url: '/admin/color-coding/bill-basis',
    title: 'Bill Basis'
  },
  addBillBasis: {
    url: '/admin/color-coding/bill-basis/add',
    title: 'Add'
  },
  receiptForPostpaid: {
    url: '/admin/receipt-for-postpaid',
    title: 'Receipt For Postpaid'
  },
  receiptForPostpaidAdd: {
    url: '/admin/receipt-for-postpaid/add',
    title: 'Add'
  },
  receiptForPostpaidEdit: {
    url: '/admin/receipt-for-postpaid/edit',
    title: 'Edit'
  },
  modeOfPayment: {
    url: '/admin/mode-of-payment',
    title: 'Mode Of Payment'
  },
  modeOfPaymentAdd: {
    url: '/admin/mode-of-payment/add',
    title: 'Add'
  },
  deniedToPay: {
    url: '/admin/denied-to-pay',
    title: 'Denied To Pay'
  },
  deniedToPaySetup: {
    url: '/admin/denied-to-pay/setup',
    title: 'Setup'
  },
  excelImport: {
    url: '/admin/import',
    title: 'Excel Import'
  },
  eclConsummerWithArrearImport: {
    url: '/admin/import/ecl-consumer',
    title: 'Excel Import for ECL Consumer with Arrear'
  },
  consumerToMinimumPayableAmountMap: {
    url: '/admin/import/minimum-payable-amount-mapping',
    title: 'Consumer To Minimum Payable Amount Map'
  },
  consumerToCollectorMap: {
    url: '/admin/import/collector-mapping',
    title: 'Consumer To Collector Map'
  },
  collectorType: {
    url: '/admin/add-collector-type',
    title: 'Collector Type'
  },
  collectorTypeAdd: {
    url: '/admin/add-collector-type/setup',
    title: 'Add'
  },
  createNewUserTable: {
    url: '/admin/create-new-user',
    title: 'Portal User Management'
  },
  createNewUserForm: {
    url: '/admin/create-new-user/add',
    title: 'Add'
  },
  nonEnergyTypeTable: {
    url: '/admin/non-energy-type',
    title: 'Non Energy Type'
  },
  nonEnergyTypeForm: {
    url: '/admin/non-energy-type/add',
    title: 'Add'
  },
  incentive: {
    url: '/admin/incentive',
    title: 'Collector Incentive'
  },
  incentiveAdd: {
    url: '/admin/incentive/add',
    title: 'Add'
  },
  incentiveEdit: {
    url: '/admin/incentive/edit',
    title: 'Edit'
  },
  colorCodingLogicTable: {
    url: '/admin/color-coding/logic',
    title: 'Color Coding Logic'
  },
  agencyDashboard: {
    url: '/agency-dashboard',
    title: 'Home'
  },
  binderMapping: {
    url: '/agency/binder-mapping',
    title: 'MRU Mapping'
  },
  agencyNews: {
    url: '/new-notices',
    title: 'News'
  }
};

export function getTitleByUrl(url) {
  console.log(url)
  if (url.includes('type=reverse')) {
    return 'Reverse';
  }
  const cleanUrl = url.split('?')[0];
  const entry = Object.values(urlsListWithTitle).find(item => item.url === cleanUrl);
  console.log('entry', entry)
  return entry ? entry.title : cleanUrl.split('/').pop().replaceAll('-', ' ');
}

export const collectorRolePicklist = [
  {
    label: 'Door to Door',
    value: 'Door To Door'
  },
  {
    label: 'Counter Collector',
    value: 'Counter Collector'
  },
]

export const agentWorkingType = [
  { label: 'Online', value: 'Online' },
  { label: 'Offline', value: 'Offline' }
]

export const collectionTypePickList = [
  { label: 'Energy', value: 'Energy' },
  { label: 'Non Energy', value: 'Non Energy' }
]

export const getErrorMessage = (error: any) => {
  let errorMessage = error?.data ? error?.data[Object.keys(error?.data)[0]] : error?.error ? error?.error : error?.message;
  return errorMessage
}

export const getLevelIdWithLevelName = async (list: any) => {
  return list.reduce((acc, item) => {
    acc[item.id] = item.levelName;
    return acc;
  }, {});
}

export const getLevelFormattedForPicklist = (list) => {
  return list
    .filter((item) => item.levelType === "MAIN")
    .map((item) => ({
      label: item.levelName,
      value: item.levelName,
    }));
}

export const tableDataPerPage = 50;

export const addIncentiveOnPicklistValues = [
  { label: 'Current Amount', value: 'Current Amount' },
  { label: 'Arrear Amount', value: 'Arrear Amount' },
]

export const addIncentiveOnKeyValue = {
  currentAmount: 'Current Amount',
  arrearAmount: 'Arrear Amount',
  bothAmount: 'Current Amount,Arrear Amount'
}

export const exportPicklist = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
  // { value: 'pdf', label: 'PDF' }
]

export const exportPicklistWithPdf = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'pdf', label: 'PDF' }
]

export const dateTypePicklist = [
  { label: 'Transaction Date', value: 'transaction_date' },
  { label: 'Upload Date', value: 'upload_date' }
]

export const viewTypePicklist = [
  { label: 'Datewise Summary', value: 'DateWise' },
  { label: 'Monthwise Summary', value: 'MonthWise' },
  { label: 'Total Summary', value: 'Total' }
]

export const agentRolePicklist = [
  { label: 'Door To Door', value: 'Door To Door' },
  { label: 'Counter Collector', value: 'Counter Collector' }
]

export const cancelTransactionTypePicklist = [
  {
    label: 'Money Receipt Number',
    value: 'MoneyReceipt',
  },
  {
    label: 'Transaction ID',
    value: 'TransactionID',
  },
  {
    label: 'Consumer No.',
    value: 'ServiceConnectionNumber',
  }
]

export const agentReportKeyValue = {
  agentWise: 'agent_wise',
  agentType: 'agent_type',
  agentMode: 'agent_mode',
  agentRole: 'agent_role',
}

export const agentWiseReportTypePicklist = [
  {
    label: 'Agent Wise',
    value: agentReportKeyValue.agentWise
  },
  {
    label: 'Agent Type',
    value: agentReportKeyValue.agentType
  },
  {
    label: 'Agent Mode',
    value: agentReportKeyValue.agentMode
  },
  {
    label: 'Agent Role',
    value: agentReportKeyValue.agentRole
  }
]

export const reportTypeMappedToAPITRouteName = {
  [agentReportKeyValue.agentWise]: 'agent-wise-summary-report',
  [agentReportKeyValue.agentType]: 'agent-type-wise-summary-report',
  [agentReportKeyValue.agentMode]: 'agent-mode-wise-summary-report',
  [agentReportKeyValue.agentRole]: 'agent-role-wise-summary-report',
}

export const agencyStatusType = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
]