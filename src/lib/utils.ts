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

export const levelWIthId = {
  "CIRCLE": '65',
  "DIVISION": '66',
  "SUB_DIVISION": '67',
  "SECTION": '68',
  "BINDER": '21',
  "MRU": '20',
  "Pratik Test": '50'
}

export const levelWIthIdInt = {
  "CIRCLE": 65,
  "DIVISION": 66,
  "SUB_DIVISION": 67,
  "SECTION": 68,
  "BINDER": 21,
}

export const testDiscom = '1001';

export const testAgencyId = 30;

export function numberToWords(num: number): string {
  if (num === 0) return "zero";

  const belowTwenty = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = [
    "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion"];

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

  let result = "";
  let i = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      result = convertToWords(chunk) + (thousands[i] ? " " + thousands[i] : "") + (result ? " " + result : "");
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return result.trim();
}


export const SIGNIN = '/auth/signin';
export const ROOT = '/';

export const PUBLIC_ROUTES = [
  '/auth/signin'
]

export const PROTECTED_SUB_ROUTES = [

]

export const ADMIN_ONLY_ROUTES = [
  "/dashboard",
  "/department/add-agency",
  "/department/recharge",
  "/department/collector-type",
  "/department/edit-agency",
  "/department/edit-agency-area",
  "/department/edit-agent-area",
  "/department/extend-validity",
  "/department/view-agency",
  "/department/view-balance",
  "/department/reset-device",
  "/department/add-news",
]

export const SUPER_ADMIN_ONLY_ROUTES = [
  "/dashboard",
  "/admin/department-user",
  "/admin/office-structure",
  "/admin/mode-of-payment",
  "/admin/denied-to-pay",
  "/admin/non-energy-type",
  "/admin/add-collector-type",
  "/admin/color-coding",
  "/admin/incentive",
  "/admin/import",
  "/admin/receipt-for-postpaid"
];

export const AGENCY_ONLY_ROUTES = [
  "/dashboard",
  "/agency/add-collector",
  "/agency/view-collector",
  "/agency/binder-mapping",
  "/agency/recharge",
  "/agency/extend-validity",
  "/agency/reset-collector",
  "/report/top-up-history",
  "/report/collector-top-up-history",
  "/report/transaction-record",
  "/report/login-history",
  "/report/daily-agent-collection",
  "/report/agency-wise-collection",
  "/report/collector-wise",
  "/report/cancel-wise-receipt",
  "/report/denied-consumer",
  "/report/counter-collector",
  "/report/collector-activity",
  "/report/wallet-history",
  "/report/cc-wallet-history",
];

export const urlsListWithTitle = {
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