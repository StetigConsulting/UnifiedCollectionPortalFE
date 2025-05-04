import { urlsListWithTitle } from "./lib/utils";

export const listOfUrlForScopes = [
  { url: urlsListWithTitle.dashboard.url, backendScopeName: "TPCollectionWebPortal:dashboard:ALL" },
  { url: "/department/add-agency", backendScopeName: "TPCollectionWebPortal:agency:CREATE" },
  { url: "/department/recharge", backendScopeName: "TPCollectionWebPortal:agency:RECHARGE_WALLET" },
  { url: "/department/recharge", backendScopeName: "TPCollectionWebPortal:agency:REVERSE_WALLET" },
  { url: "/department/edit-agent-area", backendScopeName: "TPCollectionWebPortal:agent:CHANGE_ROLE" },
  { url: "/department/edit-agency", backendScopeName: "TPCollectionWebPortal:agency:EDIT" },
  { url: "/department/extend-validity", backendScopeName: "TPCollectionWebPortal:agency:EXTEND_VALIDITY" },
  { url: "/department/view-agency", backendScopeName: "TPCollectionWebPortal:agency:READ" },
  { url: "/department/view-balance", backendScopeName: "TPCollectionWebPortal:agency:READ" },
  { url: "/department/edit-agency-area", backendScopeName: "TPCollectionWebPortal:agency:CHANGE_AREA" },
  { url: "/department/agency-display-balance", backendScopeName: "TPCollectionWebPortal:agency-balance:READ" },//action
  { url: "/department/deactivate-agency", backendScopeName: "TPCollectionWebPortal:agency:DEACTIVATE" },//action
  { url: "/department/activate-agency", backendScopeName: "TPCollectionWebPortal:agency:ACTIVATE" },//action
  { url: "/department/reset-device", backendScopeName: "TPCollectionWebPortal:agent:RESET_COLLECTOR_DEVICE" },
  { url: "/department/bank-deposit", backendScopeName: "TPCollectionWebPortal:agency_bank_deposit:ALL" },
  { url: "/agency/bank-deposit", backendScopeName: "TPCollectionWebPortal:agent_bank_deposit:ALL" },
  { url: "/department/cancel-receipt", backendScopeName: "TPCollectionWebPortal:collection:CANCEL_RECEIPT" },//not developed
  { url: "/admin/create-new-user", backendScopeName: "TPCollectionWebPortal:user:CREATE" },
  { url: "/admin/office-structure", backendScopeName: "TPCollectionWebPortal:office_structure:ALL" },
  { url: "/agency/binder-mapping", backendScopeName: "TPCollectionWebPortal:agent_pseudo_mapping:ALL" },
  { url: "/admin/receipt-for-postpaid", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/color-coding", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/color-coding/logic", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/color-coding/bill-basis", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/color-coding/ecl-flag-customer", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/mode-of-payment", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/denied-to-pay", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/non-energy-type", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/add-collector-type", backendScopeName: "TPCollectionWebPortal:collector_types:WRITE" },
  { url: "/admin/incentive", backendScopeName: "TPCollectionWebPortal:collector_incentive_applicability:ALL" },
  { url: "/admin/import", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/report/agency-wallet-history", backendScopeName: "TPCollectionWebPortal:agency_wallet_history_report:READ" },
  { url: "/report/agent-wallet-history", backendScopeName: "TPCollectionWebPortal:agent_wallet_history_report:READ" },
  { url: "/agency/add-collector", backendScopeName: "TPCollectionWebPortal:agent:CREATE" },
  { url: "/agency/view-collector", backendScopeName: "TPCollectionWebPortal:agent:VIEW" },
  { url: "/agency/recharge", backendScopeName: "TPCollectionWebPortal:agent:RECHARGE_WALLET" },
  { url: "/agency/reverse-agent-balance", backendScopeName: "TPCollectionWebPortal:agent:REVERSE_WALLET" },
  { url: "/agency/extend-validity", backendScopeName: "TPCollectionWebPortal:agent:EXTEND_VALIDITY" },
  { url: "/agency/edit-collector", backendScopeName: "TPCollectionWebPortal:agent:EDIT" },
  { url: "/agency/activate-agent", backendScopeName: "TPCollectionWebPortal:agent:ACTIVATE" },
  { url: "/agency/deactivate-agent", backendScopeName: "TPCollectionWebPortal:agent:DEACTIVATE" },
  { url: "/report/billing-report", backendScopeName: "TPCollectionWebPortal:billing_report:READ" },
  { url: "/agency/agent-deposit-acknowledgement", backendScopeName: "TPCollectionWebPortal:agent_deposit_acknowledgement:PENDING" },
  { url: "/report/agent-deposit-acknowledgement", backendScopeName: "TPCollectionWebPortal:agent_deposit_acknowledgement:READ" },
  { url: "/report/agent-bank-deposit", backendScopeName: "TPCollectionWebPortal:agent_bank_deposit:READ" },
  { url: "/agency/add-new-supervisor", backendScopeName: "TPCollectionWebPortal:supervisor:CREATE" },
  { url: "/report/daily-non-energy-collection", backendScopeName: "TPCollectionWebPortal:non_energy_daily_collection_report:READ" },
  { url: "/report/daily-energy-collection", backendScopeName: "TPCollectionWebPortal:energy_daily_collection_report:READ" },
  { url: "/report/denied-non-energy-consumer", backendScopeName: "TPCollectionWebPortal:non_energy_denied_consumers_report:READ" },
  { url: "/report/denied-energy-consumer", backendScopeName: "TPCollectionWebPortal:energy_denied_consumers_report:READ" },
  { url: "/report/mmi", backendScopeName: "TPCollectionWebPortal:mmi:VIEW" },
  { url: "/report/energy-collection-summary", backendScopeName: "TPCollectionWebPortal:energy_collection_summary_report:READ" },
  { url: "/report/non-energy-collection-summary", backendScopeName: "TPCollectionWebPortal:non_energy_collection_summary_report:READ" },
  { url: '/admin/cancel-transaction', backendScopeName: 'TPCollectionWebPortal:cancel_receipt:ALL' },
  { url: '/report/agent-wise-summary', backendScopeName: 'TPCollectionWebPortal:energy_agent_wise_summary_report:READ' },
];



export const checkIfUserHasAccessToPage = ({ backendScope = [], currentUrl }) => {
  const foundScope = listOfUrlForScopes.find((item) => item.url === currentUrl);
  // return true
  if (!foundScope) return false;

  return backendScope?.includes(foundScope?.backendScopeName);
};

export const listOfActionScopes = [
  { action: 'dashboardBillUploadHistory', backendScopeName: 'TPCollectionWebPortal:dashboard-bill-upload-history:READ' },
  { action: 'dashboardTransactionSummary', backendScopeName: 'TPCollectionWebPortal:dashboard-transaction-summary:READ' },
  { action: 'dashboardPerformanceSummary', backendScopeName: 'TPCollectionWebPortal:dashboard-performance-summary:READ' },
]

export const checkIfUserHasActionAccess = ({ backendScope = [], currentAction }) => {
  const foundScope = listOfActionScopes.find((item) => item.action === currentAction);
  // return true
  if (!foundScope) return false;

  return backendScope?.includes(foundScope?.backendScopeName);
}

export const hideMenuAccordionItem = (title, urlList = [], backendScope = []) => {
  const anyVisible = urlList.some((item) => {
    const showThisMenu = checkIfUserHasAccessToPage({
      backendScope,
      currentUrl: item?.url
    });
    if (showThisMenu) {
      return true;
    }
    return false;
  });

  return !anyVisible; // if at least one is visible, don't hide
};