import { urlsListWithTitle } from "./lib/utils";

export const listOfUrlForScopes = [
  { url: urlsListWithTitle.dashboard.url, backendScopeName: "TPCollectionWebPortal:dashboard:ALL" },
  { url: "/department/add-agency", backendScopeName: "TPCollectionWebPortal:agency:CREATE" },
  { url: "/department/recharge", backendScopeName: "TPCollectionWebPortal:agency:RECHARGE_WALLET" },
  { url: "/department/recharge", backendScopeName: "TPCollectionWebPortal:agency:REVERSE_WALLET" },
  { url: "/department/edit-agent-area", backendScopeName: "TPCollectionWebPortal:agent:EDIT_COLLECTOR_ROLE" },
  { url: "/department/edit-agency", backendScopeName: "TPCollectionWebPortal:agency:EDIT" },
  { url: "/department/extend-validity", backendScopeName: "TPCollectionWebPortal:agency:EXTEND_VALIDITY" },
  { url: "/department/view-agency", backendScopeName: "TPCollectionWebPortal:agency:READ" },
  { url: "/department/view-balance", backendScopeName: "TPCollectionWebPortal:agency:READ" },
  { url: "/department/edit-agency-area", backendScopeName: "TPCollectionWebPortal:agency:CHANGE_AREA" },
  { url: "/department/agency-display-balance", backendScopeName: "TPCollectionWebPortal:agency-balance:READ" },
  { url: "/department/deactivate-agency", backendScopeName: "TPCollectionWebPortal:agency:DEACTIVATE" },
  { url: "/department/activate-agency", backendScopeName: "TPCollectionWebPortal:agency:ACTIVATE" },
  { url: "/department/reset-device", backendScopeName: "TPCollectionWebPortal:agent:RESET_COLLECTOR_DEVICE" },
  { url: "/department/bank-deposit", backendScopeName: "TPCollectionWebPortal:agency_bank_deposit:ALL" },
  { url: "/agency/bank-deposit", backendScopeName: "TPCollectionWebPortal:agent_bank_deposit:ALL" },
  { url: "/department/cancel-receipt", backendScopeName: "TPCollectionWebPortal:collection:CANCEL_RECEIPT" },
  { url: "/admin/create-new-user", backendScopeName: "TPCollectionWebPortal:user:CREATE" },
  { url: "/admin/office-structure", backendScopeName: "TPCollectionWebPortal:office_structure:ALL" },
  { url: "/agency/binder-mapping", backendScopeName: "TPCollectionWebPortal:agent_pseudo_mapping:ALL" },
  { url: "/admin/mode-of-payment", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/denied-to-pay", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/non-energy-type", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/add-collector-type", backendScopeName: "TPCollectionWebPortal:agent:EDIT_COLLECTOR_ROLE" },
  { url: "/admin/color-coding/logic", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/color-coding/bill-basis", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/color-coding/ecl-flag-customer", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/incentive", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/import", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/admin/receipt-for-postpaid", backendScopeName: "TPCollectionWebPortal:business_rules:ALL" },
  { url: "/report/agency-wallet-history-report", backendScopeName: "TPCollectionWebPortal:agency_wallet_history_report:READ" },
  { url: "/report/agent-wallet-history-report", backendScopeName: "TPCollectionWebPortal:agent_wallet_history_report:READ" },
  { url: "/agency/add-collector", backendScopeName: "TPCollectionWebPortal:agent:CREATE" },
  { url: "/agency/view-collector", backendScopeName: "TPCollectionWebPortal:agent:READ" },
  { url: "/agency/recharge", backendScopeName: "TPCollectionWebPortal:agent:RECHARGE_WALLET" },
  { url: "/agency/extend-validity", backendScopeName: "TPCollectionWebPortal:agent:EXTEND_VALIDITY" },
  { url: "/agency/edit-collector", backendScopeName: "TPCollectionWebPortal:agent:EDIT" },
  { url: "/agency/activate-agent", backendScopeName: "TPCollectionWebPortal:agent:ACTIVATE" },
  { url: "/agency/deactivate-agent", backendScopeName: "TPCollectionWebPortal:agent:DEACTIVATE" },
  { url: "/report/billing-report", backendScopeName: "TPCollectionWebPortal:billing_report:READ" },
  { url: "/dashboard", backendScopeName: "TPCollectionWebPortal:dashboard:ALL" }
];



export const checkIfUserHasAccessToPage = ({ backendScope, currentUrl }) => {
  const foundScope = listOfUrlForScopes.find((item) => item.url === currentUrl);
  // return true
  if (!foundScope) return false;

  return backendScope.includes(foundScope.backendScopeName);
};

//write code for checking other than pages