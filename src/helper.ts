import { urlsListWithTitle } from "./lib/utils";

export const listOfUrlForScopes = [
  {
    url: urlsListWithTitle.dashboard.url,
    backendScopeName: "TPCollectionWebPortal:dashboard:ALL",
  },
  {
    url: "/department/add-agency",
    backendScopeName: "TPCollectionWebPortal:agency:CREATE",
  },
  {
    url: "/department/recharge",
    backendScopeName: "TPCollectionWebPortal:agency:RECHARGE_WALLET",
  },
  {
    url: "/department/recharge",
    backendScopeName: "TPCollectionWebPortal:agency:REVERSE_WALLET",
  },
  {
    url: "/department/edit-agent-area",
    backendScopeName: "TPCollectionWebPortal:agent:CHANGE_ROLE",
  },
  {
    url: "/department/edit-agency",
    backendScopeName: "TPCollectionWebPortal:agency:EDIT",
  },
  {
    url: "/department/extend-validity",
    backendScopeName: "TPCollectionWebPortal:agency:EXTEND_VALIDITY",
  },
  {
    url: "/department/view-agency",
    backendScopeName: "TPCollectionWebPortal:agency:READ",
  },
  {
    url: "/department/view-agency/history",
    backendScopeName: "TPCollectionWebPortal:agency:READ",
  },
  {
    url: "/department/edit-agency-area",
    backendScopeName: "TPCollectionWebPortal:agency:CHANGE_AREA",
  },
  {
    url: "/agency/edit-agent-area",
    backendScopeName: "TPCollectionWebPortal:agent:CHANGE_AREA",
  },
  {
    url: "/department/agency-display-balance",
    backendScopeName: "TPCollectionWebPortal:agency-balance:READ",
  }, //action
  {
    url: "/department/deactivate-agency",
    backendScopeName: "TPCollectionWebPortal:agency:DEACTIVATE",
  }, //action
  {
    url: "/department/activate-agency",
    backendScopeName: "TPCollectionWebPortal:agency:ACTIVATE",
  }, //action
  {
    url: "/department/reset-device",
    backendScopeName: "TPCollectionWebPortal:agent:RESET_COLLECTOR_DEVICE",
  },
  {
    url: "/department/bank-deposit",
    backendScopeName: "TPCollectionWebPortal:agency_bank_deposit:ALL",
  },
  {
    url: "/agency/bank-deposit",
    backendScopeName: "TPCollectionWebPortal:agent_bank_deposit:ALL",
  },
  {
    url: "/department/cancel-receipt",
    backendScopeName: "TPCollectionWebPortal:collection:CANCEL_RECEIPT",
  }, //not developed
  {
    url: "/admin/create-new-user",
    backendScopeName: "TPCollectionWebPortal:user:CREATE",
  },
  {
    url: "/admin/create-new-user/add",
    backendScopeName: "TPCollectionWebPortal:user:CREATE",
  },
  {
    url: "/admin/office-structure",
    backendScopeName: "TPCollectionWebPortal:office_structure:ALL",
  },
  {
    url: "/agency/binder-mapping",
    backendScopeName: "TPCollectionWebPortal:agent_pseudo_mapping:ALL",
  },
  {
    url: "/admin/receipt-for-postpaid",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/receipt-for-postpaid/add",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/receipt-for-postpaid/edit",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding/logic",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding/logic/add",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding/bill-basis",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding/bill-basis/add",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding/ecl-flag-customer",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/color-coding/digital-payment-mode",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/mode-of-payment",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/mode-of-payment/add",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/denied-to-pay",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/denied-to-pay/setup",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/non-energy-type",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/non-energy-type/add",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/add-collector-type",
    backendScopeName: "TPCollectionWebPortal:collector_types:WRITE",
  },
  {
    url: "/admin/add-collector-type/setup",
    backendScopeName: "TPCollectionWebPortal:collector_types:WRITE",
  },
  {
    url: "/admin/incentive",
    backendScopeName:
      "TPCollectionWebPortal:collector_incentive_applicability:ALL",
  },
  {
    url: "/admin/incentive/add",
    backendScopeName:
      "TPCollectionWebPortal:collector_incentive_applicability:ALL",
  },
  {
    url: "/admin/incentive/edit",
    backendScopeName:
      "TPCollectionWebPortal:collector_incentive_applicability:ALL",
  },
  {
    url: "/admin/import",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/import/minimum-payable-amount-mapping",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/import/ecl-consumer",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/admin/import/collector-mapping",
    backendScopeName: "TPCollectionWebPortal:business_rules:ALL",
  },
  {
    url: "/report/agency-wallet-history",
    backendScopeName: "TPCollectionWebPortal:agency_wallet_history_report:READ",
  },
  {
    url: "/report/agent-wallet-history",
    backendScopeName: "TPCollectionWebPortal:agent_wallet_history_report:READ",
  },
  {
    url: "/agency/add-collector",
    backendScopeName: "TPCollectionWebPortal:agent:CREATE",
  },
  {
    url: "/agency/view-collector",
    backendScopeName: "TPCollectionWebPortal:agent:VIEW",
  },
  {
    url: "/agency/recharge",
    backendScopeName: "TPCollectionWebPortal:agent:RECHARGE_WALLET",
  },
  {
    url: "/agency/reverse-agent-balance",
    backendScopeName: "TPCollectionWebPortal:agent:REVERSE_WALLET",
  },
  {
    url: "/agency/extend-validity",
    backendScopeName: "TPCollectionWebPortal:agent:EXTEND_VALIDITY",
  },
  {
    url: "/agency/edit-collector",
    backendScopeName: "TPCollectionWebPortal:agent:EDIT",
  },
  {
    url: "/agency/activate-agent",
    backendScopeName: "TPCollectionWebPortal:agent:ACTIVATE",
  },
  {
    url: "/agency/deactivate-agent",
    backendScopeName: "TPCollectionWebPortal:agent:DEACTIVATE",
  },
  {
    url: "/report/billing-report",
    backendScopeName: "TPCollectionWebPortal:billing_report:READ",
  },
  {
    url: "/agency/agent-deposit-acknowledgement",
    backendScopeName:
      "TPCollectionWebPortal:agent_deposit_acknowledgement:PENDING",
  },
  {
    url: "/report/agent-deposit-acknowledgement",
    backendScopeName:
      "TPCollectionWebPortal:agent_deposit_acknowledgement:READ",
  },
  {
    url: "/report/agent-bank-deposit",
    backendScopeName: "TPCollectionWebPortal:agent_bank_deposit:READ",
  },
  {
    url: "/agency/add-new-supervisor",
    backendScopeName: "TPCollectionWebPortal:supervisor:CREATE",
  },
  {
    url: "/report/daily-non-energy-collection",
    backendScopeName:
      "TPCollectionWebPortal:non_energy_daily_collection_report:READ",
  },
  {
    url: "/report/daily-energy-collection",
    backendScopeName:
      "TPCollectionWebPortal:energy_daily_collection_report:READ",
  },
  {
    url: "/report/denied-non-energy-consumer",
    backendScopeName:
      "TPCollectionWebPortal:non_energy_denied_consumers_report:READ",
  },
  {
    url: "/report/denied-energy-consumer",
    backendScopeName:
      "TPCollectionWebPortal:energy_denied_consumers_report:READ",
  },
  { url: "/report/mmi", backendScopeName: "TPCollectionWebPortal:mmi:VIEW" },
  {
    url: "/report/energy-collection-summary",
    backendScopeName:
      "TPCollectionWebPortal:energy_collection_summary_report:READ",
  },
  {
    url: "/report/non-energy-collection-summary",
    backendScopeName:
      "TPCollectionWebPortal:non_energy_collection_summary_report:READ",
  },
  {
    url: "/admin/cancel-transaction",
    backendScopeName: "TPCollectionWebPortal:cancel_receipt:ALL",
  },
  {
    url: "/report/agent-wise-summary",
    backendScopeName:
      "TPCollectionWebPortal:energy_agent_wise_summary_report:READ",
  },
  {
    url: "/report/agent-attendance",
    backendScopeName:
      "TPCollectionWebPortal:energy_agent_attendance_report:READ",
  },
  {
    url: "/report/cancelled-transaction",
    backendScopeName: "TPCollectionWebPortal:cancel_transaction_report:READ",
  },
  {
    url: "/report/agent-details",
    backendScopeName: "TPCollectionWebPortal:agent_details_report:READ",
  },
  {
    url: "/add-news",
    backendScopeName: "TPCollectionWebPortal:news_notice:ALL",
  },
  {
    url: "/admin/update-pos",
    backendScopeName: "TPCollectionWebPortal:pos_device_update:READ",
  },
  {
    url: "/report/agent-login",
    backendScopeName: "TPCollectionWebPortal:agent_login_history_report:READ",
  },
  {
    url: "/report/total-collection",
    backendScopeName: "TPCollectionWebPortal:total_collection_report:READ",
  },
  {
    url: "/report/collection-posting",
    backendScopeName: "TPCollectionWebPortal:collection_posting_report:READ",
  },
  {
    url: "/report/reconciliation",
    backendScopeName: "TPCollectionWebPortal:reconciliation_report:READ",
  },
  {
    url: "/report/reconciliation",
    backendScopeName: "TPCollectionWebPortal:reconciliation_report:READ",
  },
  {
    url: "/agency/supervisor-deposit",
    backendScopeName: "TPCollectionWebPortal:supervisor_bank_deposit:ALL",
  },
  {
    url: "/report/supervisor-bank-deposit",
    backendScopeName: "TPCollectionWebPortal:supervisor_bank_deposit:READ",
  },
  {
    url: "/report/transaction-details",
    backendScopeName: "TPCollectionWebPortal:transaction_details_report:READ",
  },
  {
    url: "/department/agency-security-deposit",
    backendScopeName: "TPCollectionWebPortal:agency_security_deposit:READ",
  },
  {
    url: "/admin/agent-transfer",
    backendScopeName: "TPCollectionWebPortal:agent:TRANSFER",
  },
  {
    url: "/report/agency-mid-night-balance",
    backendScopeName: "TPCollectionWebPortal:agency-midnight-balance-report:READ",
  },
  {
    url: '/report/digital-payment-collection',
    backendScopeName: "TPCollectionWebPortal:digital_collection_report:READ",
  },
  {
    url: '/report/agency-payment-modewise-summary',
    backendScopeName: "TPCollectionWebPortal:agency_pay_mode_wise_report:READ",
  },
  {
    url: '/report/summary-report',
    backendScopeName: "TPCollectionWebPortal:energy_summary_report:READ",
  },
  { url: "/", backendScopeName: "" },
];

export const checkIfUserHasAccessToPage = ({
  backendScope = [],
  currentUrl,
}) => {
  if (currentUrl === "/") {
    return true;
  }
  const foundScope = listOfUrlForScopes.find((item) => item.url === currentUrl);
  // return true
  if (!foundScope) return false;

  return backendScope?.includes(foundScope?.backendScopeName);
};

export const listOfActionScopes = [
  {
    action: "dashboardBillUploadHistory",
    backendScopeName:
      "TPCollectionWebPortal:dashboard-bill-upload-history:READ",
  },
  {
    action: "dashboardTransactionSummary",
    backendScopeName:
      "TPCollectionWebPortal:dashboard-transaction-summary:READ",
  },
  {
    action: "dashboardPerformanceSummary",
    backendScopeName:
      "TPCollectionWebPortal:dashboard-performance-summary:READ",
  },
  {
    action: "disableVendorCode",
    backendScopeName: "TPCollectionWebPortal:agency:EDIT_WITHOUT_VENDOR_ID",
  },
  {
    action: "enabledUpdatePos",
    backendScopeName: "TPCollectionWebPortal:pos_device_update:EDIT",
  },
  {
    action: "readNewsNotice",
    backendScopeName: "TPCollectionWebPortal:news_notice:READ",
  },
  {
    action: "addOrEditAgent",
    backendScopeName: "TPCollectionWebPortal:agent:EDIT_WITH_AGENCY",
  },
  {
    action: "disabledAadharEdit",
    backendScopeName: "TPCollectionWebPortal:agent:EDIT_WITHOUT_AADHAR_NO",
  },
  {
    action: "disabledVendorIdEdit",
    backendScopeName: "TPCollectionWebPortal:agent:EDIT_WITHOUT_VENDOR_ID",
  },
];

export const checkIfUserHasActionAccess = ({
  backendScope = [],
  currentAction,
}) => {
  const foundScope = listOfActionScopes.find(
    (item) => item.action === currentAction
  );
  // return true
  if (!foundScope) return false;

  return backendScope?.includes(foundScope?.backendScopeName);
};

export const hideMenuAccordionItem = (
  title,
  urlList = [],
  backendScope = []
) => {
  const anyVisible = urlList.some((item) => {
    const showThisMenu = checkIfUserHasAccessToPage({
      backendScope,
      currentUrl: item?.url,
    });
    if (showThisMenu) {
      return true;
    }
    return false;
  });

  return !anyVisible;
};

export const getLandingPageUrl = (backendScope = []) => {
  return "/";
  if (
    checkIfUserHasAccessToPage({
      backendScope,
      currentUrl: urlsListWithTitle?.agencyNews?.url,
    })
  ) {
    return urlsListWithTitle?.agencyNews?.url;
  } else return urlsListWithTitle.dashboard.url;
};
