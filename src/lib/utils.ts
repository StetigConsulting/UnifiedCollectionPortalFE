import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateCaptcha = () => {
  const alphabets = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz!@#$%^&*()";
  const first = alphabets[Math.floor(Math.random() * alphabets.length)];
  const second = Math.floor(Math.random() * 10);
  const third = Math.floor(Math.random() * 10);
  const fourth = alphabets[Math.floor(Math.random() * alphabets.length)];
  const fifth = alphabets[Math.floor(Math.random() * alphabets.length)];
  const sixth = Math.floor(Math.random() * 10);

  const newCaptcha = first + second + third + fourth + fifth + sixth;
  return newCaptcha;
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleString('en-US', options);
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
  let i = 0;

  while (integerPart > 0) {
    const chunk = integerPart % 1000;
    if (chunk > 0) {
      result = convertToWords(chunk) + (thousands[i] ? " " + thousands[i] : "") + (result ? " " + result : "");
    }
    integerPart = Math.floor(integerPart / 1000);
    i++;
  }

  result = result.trim();
  result += " rupees";

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
    title: 'Add Collector'
  },
  viewCollectorList: {
    url: '/agency/view-collector',
    title: 'View Collector'
  },
  agencyRecharge: {
    url: '/department/recharge',
    title: 'Recharge'
  },
  agencyBalanceHistory: {
    url: '/department/view-balance/history',
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
    title: 'Create New User'
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
  }
};

export function getTitleByUrl(url) {
  const cleanUrl = url.split('?')[0];
  const entry = Object.values(urlsListWithTitle).find(item => item.url === cleanUrl);
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
  { value: 'pdf', label: 'PDF' }
]

export const dateTypePicklist = [
  { label: 'Transaction Date', value: 'transaction_date' },
  { label: 'Upload Date', value: 'upload_date' }
]